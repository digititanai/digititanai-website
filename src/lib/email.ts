interface EmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
  icalEvent?: string
}

// Get fresh access token using OAuth2 refresh token
async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`OAuth error: ${data.error}`)
  return data.access_token
}

// Send email via Gmail API (OAuth2 — no app password needed)
export async function sendEmail({ to, subject, html }: EmailOptions) {
  const accessToken = await getAccessToken()
  const from = process.env.GMAIL_USER || 'sabbirahsan73@gmail.com'

  // Build MIME message
  const mimeMessage = [
    `From: "Sabbir Ahsan" <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n')

  // Base64url encode
  const encoded = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  })

  const result = await res.json()
  if (result.error) throw new Error(`Gmail API: ${result.error.message}`)
  return result
}

export function contactNotificationEmail(data: {
  name: string
  email: string
  phone?: string
  service_interest?: string
  budget_range?: string
  message: string
}) {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4c6ef5, #ff9800); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Submission</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">sabbirahsan.com</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; font-weight: 600; color: #334155; width: 140px;">Name:</td><td style="padding: 10px 0; color: #475569;">${data.name}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: 600; color: #334155;">Email:</td><td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #4c6ef5;">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #334155;">Phone:</td><td style="padding: 10px 0; color: #475569;">${data.phone}</td></tr>` : ''}
          ${data.service_interest ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #334155;">Service:</td><td style="padding: 10px 0; color: #475569;">${data.service_interest}</td></tr>` : ''}
          ${data.budget_range ? `<tr><td style="padding: 10px 0; font-weight: 600; color: #334155;">Budget:</td><td style="padding: 10px 0; color: #475569;">${data.budget_range}</td></tr>` : ''}
        </table>
        <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 10px; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h3>
          <p style="margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
    </div>
  `
}

export function contactAutoReplyEmail(name: string) {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4c6ef5, #ff9800); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Reaching Out!</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for contacting me! I've received your message and will get back to you within 24 hours.</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">In the meantime, feel free to explore my <a href="https://sabbirahsan.com/portfolio" style="color: #4c6ef5;">portfolio</a> or <a href="https://sabbirahsan.com/blog" style="color: #4c6ef5;">blog</a>.</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>Md Sabbir Ahsan</strong><br>Digital Marketer & Martech Specialist</p>
      </div>
    </div>
  `
}

export function bookingConfirmationEmail(data: {
  client_name: string
  service_name: string
  booking_date: string
  booking_time: string
  duration: number
}) {
  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4c6ef5, #22c55e); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
      </div>
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #475569; font-size: 16px;">Hi ${data.client_name},</p>
        <p style="color: #475569; font-size: 16px;">Your appointment has been confirmed. Here are the details:</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: 600; color: #334155;">Service:</td><td style="color: #475569;">${data.service_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #334155;">Date:</td><td style="color: #475569;">${data.booking_date}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #334155;">Time:</td><td style="color: #475569;">${data.booking_time}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #334155;">Duration:</td><td style="color: #475569;">${data.duration} minutes</td></tr>
          </table>
        </div>
        <p style="color: #475569; font-size: 16px;">Looking forward to speaking with you!</p>
        <p style="color: #475569; font-size: 16px;">Best,<br><strong>Md Sabbir Ahsan</strong></p>
      </div>
    </div>
  `
}
