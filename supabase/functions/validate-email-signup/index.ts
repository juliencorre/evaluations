import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface EmailValidationRequest {
  email: string
}

interface EmailValidationResponse {
  allowed: boolean
  message: string
}

Deno.serve(async (req: Request) => {
  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    // Vérifier que c'est une requête POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parser le body de la requête
    const body: EmailValidationRequest = await req.json()

    if (!body.email) {
      return new Response(
        JSON.stringify({
          allowed: false,
          message: 'Email requis'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Appeler la fonction PostgreSQL pour valider l'email
    const { data, error } = await supabase.rpc('validate_email_registration', {
      email_to_validate: body.email.toLowerCase().trim()
    })

    if (error) {
      console.error('Erreur lors de la validation:', error)
      return new Response(
        JSON.stringify({
          allowed: false,
          message: 'Erreur lors de la validation de l\'email'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = data as EmailValidationResponse

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur dans validate-email-signup:', error)
    return new Response(
      JSON.stringify({
        allowed: false,
        message: 'Erreur interne du serveur'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})