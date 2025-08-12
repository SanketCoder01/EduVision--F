import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'

function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  const first = parts.shift() ?? ''
  const last = parts.length ? parts.pop()! : 'NA'
  const middle = parts.join(' ') || null
  return { first, middle, last }
}

export async function POST(req: NextRequest) {
  try {
    const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    const missing = required.filter((k) => !process.env[k])
    if (missing.length) {
      return NextResponse.json({ success: false, message: `Server misconfigured: missing ${missing.join(', ')}` }, { status: 500 })
    }
    const body = await req.json()
    const {
      name: rawName, email: rawEmail, phone: rawPhone, department: rawDept, designation: rawDesig,
      experience_years: rawExp, qualification: rawQual, address: rawAddr,
    } = body

    // Normalize/trim
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : rawPhone
    const department = typeof rawDept === 'string' ? rawDept.trim() : ''
    const designation = typeof rawDesig === 'string' ? rawDesig.trim() : ''
    const experience_years = Number.parseInt(String(rawExp ?? '0')) || 0
    const qualification = typeof rawQual === 'string' ? rawQual.trim() : rawQual
    const address = typeof rawAddr === 'string' ? rawAddr.trim() : rawAddr

    const errors: Record<string, string> = {}
    if (!name) errors.name = 'Faculty name is required'
    if (!email) errors.email = 'Email address is required'
    if (!department) errors.department = 'Department is required'
    if (!designation) errors.designation = 'Designation is required'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const supabase = createClient()
    
    // Check if email already exists
    const { data: existingFaculty, error: emailCheckError } = await supabase
      .from('faculty')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingFaculty) {
      return NextResponse.json(
        { success: false, errors: { email: 'This email is already registered' } }, 
        { status: 409 }
      )
    }

    const { first, middle, last } = splitName(name)

    const prn = String(Math.floor(1000000000 + Math.random() * 9000000000))
    const plainPassword = Array.from({ length: 12 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))).join('')
    const password_hash = await bcrypt.hash(plainPassword, 10)
    const fullName = [first, middle, last].filter(Boolean).join(' ')

    // Insert new faculty member
    const { data: created, error: insertError } = await supabase
      .from('faculty')
      .insert({
        prn,
        first_name: first,
        middle_name: middle,
        last_name: last,
        name: fullName,
        email,
        phone,
        department,
        designation,
        experience_years,
        qualification,
        address,
        password_hash,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error creating faculty:', insertError)
      throw new Error('Failed to create faculty record')
    }

    // Send credentials email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
        auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
      })
      const appUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000'
      await transporter.sendMail({
        from: process.env.MAIL_FROM!,
        to: email,
        subject: 'Your Faculty Account Credentials',
        text: `Hello ${fullName},\n\nYour faculty account has been created.\n\nPRN: ${prn}\nPassword: ${plainPassword}\n\nLogin: ${appUrl}/login\n\nPlease change your password after first login.`,
      })
    } catch (mailErr) {
      console.error('Failed to send faculty credentials email:', mailErr)
    }

    return NextResponse.json({ 
      success: true, 
      faculty: { 
        id: created.id, 
        prn, 
        name: fullName, 
        email 
      } 
    }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message ?? 'Server error' }, { status: 500 })
  }
}


