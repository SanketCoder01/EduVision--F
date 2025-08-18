// Email notification utilities for registration approval/rejection
// This is a placeholder implementation - integrate with your preferred email service

export interface EmailNotification {
  to: string
  subject: string
  html: string
}

export const createApprovalEmail = (email: string, userType: 'student' | 'faculty'): EmailNotification => {
  const dashboardUrl = userType === 'student' ? '/student-dashboard' : '/dashboard'
  
  return {
    to: email,
    subject: '🎉 EduVision Registration Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to EduVision!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your registration has been approved</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Registration Approved ✅</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your EduVision registration has been approved by our admin team. 
            You can now access your dashboard and start using all the platform features.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}${dashboardUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Complete your profile information</li>
              <li>Explore assignments and announcements</li>
              <li>Join study groups and connect with peers</li>
              <li>Access timetables and study materials</li>
            </ul>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If you have any questions, contact us at admin@sanjivani.edu.in
          </p>
        </div>
      </div>
    `
  }
}

export const createRejectionEmail = (email: string, reason?: string): EmailNotification => {
  return {
    to: email,
    subject: 'EduVision Registration Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Registration Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Regarding your EduVision application</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Registration Status</h2>
          <p style="color: #666; line-height: 1.6;">
            We have reviewed your EduVision registration application. Unfortunately, 
            we are unable to approve your registration at this time.
          </p>
          
          ${reason ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Reason:</h3>
              <p style="color: #856404; margin-bottom: 0;">${reason}</p>
            </div>
          ` : ''}
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What You Can Do:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Ensure you're using the correct university email address</li>
              <li>Verify your department and year information</li>
              <li>Contact our admin team for clarification</li>
              <li>You may reapply after addressing the issues</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:admin@sanjivani.edu.in" 
               style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Contact Admin Team
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            For assistance, contact us at admin@sanjivani.edu.in
          </p>
        </div>
      </div>
    `
  }
}

// Placeholder function - integrate with your email service (SendGrid, Nodemailer, etc.)
export const sendEmail = async (notification: EmailNotification): Promise<boolean> => {
  try {
    // TODO: Integrate with actual email service
    console.log('Email notification:', notification)
    
    // Example integration with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: notification.to,
    //   from: 'noreply@sanjivani.edu.in',
    //   subject: notification.subject,
    //   html: notification.html
    // })
    
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
