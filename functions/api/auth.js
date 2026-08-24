/**
 * GitHub OAuth proxy for Decap CMS on Cloudflare Pages.
 *
 * Required Pages environment variables (Production + Preview):
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 *
 * GitHub OAuth App callback URL must be:
 *   https://YOUR_DOMAIN/api/auth
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(url.origin),
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
    return oauthPage('error', { error }, url.origin);
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

  // GitHub redirected back with a temporary code — exchange it for a token.
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
    return oauthPage(
      'error',
      {
        error: payload.error_description || payload.error || 'token_exchange_failed',
      },
      url.origin,
    );
  }

  return oauthPage(
    'success',
    { token: payload.access_token, provider: 'github' },
    url.origin,
  );
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function oauthPage(status, content, origin) {
  // Decap CMS listens for this exact postMessage format from the popup.
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>GitHub authorization</title>
  </head>
  <body>
    <p>Authentication ${status}. You can close this window.</p>
    <script>
      (function () {
        var receive = window.opener || window.parent;
        if (receive) {
          receive.postMessage(${JSON.stringify(message)}, ${JSON.stringify(origin)});
        }
        window.close();
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders(origin),
    },
  });
}
