/**
 * Server API endpoint for fetching schools from French Education API
 * This avoids CORS issues by making the request server-side
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const BASE_URL = 'https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records'
  
  try {
    // Build query parameters
    const params = new URLSearchParams()
    
    // Add limit and offset
    params.append('limit', String(query.limit || 100))
    params.append('offset', String(query.offset || 0))
    
    // Build where clause for filtering
    const whereConditions: string[] = []
    
    if (query.search) {
      whereConditions.push(`nom_etablissement LIKE "%${query.search}%"`)
    }
    
    if (query.city) {
      // Simple approach: use LIKE with the city name as-is
      // The API seems to handle case variations reasonably well with LIKE
      const citySearch = String(query.city).trim()
      // Use ILIKE-style search (% at the end allows for variations)
      whereConditions.push(`nom_commune LIKE "${citySearch}%"`)
    }
    
    if (query.department) {
      // Format department code to 3 digits (e.g., "49" -> "049", "2A" -> "02A")
      let deptCode = String(query.department)
      if (deptCode.length === 2 && !isNaN(Number(deptCode))) {
        deptCode = '0' + deptCode
      } else if (deptCode.length === 2 && deptCode.endsWith('A') || deptCode.endsWith('B')) {
        // Handle Corsica departments (2A, 2B)
        deptCode = '0' + deptCode
      }
      whereConditions.push(`code_departement = "${deptCode}"`)
    }
    
    if (whereConditions.length > 0) {
      params.append('where', whereConditions.join(' AND '))
    }
    
    // Order by school name
    params.append('order_by', 'nom_etablissement')
    
    const url = `${BASE_URL}?${params.toString()}`
    
    // Make the request server-side
    const response = await $fetch(url)
    
    return response
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch schools from Education API'
    })
  }
})