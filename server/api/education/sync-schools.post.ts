/**
 * Server API endpoint for bulk synchronization of schools
 * This endpoint handles large-scale import/update of schools from the Education API
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Get runtime config for Supabase
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )
  
  // Parameters for sync
  const department = body.department // Optional: sync only specific department
  const limit = body.limit || 10000 // Max schools to sync at once
  const batchSize = 100 // Process in batches to avoid timeouts
  
  const BASE_URL = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records'
  
  const results = {
    total: 0,
    inserted: 0,
    updated: 0,
    errors: 0,
    details: [] as string[]
  }
  
  try {
    // Build query for fetching schools
    const whereConditions: string[] = []
    
    // Filter by department if specified
    if (department) {
      let deptCode = String(department)
      if (deptCode.length === 2 && !isNaN(Number(deptCode))) {
        deptCode = '0' + deptCode
      }
      whereConditions.push(`code_departement = "${deptCode}"`)
    }
    
    // Fetch schools in batches
    let offset = 0
    let hasMore = true
    
    while (hasMore && results.total < limit) {
      const params = new URLSearchParams()
      params.append('limit', String(Math.min(batchSize, limit - results.total)))
      params.append('offset', String(offset))
      
      if (whereConditions.length > 0) {
        params.append('where', whereConditions.join(' AND '))
      }
      
      params.append('order_by', 'nom_etablissement')
      
      const url = `${BASE_URL}?${params.toString()}`
      
      try {
        // Fetch batch from Education API
        const response = await $fetch<{
          total_count: number
          results: Array<{
            identifiant_de_l_etablissement: string
            nom_etablissement: string
            nom_commune?: string
            code_postal?: string
            adresse_1?: string
            telephone?: string
            mail?: string
            type_etablissement?: string
            statut_public_prive?: string
          }>
        }>(url)
        
        if (!response.results || response.results.length === 0) {
          hasMore = false
          break
        }
        
        // Process each school in the batch
        for (const apiSchool of response.results) {
          results.total++
          
          // Skip schools without required data
          if (!apiSchool.identifiant_de_l_etablissement || !apiSchool.nom_etablissement) {
            results.errors++
            results.details.push(`Données manquantes pour: ${apiSchool.nom_etablissement || 'École inconnue'}`)
            continue
          }
          
          // Prepare school data for upsert
          const schoolData = {
            uai: apiSchool.identifiant_de_l_etablissement,
            name: apiSchool.nom_etablissement,
            city: apiSchool.nom_commune || null
          }
          
          try {
            // Check if school exists
            const { data: existingSchool } = await supabase
              .from('school')
              .select('school_id, name, city')
              .eq('uai', schoolData.uai)
              .single()
            
            if (existingSchool) {
              // Update existing school if data has changed
              if (existingSchool.name !== schoolData.name || existingSchool.city !== schoolData.city) {
                const { error: updateError } = await supabase
                  .from('school')
                  .update({
                    name: schoolData.name,
                    city: schoolData.city
                  })
                  .eq('uai', schoolData.uai)
                
                if (updateError) {
                  results.errors++
                  results.details.push(`Erreur mise à jour ${schoolData.uai}: ${updateError.message}`)
                } else {
                  results.updated++
                }
              }
            } else {
              // Insert new school
              const { error: insertError } = await supabase
                .from('school')
                .insert(schoolData)
              
              if (insertError) {
                results.errors++
                results.details.push(`Erreur insertion ${schoolData.uai}: ${insertError.message}`)
              } else {
                results.inserted++
              }
            }
          } catch (dbError: any) {
            results.errors++
            results.details.push(`Erreur DB pour ${schoolData.uai}: ${dbError.message}`)
          }
        }
        
        // Continue to next batch if we haven't reached the limit
        offset += batchSize
        
        // Stop if we've processed all available records
        if (offset >= response.total_count) {
          hasMore = false
        }
        
      } catch (fetchError: any) {
        results.errors++
        results.details.push(`Erreur API batch ${offset}: ${fetchError.message}`)
        // Continue with next batch even if one fails
        offset += batchSize
      }
      
      // Add a small delay to avoid overwhelming the APIs
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return {
      success: true,
      message: `Synchronisation terminée: ${results.inserted} ajoutées, ${results.updated} mises à jour, ${results.errors} erreurs sur ${results.total} écoles traitées`,
      ...results
    }
    
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Erreur lors de la synchronisation'
    })
  }
})