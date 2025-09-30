import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailData {
  evaluationId: string
  evaluationName: string
  evaluationDescription: string
  recipients: string[]
  message: string
  pdfData: string
  fileName: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { evaluationId, evaluationName, evaluationDescription, recipients, message, pdfData, fileName } = await req.json() as EmailData

    // Validate required fields
    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided')
    }
    if (!pdfData) {
      throw new Error('No PDF data provided')
    }

    // Get Resend API key from environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('Resend API key not configured')
    }

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Résultats d'évaluation - ${evaluationName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f7f7f7;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            h1 {
              margin: 0;
              font-size: 28px;
            }
            .message {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Résultats d'évaluation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${evaluationName}</p>
          </div>
          <div class="content">
            ${evaluationDescription ? `<p><strong>Description:</strong> ${evaluationDescription}</p>` : ''}

            ${message ? `
              <div class="message">
                <h3 style="margin-top: 0;">Message de l'enseignant:</h3>
                <p>${message}</p>
              </div>
            ` : ''}

            <p>Vous trouverez en pièce jointe le document PDF contenant les résultats détaillés de l'évaluation.</p>

            <div class="footer">
              <p>Ce message a été envoyé automatiquement depuis l'application Évaluations.</p>
              <p>© ${new Date().getFullYear()} Application Évaluations - Gestion des compétences</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Convert base64 PDF data to buffer
    const pdfBuffer = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))

    // Send email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Evaluations <noreply@evaluations.app>',
        to: recipients,
        subject: `Résultats d'évaluation: ${evaluationName}`,
        html: htmlContent,
        attachments: [
          {
            filename: fileName,
            content: pdfData // Resend accepts base64 directly
          }
        ]
      })
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await resendResponse.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails envoyés avec succès',
        emailId: result.id,
        recipientCount: recipients.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error in send-evaluation-results function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Une erreur est survenue lors de l\'envoi des emails'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})