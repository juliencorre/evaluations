/**
 * Student Types Module
 *
 * Contains all type definitions related to students and classes
 * Part of Phase 4.2 type organization
 */

/**
 * Student entity
 * Represents a student in the system
 */
export interface Student {
  id: string
  firstName: string
  lastName: string
  displayName: string
  gender?: 'M' | 'F' | 'Autre' | string | null
  birthDate?: string | null  // Format ISO date string (YYYY-MM-DD)
}

/**
 * Class entity
 * Represents a class/group of students
 */
export interface Class {
  id: string
  name: string
  description?: string
  schoolYear: string
  level?: string
  subject?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

/**
 * ClassTeacher association
 * Links teachers to classes with roles
 */
export interface ClassTeacher {
  id: string
  classId: string
  userId: string
  role: 'teacher' | 'owner' | 'assistant'
  email?: string
  fullName?: string
  createdAt: string
  updatedAt: string
}
