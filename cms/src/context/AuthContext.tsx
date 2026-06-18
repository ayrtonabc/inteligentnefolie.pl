import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { pb } from '@/lib/pocketbase'
import type { UserRole, RolePermissions } from '@/lib/roles'
import { getRolePermissions } from '@/lib/roles'

interface User {
  id: string
  name: string
  email: string
  role?: UserRole
  tenant_id?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  permissions: RolePermissions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = async (userId: string): Promise<User | null> => {
    try {
      const record = await pb.collection('users').getOne(userId)
      return {
        id: record.id,
        name: record.name || record.email || '',
        email: record.email || '',
        role: (record.role as UserRole) || 'editor',
        tenant_id: record.tenant_id || record.website_id,
      }
    } catch {
      return null
    }
  }

  const refreshUser = async () => {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      setUser(null)
      return
    }
    const userData = await loadUserData(pb.authStore.model.id)
    setUser(userData)
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (pb.authStore.isValid && pb.authStore.model) {
          const userData = await loadUserData(pb.authStore.model.id)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const unsubscribe = pb.authStore.onChange(async (token, model) => {
      if (token && model) {
        const userData = await loadUserData(model.id)
        setUser(userData)
      } else {
        setUser(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, password)
    } catch (error) {
      setLoading(false)
      throw new Error('Nieprawidłowe dane logowania')
    }
    setLoading(false)
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const resetPassword = async (email: string): Promise<void> => {
    await pb.collection('users').requestPasswordReset(email)
  }

  const permissions = getRolePermissions(user?.role)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        permissions,
        login,
        logout,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
