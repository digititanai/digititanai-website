import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (tokens.error) {
    return NextResponse.json({ error: tokens.error, description: tokens.error_description }, { status: 400 })
  }

  // Show the refresh token to copy
  return new NextResponse(`
    <html>
      <head><title>Google OAuth Success</title></head>
      <body style="font-family:sans-serif;padding:40px;background:#0E1F18;color:#E8DCC8;">
        <h1 style="color:#B89B4A;">Google OAuth Success!</h1>
        <p>Copy the refresh token below and add it to your <code>.env.local</code> file:</p>
        <div style="background:#040F0B;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #215F47;">
          <p><strong>GOOGLE_REFRESH_TOKEN=</strong></p>
          <code style="color:#4B8A6C;word-break:break-all;font-size:14px;">${tokens.refresh_token || 'NOT PROVIDED - You may need to revoke access and try again with prompt=consent'}</code>
        </div>
        <p style="color:#888;">Access token (temporary, not needed): ${tokens.access_token?.slice(0, 20)}...</p>
        <p style="margin-top:30px;color:#B89B4A;">After copying, close this page.</p>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } })
}
