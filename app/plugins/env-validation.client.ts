/**
 * Environment Variables Validation Plugin
 * Ensures required environment variables are properly configured
 * Prevents application startup with missing configuration
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // List of required environment variables
  const requiredVars = {
    supabaseUrl: config.public.supabaseUrl,
    supabaseKey: config.public.supabaseKey
  }
  
  // Validate each required variable
  const missingVars: string[] = []
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value === '') {
      missingVars.push(key.toUpperCase())
    }
  }
  
  // Throw error if any required variables are missing
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`
    console.error('🚨 Configuration Error:', errorMessage)
    
    // In development, show a helpful error message
    if (process.dev) {
      throw new Error(
        `${errorMessage}\n\n` +
        `Please create a .env file with the following variables:\n` +
        `SUPABASE_URL=your_supabase_url\n` +
        `SUPABASE_KEY=your_supabase_key\n\n` +
        `Check .env.example for more details.`
      )
    } else {
      // In production, throw a generic error for security
      throw new Error('Application configuration error. Please contact support.')
    }
  }
  
  // Log successful validation in development
  if (process.dev) {
    console.log('✅ Environment variables validated successfully')
  }
})