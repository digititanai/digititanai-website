import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = newsletterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      )
    }

    const { email } = parsed.data
    const supabase = createServerClient()

    // Check if already subscribed (using contacts table with newsletter flag)
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', email)
      .eq('service_interest', 'newsletter')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 200 }
      )
    }

    // Store subscriber
    const { error: insertError } = await supabase.from('contacts').insert({
      name: email.split('@')[0],
      email,
      message: 'Newsletter subscription',
      service_interest: 'newsletter',
      status: 'subscribed',
      phone: null,
      budget_range: null,
      attachment_url: null,
    })

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to the Newsletter!',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4c6ef5, #ff9800); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome Aboard!</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thanks for subscribing! You'll receive updates on digital marketing insights, new services, and tips to grow your business.</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Best,<br><strong>DigiTitan AI</strong></p>
          </div>
        </div>
      `,
    }).catch((err) => console.error('Welcome email failed:', err))

    return NextResponse.json(
      { message: 'Successfully subscribed to the newsletter!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
