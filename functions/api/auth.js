/**
 * GitHub OAuth proxy for Decap CMS on Cloudflare Pages.
 *
 * Required Pages secrets:
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 *
 * GitHub OAuth App callback URL must match the site you open /admin on, e.g.:
 *   https://pankajchouhan.dev/api/auth
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders('*'),
    });
  }

  if (!clientId || !clientSecret) {
    return new Response(
      'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Cloudflare Pages.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const error = url.searchParams.get('error');
  if (error) {
    return oauthPage('error', { error });
  }

  const code = url.searchParams.get('code');
  if (!code) {
    // Start GitHub OAuth. Decap opens this URL in a popup.
    const redirectUri = `${url.origin}/api/auth`;
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.searchParams.set('client_id', clientId);
    authorize.searchParams.set('scope', 'repo,user');
    authorize.searchParams.set('redirect_uri', redirectUri);
    return Response.redirect(authorize.toString(), 302);
  }

  // Exchange the temporary code for an access token.
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${url.origin}/api/auth`,
    }),
  });

  const payload = await tokenResponse.json();

  if (!payload.access_token) {
    return oauthPage('error', {
      error: payload.error_description || payload.error || 'token_exchange_failed',
    });
  }

  return oauthPage('success', { token: payload.access_token, provider: 'github' });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function oauthPage(status, content) {
  // Decap's handshake (decap-cms-lib-auth):
  // 1) popup sends "authorizing:github"
  // 2) parent echoes that message back to the popup
  // 3) popup then sends "authorization:github:success:{token JSON}"
  // Posting success immediately (without the handshake) leaves the login screen stuck.
  const provider = 'github';
  const successMessage = JSON.stringify(
    `authorization:${provider}:${status}:${JSON.stringify(content)}`,
  );
  const authorizingMessage = JSON.stringify(`authorizing:${provider}`);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>GitHub authorization</title>
  </head>
  <body>
    <p>Authentication ${status}. Completing login&hellip;</p>
    <script>
      (function () {
        function receiveMessage(e) {
          // Parent echoed "authorizing:github" — now send the token to that origin.
          console.log("decap oauth handshake reply", e.origin, e.data);
          window.opener.postMessage(${successMessage}, e.origin);
        }

        window.addEventListener("message", receiveMessage, false);

        // Start handshake with Decap parent window.
        console.log("decap oauth: sending", ${authorizingMessage});
        if (window.opener) {
          window.opener.postMessage(${authorizingMessage}, "*");
        } else {
          document.body.innerHTML =
            "<p>Login popup lost its opener. Close this window and try Login with GitHub again.</p>";
        }
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Avoid COOP breaking window.opener after the GitHub redirect.
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      ...corsHeaders('*'),
    },
  });
}
