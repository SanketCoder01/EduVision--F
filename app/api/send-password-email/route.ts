import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { toEmail, password, name, type } = await request.json()

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    })

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: `Your EduVision ${type} Account Password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Welcome to EduVision!</h2>
          <p>Hello ${name},</p>
          <p>Your ${type} account has been created successfully.</p>
          <p><strong>Your temporary password is: ${password}</strong></p>
          <p>Please login with your email and this password, then change it immediately.</p>
          <p>Best regards,<br>EduVision Team</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email sending failed:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
} 