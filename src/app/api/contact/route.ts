import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase'
import {
  sendEmail,
  contactNotificationEmail,
  contactAutoReplyEmail,
} from '@/lib/email'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  service_interest: z.string().optional(),
  budget_range: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const supabase = createServerClient()

    // Rate limit: check if same email submitted in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentSubmissions } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', data.email)
      .gte('created_at', oneHourAgo)

    if (recentSubmissions && recentSubmissions.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a message recently. Please try again later.' },
        { status: 429 }
      )
    }

    // Save to Supabase
    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        service_interest: data.service_interest ?? null,
        budget_range: data.budget_range ?? null,
        message: data.message,
        status: 'new',
        attachment_url: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      )
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Contact: ${data.name}`,
        html: contactNotificationEmail(data),
        replyTo: data.email,
      }).catch((err) => console.error('Admin notification email failed:', err))
    }

    // Send auto-reply to client
    await sendEmail({
      to: data.email,
      subject: 'Thank you for reaching out!',
      html: contactAutoReplyEmail(data.name),
    }).catch((err) => console.error('Auto-reply email failed:', err))

    return NextResponse.json(
      { message: 'Your message has been sent successfully!', id: contact.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
