import { NextResponse, type NextRequest } from 'next/server'
import { appwriteDatabases } from '@/lib/appwrite-server'
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
    // Appwrite env validation
    const required = ['APPWRITE_ENDPOINT','APPWRITE_PROJECT_ID','APPWRITE_API_KEY','APPWRITE_DB_ID','APPWRITE_STUDENTS_COLL_ID']
    const missing = required.filter((k) => !process.env[k])
    if (missing.length) {
      return NextResponse.json({ success: false, message: `Server misconfigured: missing ${missing.join(', ')}` }, { status: 500 })
    }
    const body = await req.json()
    const {
      name: rawName, email: rawEmail, phone: rawPhone, department: rawDept, academic_year: rawYear,
      date_of_birth: rawDob, parent_name: rawPName, parent_phone: rawPPhone, address: rawAddr,
    } = body

    // Normalize/trim
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : rawPhone
    const department = typeof rawDept === 'string' ? rawDept.trim() : ''
    const academic_year = typeof rawYear === 'string' ? rawYear.trim() : String(rawYear ?? '')
    const date_of_birth = typeof rawDob === 'string' ? rawDob.trim() : ''
    const parent_name = typeof rawPName === 'string' ? rawPName.trim() : ''
    const parent_phone = typeof rawPPhone === 'string' ? rawPPhone.trim() : ''
    const address = typeof rawAddr === 'string' ? rawAddr.trim() : rawAddr

    const errors: Record<string, string> = {}
    if (!name) errors.name = 'Student name is required'
    if (!email) errors.email = 'Email address is required'
    if (!department) errors.department = 'Department is required'
    if (!academic_year) errors.academic_year = 'Academic year is required'
    if (!date_of_birth) errors.date_of_birth = 'Date of birth is required'
    if (!parent_name) errors.parent_name = 'Parent name is required'
    if (!parent_phone) errors.parent_phone = 'Parent phone is required'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const dbId = process.env.APPWRITE_DB_ID!
    const collId = process.env.APPWRITE_STUDENTS_COLL_ID!

    // Duplicate checks
    try {
      const emailList = await appwriteDatabases.listDocuments(dbId, collId, [
        `equal("email", ["${email}"])`
      ])
      if (emailList.total > 0) {
        return NextResponse.json({ success: false, errors: { email: 'This email is already registered' } }, { status: 409 })
      }
    } catch {}

    const { first, middle, last } = splitName(name)

    // Generate PRN (10 digits) and bcrypt password
    const prn = String(Math.floor(1000000000 + Math.random() * 9000000000))
    const plainPassword = Array.from({ length: 12 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))).join('')
    const password_hash = await bcrypt.hash(plainPassword, 10)

    // Compose name
    const fullName = [first, middle, last].filter(Boolean).join(' ')

    const created = await appwriteDatabases.createDocument(dbId, collId, 'unique()', {
      prn,
      first_name: first,
      middle_name: middle,
      last_name: last,
      name: fullName,
      email,
      phone,
      department,
      academic_year,
      date_of_birth,
      parent_name,
      parent_phone,
      address,
      password_hash,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Send credentials email immediately
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
        subject: 'Your Student Account Credentials',
        text: `Hello ${fullName},\n\nYour student account has been created.\n\nPRN: ${prn}\nPassword: ${plainPassword}\n\nLogin: ${appUrl}/login\n\nPlease change your password after first login.`,
      })
    } catch (mailErr) {
      console.error('Failed to send student credentials email:', mailErr)
    }

    return NextResponse.json({ success: true, student: { id: created.$id, prn, name: fullName, email } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message ?? 'Server error' }, { status: 500 })
  }
}


