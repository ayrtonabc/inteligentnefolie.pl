import { useAuth } from '@/context/AuthContext'
import { hasPermission, type UserRole } from '@/lib/roles'

export function useLMSAuthorization() {
  const { user, permissions, isAuthenticated } = useAuth()

  const canAccessCourses = (): boolean => {
    if (!isAuthenticated) return false
    return hasPermission(user?.role, 'canManageCourses') || hasPermission(user?.role, 'canManageLms')
  }

  const canPublishCourse = (): boolean => {
    if (!isAuthenticated) return false
    return hasPermission(user?.role, 'canManageCourses')
  }

  const canManageStudents = (): boolean => {
    if (!isAuthenticated) return false
    return hasPermission(user?.role, 'canManageCourses')
  }

  const canViewEnrollments = (): boolean => {
    if (!isAuthenticated) return false
    return hasPermission(user?.role, 'canViewEnrollments') || hasPermission(user?.role, 'canManageCourses')
  }

  const requireAccess = (action: string): void => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para realizar esta acción')
    }
    if (!canAccessCourses()) {
      throw new Error(`No tienes permisos para ${action}`)
    }
  }

  return {
    isAuthenticated,
    userRole: user?.role as UserRole | undefined,
    canAccessCourses: canAccessCourses(),
    canPublishCourse: canPublishCourse(),
    canManageStudents: canManageStudents(),
    canViewEnrollments: canViewEnrollments(),
    requireAccess,
  }
}

export function validateCourseData(data: {
  title?: string
  price?: number
  category?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title?.trim()) {
    errors.push('El título del curso es obligatorio')
  } else if (data.title.length < 5) {
    errors.push('El título debe tener al menos 5 caracteres')
  } else if (data.title.length > 255) {
    errors.push('El título no puede exceder 255 caracteres')
  }

  if (data.price !== undefined && data.price < 0) {
    errors.push('El precio no puede ser negativo')
  }

  if (data.category && data.category.length > 100) {
    errors.push('La categoría no puede exceder 100 caracteres')
  }

  return { valid: errors.length === 0, errors }
}

export function validateChapterData(data: {
  title?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title?.trim()) {
    errors.push('El título del capítulo es obligatorio')
  } else if (data.title.length < 3) {
    errors.push('El título debe tener al menos 3 caracteres')
  } else if (data.title.length > 255) {
    errors.push('El título no puede exceder 255 caracteres')
  }

  return { valid: errors.length === 0, errors }
}

export function validateLectureData(data: {
  title?: string
  chapterId?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.chapterId) {
    errors.push('Debes seleccionar un capítulo')
  }

  if (!data.title?.trim()) {
    errors.push('El título de la lección es obligatorio')
  } else if (data.title.length < 3) {
    errors.push('El título debe tener al menos 3 caracteres')
  } else if (data.title.length > 255) {
    errors.push('El título no puede exceder 255 caracteres')
  }

  return { valid: errors.length === 0, errors }
}

export function canPublishCourseWithValidation(course: {
  chapters_count?: number
  lectures_count?: number
}): { canPublish: boolean; reason?: string } {
  if ((course.chapters_count || 0) === 0) {
    return { canPublish: false, reason: 'El curso debe tener al menos un capítulo' }
  }
  
  if ((course.lectures_count || 0) === 0) {
    return { canPublish: false, reason: 'El curso debe tener al menos una lección' }
  }

  return { canPublish: true }
}

export class LMSError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'VALIDATION' | 'NOT_FOUND' | 'SERVER_ERROR' = 'SERVER_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'LMSError'
  }
}

export function handleLMSError(error: unknown): { message: string; code: string } {
  if (error instanceof LMSError) {
    return { message: error.message, code: error.code }
  }
  
  if (error instanceof Error) {
    console.error('LMS Error:', error)
    return { message: error.message, code: 'SERVER_ERROR' }
  }
  
  return { message: 'Ocurrió un error inesperado', code: 'SERVER_ERROR' }
}