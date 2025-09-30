export const ROUTE_NAMES = {
  HOME: 'home',
  WELCOME: 'welcome',
  AUTH: 'auth',
  AUTH_CALLBACK: 'auth-callback',
  EVALUATIONS: 'evaluations',
  EVALUATION_DETAIL: 'evaluation-detail',
  EVALUATION_EDIT: 'evaluation-edit',
  CLASSES: 'classes',
  CLASS_DETAIL: 'class-detail',
  CLASS_STUDENTS: 'class-students',
  CLASS_TEACHERS: 'class-teachers',
  CLASS_EVALUATIONS: 'class-evaluations',
  STUDENTS: 'students',
  COMPETENCIES: 'competencies',
  TYPES: 'types',
  ANALYSIS: 'analysis',
  SETTINGS: 'settings'
} as const

type RouteNameMap = typeof ROUTE_NAMES
export type AppRouteName = RouteNameMap[keyof RouteNameMap]
