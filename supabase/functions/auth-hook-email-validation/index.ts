import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface WebhookPayload {
  type: string
  table: string
  record: any
  schema: string
  old_record?: any
}

Deno.serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json()

    // Ne traiter que les événements d'inscription (signup)
    if (payload.type !== 'INSERT' || payload.table !== 'users') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = payload.record
    const email = user.email

    if (!email) {
      return new Response(
        JSON.stringify({
          error: 'Email requis pour l\'inscription'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Créer le client Supabase avec les permissions de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Valider l'email avec notre fonction
    const { data, error } = await supabase.rpc('validate_email_registration', {
      email_to_validate: email
    })

    if (error) {
      console.error('Erreur lors de la validation de l\'email:', error)
      return new Response(
        JSON.stringify({
          error: 'Erreur lors de la validation de l\'email'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Si l'email n'est pas autorisé, bloquer l'inscription
    if (!data.allowed) {
      console.log(`Inscription bloquée pour l'email: ${email}`)

      // Supprimer l'utilisateur qui vient d'être créé
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', deleteError)
      }

      return new Response(
        JSON.stringify({
          error: data.message || 'Email non autorisé pour l\'inscription'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Inscription autorisée pour l'email: ${email}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erreur dans le hook d\'authentification:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur interne du serveur'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})