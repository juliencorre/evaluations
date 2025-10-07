/**
 * Types pour les étudiants
 */
export interface Student {
  id: string
  firstName: string
  lastName: string
  displayName: string
  gender?: 'M' | 'F' | 'Autre' | string | null
  birthDate?: string | null
  classId?: string
  status?: 'active' | 'dropped'
}

// Types additionnels pour les étudiants
export interface StudentWithClass extends Student {
  className?: string
}
