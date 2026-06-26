import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get("error_description");
      console.error("OAuth error:", error, errorDescription);

      // Redirect back to client with error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_URL}?oauth_error=${error}&error_description=${errorDescription}`,
      );
    }

    // Validate code
    if (!code) {
      console.error("No authorization code received");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_URL}?oauth_error=no_code`,
      );
    }

    // Return HTML page that displays the code for user to copy
    // This is a common pattern for desktop/localhost OAuth flows
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gmail Authorization</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
              max-width: 500px;
              text-align: center;
            }
            h1 {
              color: #333;
              margin-top: 0;
            }
            .code-box {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
              word-break: break-all;
              font-size: 14px;
            }
            .button {
              background: #667eea;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              transition: background 0.3s;
            }
            .button:hover {
              background: #764ba2;
            }
            .message {
              color: #666;
              margin: 20px 0;
              line-height: 1.6;
            }
            .success {
              color: #27ae60;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Gmail Authorization Successful</h1>
            
            <p class="message">
              Authorization code received! Copy the code below and paste it into the dialog window.
            </p>
            
            <div class="code-box" id="codeBox">${code}</div>
            
            <button class="button" onclick="copyCode()">
              📋 Copy Code
            </button>
            
            <p class="message success" id="copied" style="display: none;">
              ✓ Code copied to clipboard!
            </p>
            
            <p class="message">
              You can now close this window and paste the code in the application.
            </p>
          </div>
          
          <script>
            function copyCode() {
              const code = '${code}';
              navigator.clipboard.writeText(code).then(() => {
                const copied = document.getElementById('copied');
                copied.style.display = 'block';
                setTimeout(() => {
                  copied.style.display = 'none';
                }, 3000);
              });
            }
            
            // Also try to send code back to opener window (if opened as popup)
            if (window.opener) {
              window.opener.postMessage({
                type: 'GMAIL_AUTH_CODE',
                code: '${code}'
              }, '*');
            }
          </script>
        </body>
      </html>
    `,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      },
    );
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 },
    );
  }
}
