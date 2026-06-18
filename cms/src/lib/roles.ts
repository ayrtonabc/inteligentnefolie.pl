export type UserRole = 'owner' | 'admin' | 'editor' | 'staff'

export type LMSRole = 'admin' | 'instructor' | 'student'

export interface LMSPermissions {
  canManageCourses: boolean
  canManageStudents: boolean
  canViewAnalytics: boolean
  canPublishCourses: boolean
  canEditCourseContent: boolean
  canViewAllEnrollments: boolean
  canManageCertificates: boolean
}

export interface RolePermissions {
  canEditContent: boolean
  canEditPages: boolean
  canEditMenus: boolean
  canEditBlog: boolean
  canEditMedia: boolean
  canEditShop: boolean
  canViewAnalytics: boolean
  canViewSeo: boolean
  canEditSeo: boolean
  canUseAi: boolean
  canEditSettings: boolean
  canEditDomainSettings: boolean
  canEditApiKeys: boolean
  canEditCustomScripts: boolean
  canManageUsers: boolean
  canManageTenants: boolean
  canExportData: boolean
  canEditRestaurant: boolean
  canViewRestaurantReports: boolean
  canManageRestaurantProducts: boolean
  canManageRestaurantOrders: boolean
  canManageLms: boolean
  canManageCourses: boolean
  canViewEnrollments: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    canEditContent: true,
    canEditPages: true,
    canEditMenus: true,
    canEditBlog: true,
    canEditMedia: true,
    canEditShop: true,
    canViewAnalytics: true,
    canViewSeo: true,
    canEditSeo: true,
    canUseAi: true,
    canEditSettings: true,
    canEditDomainSettings: true,
    canEditApiKeys: true,
    canEditCustomScripts: true,
    canManageUsers: true,
    canManageTenants: true,
    canExportData: true,
    canEditRestaurant: true,
    canViewRestaurantReports: true,
    canManageRestaurantProducts: true,
    canManageRestaurantOrders: true,
    canManageLms: true,
    canManageCourses: true,
    canViewEnrollments: true,
  },
  admin: {
    canEditContent: true,
    canEditPages: true,
    canEditMenus: true,
    canEditBlog: true,
    canEditMedia: true,
    canEditShop: true,
    canViewAnalytics: true,
    canViewSeo: true,
    canEditSeo: true,
    canUseAi: true,
    canEditSettings: true,
    canEditDomainSettings: true,
    canEditApiKeys: true,
    canEditCustomScripts: true,
    canManageUsers: true,
    canManageTenants: false,
    canExportData: true,
    canEditRestaurant: true,
    canViewRestaurantReports: true,
    canManageRestaurantProducts: true,
    canManageRestaurantOrders: true,
    canManageLms: true,
    canManageCourses: true,
    canViewEnrollments: true,
  },
  editor: {
    canEditContent: true,
    canEditPages: true,
    canEditMenus: true,
    canEditBlog: true,
    canEditMedia: true,
    canEditShop: false,
    canViewAnalytics: true,
    canViewSeo: true,
    canEditSeo: false,
    canUseAi: false,
    canEditSettings: false,
    canEditDomainSettings: false,
    canEditApiKeys: false,
    canEditCustomScripts: false,
    canManageUsers: false,
    canManageTenants: false,
    canExportData: false,
    canEditRestaurant: false,
    canViewRestaurantReports: false,
    canManageRestaurantProducts: false,
    canManageRestaurantOrders: false,
    canManageLms: false,
    canManageCourses: false,
    canViewEnrollments: false,
  },
  staff: {
    canEditContent: false,
    canEditPages: false,
    canEditMenus: false,
    canEditBlog: false,
    canEditMedia: false,
    canEditShop: false,
    canViewAnalytics: false,
    canViewSeo: false,
    canEditSeo: false,
    canUseAi: false,
    canEditSettings: false,
    canEditDomainSettings: false,
    canEditApiKeys: false,
    canEditCustomScripts: false,
    canManageUsers: false,
    canManageTenants: false,
    canExportData: false,
    canEditRestaurant: true,
    canViewRestaurantReports: false,
    canManageRestaurantProducts: false,
    canManageRestaurantOrders: true,
    canManageLms: false,
    canManageCourses: false,
    canViewEnrollments: false,
  },
}

export function getRolePermissions(role: UserRole | undefined): RolePermissions {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return ROLE_PERMISSIONS.editor
  }
  return ROLE_PERMISSIONS[role]
}

export function hasPermission(role: UserRole | undefined, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(role)
  return !!permissions[permission]
}

export function getRestrictedSettings(role: UserRole | undefined): string[] {
  const perm = getRolePermissions(role)
  const restricted: string[] = []
  
  if (!perm.canEditDomainSettings) {
    restricted.push('website_url', 'domain', 'main_domain')
  }
  if (!perm.canEditApiKeys) {
    restricted.push('api_keys', 'ai_api_key', 'pagespeed_api_key')
  }
  if (!perm.canEditCustomScripts) {
    restricted.push('custom_scripts', 'analytics_id', 'pixel_id', 'search_console_code')
  }
  if (!perm.canUseAi) {
    restricted.push('ai_config', 'auto_seo', 'content_generation')
  }
  if (!perm.canManageUsers) {
    restricted.push('users', 'invite_users', 'user_roles')
  }
  if (!perm.canManageTenants) {
    restricted.push('tenants', 'new_tenant', 'delete_tenant')
  }
  
  return restricted
}

export function canEditSetting(role: UserRole | undefined, settingKey: string): boolean {
  const restricted = getRestrictedSettings(role)
  return !restricted.includes(settingKey)
}
