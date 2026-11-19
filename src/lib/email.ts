import nodemailer from 'nodemailer'

// Email configuration
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpSecure = process.env.SMTP_SECURE === 'true'
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  // If email is not configured, return null
  if (!smtpHost || !smtpUser) {
    return null
  }

  // Create transporter configuration
  const transporterConfig: any = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
  }

  // Add authentication if password is provided
  if (smtpPassword) {
    transporterConfig.auth = {
      user: smtpUser,
      pass: smtpPassword,
    }
  }

  return nodemailer.createTransport(transporterConfig)
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      if (process.env.NODE_ENV === 'development') console.error('Email configuration missing. Please set SMTP_HOST and SMTP_USER environment variables.')
      return { success: false, error: 'Email configuration missing' }
    }

    const transporter = createTransporter()

    if (!transporter) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to create email transporter. Check your SMTP configuration.')
      return { success: false, error: 'Failed to create email transporter' }
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const siteName = 'Merveilless de l\'Artisanat de Tunisie'
  const siteUrl = process.env.NEXTAUTH_URL || 'https://merveillessdelartisanatdelatunisie.com'

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin-top: 0;">Réinitialisation de mot de passe</h2>
        
        <p>Bonjour,</p>
        
        <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte sur <strong>${siteName}</strong>.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p>Ou copiez et collez ce lien dans votre navigateur :</p>
        <p style="background: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px; color: #4b5563;">
          ${resetLink}
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          <strong>Important :</strong> Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Si le bouton ne fonctionne pas, copiez le lien ci-dessus et collez-le dans votre navigateur.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre.
          <br>
          <strong>${siteName}</strong>
          <br>
          <a href="${siteUrl}" style="color: #f59e0b; text-decoration: none;">${siteUrl}</a>
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
    Réinitialisation de mot de passe - ${siteName}
    
    Bonjour,
    
    Vous avez demandé à réinitialiser votre mot de passe pour votre compte sur ${siteName}.
    
    Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
    ${resetLink}
    
    Important : Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.
    
    ${siteName}
    ${siteUrl}
  `

  return sendEmail({
    to: email,
    subject: `Réinitialisation de mot de passe - ${siteName}`,
    html,
    text,
  })
}

