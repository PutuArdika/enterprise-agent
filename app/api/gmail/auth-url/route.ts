import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get OAuth credentials from environment
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "Google OAuth configuration missing" },
        { status: 500 },
      );
    }

    // Build the OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append(
      "scope",
      "https://www.googleapis.com/auth/gmail.readonly",
    );
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    authUrl.searchParams.append("login_hint", email);

    return NextResponse.json({
      authUrl: authUrl.toString(),
      email,
    });
  } catch (error) {
    console.error("Auth URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate auth URL" },
      { status: 500 },
    );
  }
}
