import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 },
      );
    }

    // Get OAuth credentials from environment
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: "Google OAuth configuration missing" },
        { status: 500 },
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData);
      return NextResponse.json(
        { error: "Failed to exchange authorization code" },
        { status: 400 },
      );
    }

    // Store the refresh token securely (in production, use secure session/database)
    // For now, we'll return the access token to the client
    // In production, store refresh token server-side and use secure cookies

    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresIn: tokenData.expires_in,
      email,
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 },
    );
  }
}
