/**
 * GitHub OAuth proxy for Decap CMS on Cloudflare Pages.
 * Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET as Pages secrets.
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth is not configured.', { status: 500 });
  }

  const error = url.searchParams.get('error');
  if (error) {
    return oauthPage('error', { error });
  }

  const code = url.searchParams.get('code');
  if (!code) {
    const redirectUri = `${url.origin}/api/auth`;
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.searchParams.set('client_id', clientId);
    authorize.searchParams.set('scope', 'repo,user');
    authorize.searchParams.set('redirect_uri', redirectUri);
    return Response.redirect(authorize.toString(), 302);
  }

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

function oauthPage(status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html>
<html>
  <body>
    <p>Authentication ${status}. You can close this window.</p>
    <script>
      (function () {
        const receive = window.opener || window.parent;
        receive.postMessage(${JSON.stringify(message)}, "*");
        window.close();
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
