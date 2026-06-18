import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  ChefHat,
  UserRound,
  Search,
  Mail,
  Calendar,
  AlertTriangle,
  Loader2,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { pb, TENANT_ID } from '@/lib/pocketbase'
import { hasPermission, type UserRole } from '@/lib/roles'

type RestaurantRole = 'admin' | 'waiter' | 'kitchen'

interface RestaurantUser {
  id: string
  email: string
  name: string
  role: RestaurantRole
  restaurant_id: string
  created: string
  verified: boolean
}

interface UserFormData {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role: RestaurantRole
}

interface UserUpdateData {
  name?: string
  email?: string
  role?: RestaurantRole
  password?: string
}

const ROLE_CONFIG: Record<RestaurantRole, { label: string; icon: any; color: string; bg: string }> = {
  admin: { label: 'Administrator', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-100' },
  waiter: { label: 'Kelner', icon: UserRound, color: 'text-blue-700', bg: 'bg-blue-100' },
  kitchen: { label: 'Kuchnia', icon: ChefHat, color: 'text-amber-700', bg: 'bg-amber-100' },
}

const RESTAURANT_ROLE_PERMISSIONS = {
  admin: ['Pełny dostęp', 'Zarządzanie zamówieniami', 'Zarządzanie menu', 'Zarządzanie pracownikami'],
  waiter: ['Przyjmowanie zamówień', 'Edycja zamówień', 'Podgląd menu'],
  kitchen: ['Podgląd zamówień', 'Aktualizacja statusu', 'Brak edycji menu'],
}

function AddEditUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user?: RestaurantUser | null
  onClose: () => void
  onSuccess: (message: string) => void
}) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<UserFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      passwordConfirm: '',
      role: user?.role || 'waiter',
    },
  })

  const password = watch('password')

  const createUser = async (data: UserFormData) => {
    try {
      setError(null)
      const payload = {
        email: data.email,
        emailVisibility: true,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        role: data.role,
        restaurant_id: TENANT_ID,
        restaurant_role: data.role,
        verified: true,
      }

      if (user) {
        await pb.collection('users').update(user.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          restaurant_role: data.role,
        })
        if (data.password) {
          await pb.collection('users').update(user.id, {
            password: data.password,
            passwordConfirm: data.password,
          })
        }
        onSuccess('Dane pracownika zaktualizowane!')
      } else {
        await pb.collection('users').create(payload)
        onSuccess('Pracownik dodany pomyślnie!')
      }

      queryClient.invalidateQueries({ queryKey: ['restaurant-users'] })
      onClose()
    } catch (err: any) {
      console.error('Error:', err)
      if (err?.data?.data?.email) {
        setError('Email jest już zajęty')
      } else if (err?.message) {
        setError(err.message)
      } else {
        setError('Wystąpił błąd podczas zapisywania')
      }
    }
  }

  const onSubmit = async (data: UserFormData) => {
    await createUser({
      ...data,
      passwordConfirm: data.password || user?.id ? 'password' : data.passwordConfirm,
    } as any)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user ? 'bg-blue-100' : 'bg-green-100'}`}>
              {user ? (
                <Edit2 className="w-5 h-5 text-blue-600" />
              ) : (
                <Plus className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {user ? 'Edytuj pracownika' : 'Dodaj pracownika'}
              </h3>
              <p className="text-sm text-gray-500">
                {user ? `Edycja konta ${user.email}` : 'Utwórz nowe konto pracownika'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Imię i nazwisko *
            </label>
            <Input
              {...register('name', { required: 'Imię jest wymagane' })}
              placeholder="Jan Kowalski"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email *
            </label>
            <Input
              type="email"
              {...register('email', {
                required: 'Email jest wymagany',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Nieprawidłowy adres email',
                },
              })}
              placeholder="jan@restauracja.pl"
              error={errors.email?.message}
            />
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hasło *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Hasło jest wymagane',
                      minLength: {
                        value: 6,
                        message: 'Minimum 6 znaków',
                      },
                    })}
                    placeholder="••••••••"
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Potwierdź hasło *
                </label>
                <Input
                  type="password"
                  {...register('passwordConfirm', {
                    required: 'Potwierdź hasło',
                    validate: (value) =>
                      value === password || 'Hasła nie są identyczne',
                  })}
                  placeholder="••••••••"
                  error={errors.passwordConfirm?.message}
                />
              </div>
            </>
          )}

          {user && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-700">
                ℹ️ Aby zmienić hasło, pozostaw pole puste aby zachować obecne.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rola *
            </label>
            <select
              {...register('role', { required: 'Wybierz rolę' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="admin">Administrator</option>
              <option value="waiter">Kelner</option>
              <option value="kitchen">Kuchnia</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <p className="text-sm font-medium text-gray-700 mb-2">Uprawnienia:</p>
            {RESTAURANT_ROLE_PERMISSIONS[watch('role') as RestaurantRole]?.map(
              (perm, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" />
                  {perm}
                </div>
              )
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : user ? (
                'Zapisz zmiany'
              ) : (
                'Dodaj pracownika'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  user,
  onClose,
  onConfirm,
}: {
  user: RestaurantUser
  onClose: () => void
  onConfirm: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await pb.collection('users').delete(user.id)
      onConfirm()
      onClose()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Nie udało się usunąć użytkownika')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-gray-100 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Usunąć pracownika?
          </h3>
          <p className="text-gray-600 mb-6">
            Użytkownik <span className="font-semibold">{user.name}</span> ({user.email})
            zostanie usunięty. Tej operacji nie można cofnąć.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Tak, usuń'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<RestaurantUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<RestaurantUser | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        if (pb.authStore.isValid) {
          const model = pb.authStore.model
          if (model) {
            const role = (model as any).role as UserRole
            setCurrentUserRole(role)
          }
        }
      } catch (err) {
        console.log('Not authenticated')
      }
    }
    getCurrentUser()
  }, [])

  const canManageUsers = hasPermission(currentUserRole as any, 'canManageUsers')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['restaurant-users', TENANT_ID],
    queryFn: async () => {
      const records = await pb.collection('users').getFullList({
        filter: `restaurant_id = "${TENANT_ID}"`,
        sort: '-created',
        requestKey: null,
      })
      return records as unknown as RestaurantUser[]
    },
    enabled: !!canManageUsers,
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brak uprawnień
          </h3>
          <p className="text-gray-600">
            Tylko administratorzy mogą zarządzać pracownikami.
          </p>
          <Link to="/restaurant" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Wróć do panelu
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/restaurant">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pracownicy</h1>
            <p className="text-sm text-gray-500">{users.length} pracowników</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Dodaj pracownika
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Szukaj pracowników..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl bg-white"
        >
          <option value="all">Wszystkie role</option>
          <option value="admin">Administrator</option>
          <option value="waiter">Kelner</option>
          <option value="kitchen">Kuchnia</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-900">Brak pracowników</p>
              <p className="text-sm text-gray-500 mt-1">
                Dodaj pierwszego pracownika aby rozpocząć
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Pracownik
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Rola
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Data utworzenia
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const roleConfig = ROLE_CONFIG[user.role as RestaurantRole] || ROLE_CONFIG.waiter
                    const RoleIcon = roleConfig.icon
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${roleConfig.bg} ${roleConfig.color}`}
                          >
                            <RoleIcon className="w-4 h-4" />
                            {roleConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.created).toLocaleDateString('pl-PL')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                              title="Edytuj"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddEditUserModal
          user={null}
          onClose={() => setShowAddModal(false)}
          onSuccess={showSuccess}
        />
      )}

      {editingUser && (
        <AddEditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={showSuccess}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => {
            showSuccess('Pracownik usunięty')
          }}
        />
      )}
    </div>
  )
}