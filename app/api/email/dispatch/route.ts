import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-service'
import nodemailer from 'nodemailer'

function buildTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  })
}

function template(role: string, name: string, prn: string, password: string) {
  return {
    subject: `Your ${role} account credentials`,
    text: `Hello ${name},\n\nYour ${role} account has been created.\n\nPRN: ${prn}\nPassword: ${password}\n\nLogin at: ${process.env.PUBLIC_APP_URL}/login\n\nPlease change your password after first login.`,
    html: `<p>Hello ${name},</p>
<p>Your <b>${role}</b> account has been created.</p>
<p><b>PRN:</b> ${prn}<br/><b>Password:</b> ${password}</p>
<p>Login: <a href="${process.env.PUBLIC_APP_URL}/login">${process.env.PUBLIC_APP_URL}/login</a></p>
<p>Please change your password after first login.</p>`,
  }
}

export async function POST() {
  try {
    const { data: queue, error } = await supabaseService
      .from('email_queue')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(25)

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    if (!queue || queue.length === 0) return NextResponse.json({ success: true, processed: 0 })

    const transporter = buildTransport()
    let processed = 0

    for (const item of queue) {
      try {
        const { subject, text, html } = template(item.role, item.recipient_name, item.prn, item.plain_password)
        await transporter.sendMail({
          from: process.env.MAIL_FROM!,
          to: item.recipient_email,
          subject,
          text,
          html,
        })

        await supabaseService
          .from('email_queue')
          .update({ sent: true, sent_at: new Date().toISOString(), plain_password: null })
          .eq('id', item.id)

        processed += 1
      } catch (sendErr: any) {
        await supabaseService
          .from('email_queue')
          .update({ attempts: (item.attempts ?? 0) + 1, last_error: String(sendErr?.message ?? sendErr) })
          .eq('id', item.id)
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message ?? 'Server error' }, { status: 500 })
  }
}


