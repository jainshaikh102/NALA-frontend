import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Return HTML that communicates with parent window
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dropbox Authentication</title>
      </head>
      <body>
        <script>
          (function() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            
            if (error) {
              window.opener?.postMessage({
                type: 'DROPBOX_AUTH_ERROR',
                error: error
              }, window.location.origin);
              window.close();
              return;
            }
            
            if (code) {
              // Exchange code for token
              exchangeCodeForToken(code);
            } else {
              window.opener?.postMessage({
                type: 'DROPBOX_AUTH_ERROR',
                error: 'No authorization code received'
              }, window.location.origin);
              window.close();
            }
            
            async function exchangeCodeForToken(authCode) {
              try {
                const codeVerifier = localStorage.getItem('dropbox_code_verifier');
                if (!codeVerifier) {
                  throw new Error('Code verifier not found');
                }
                
                const response = await fetch('/api/auth/dropbox/token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    code: authCode,
                    code_verifier: codeVerifier,
                    redirect_uri: window.location.origin + '/api/auth/dropbox/callback'
                  }),
                });
                
                const data = await response.json();
                
                if (data.access_token) {
                  localStorage.removeItem('dropbox_code_verifier');
                  window.opener?.postMessage({
                    type: 'DROPBOX_AUTH_SUCCESS',
                    token: data.access_token
                  }, window.location.origin);
                } else {
                  window.opener?.postMessage({
                    type: 'DROPBOX_AUTH_ERROR',
                    error: data.error || 'Failed to get access token'
                  }, window.location.origin);
                }
                
                window.close();
              } catch (error) {
                window.opener?.postMessage({
                  type: 'DROPBOX_AUTH_ERROR',
                  error: error.message
                }, window.location.origin);
                window.close();
              }
            }
          })();
        </script>
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
          <h2>Processing Dropbox authentication...</h2>
          <p>This window will close automatically.</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}