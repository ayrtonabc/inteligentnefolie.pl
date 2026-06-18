import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  projectCategoriesAPI,
  projectsAPI,
  projectImagesAPI,
  projectTechnologiesAPI,
  getWebsiteId,
  getProjectStats,
} from './api'
import type {
  ProjectCategoryFormData,
  ProjectFormData,
  ProjectImageFormData,
  ProjectTechnologyFormData,
  ProjectFilters,
} from './types'

// ============================================================================
// WEBSITE ID
// ============================================================================

export function useWebsiteId() {
  return useQuery({
    queryKey: ['websiteId'],
    queryFn: () => getWebsiteId(),
    staleTime: 1000 * 60 * 60,
  })
}

// ============================================================================
// HOOKS DE CATEGORÍAS
// ============================================================================

export function useProjectCategories(websiteId: string) {
  return useQuery({
    queryKey: ['projectCategories', websiteId],
    queryFn: () => projectCategoriesAPI.getCategories(websiteId),
    enabled: !!websiteId,
  })
}

export function useProjectCategory(id: string) {
  return useQuery({
    queryKey: ['projectCategory', id],
    queryFn: () => projectCategoriesAPI.getCategory(id),
    enabled: !!id,
  })
}

export function useCreateProjectCategory(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectCategoryFormData) => projectCategoriesAPI.createCategory(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] })
      queryClient.invalidateQueries({ queryKey: ['projectCategories', websiteId] })
    },
  })
}

export function useUpdateProjectCategory(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<ProjectCategoryFormData>) => projectCategoriesAPI.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategory', id] })
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] })
    },
  })
}

export function useDeleteProjectCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectCategoriesAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] })
    },
  })
}

// ============================================================================
// HOOKS DE PROYECTOS
// ============================================================================

export function useProjects(websiteId: string, filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', websiteId, filters],
    queryFn: () => projectsAPI.getProjects(websiteId, filters),
    enabled: !!websiteId,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getProject(id),
    enabled: !!id,
  })
}

export function useProjectBySlug(websiteId: string, slug: string) {
  return useQuery({
    queryKey: ['project', 'slug', websiteId, slug],
    queryFn: () => projectsAPI.getProjectBySlug(websiteId, slug),
    enabled: !!websiteId && !!slug,
  })
}

export function useCreateProject(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectFormData) => projectsAPI.createProject(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', websiteId] })
      queryClient.invalidateQueries({ queryKey: ['projectStats'] })
      queryClient.invalidateQueries({ queryKey: ['projectStats', websiteId] })
    },
  })
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<ProjectFormData>) => projectsAPI.updateProject(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', ''] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsAPI.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projectStats'] })
    },
  })
}

// ============================================================================
// HOOKS DE IMÁGENES
// ============================================================================

export function useProjectImages(projectId: string) {
  return useQuery({
    queryKey: ['projectImages', projectId],
    queryFn: () => projectImagesAPI.getImages(projectId),
    enabled: !!projectId,
  })
}

export function useCreateProjectImage(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectImageFormData) => projectImagesAPI.createImage(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useUpdateProjectImage(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<ProjectImageFormData>) => projectImagesAPI.updateImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectImages'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })
}

export function useDeleteProjectImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectImagesAPI.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectImages'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, imageId }: { projectId: string; imageId: string }) =>
      projectImagesAPI.setPrimaryImage(projectId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectImages'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
    },
  })
}

// ============================================================================
// HOOKS DE TECNOLOGÍAS
// ============================================================================

export function useProjectTechnologies(websiteId: string) {
  return useQuery({
    queryKey: ['projectTechnologies', websiteId],
    queryFn: () => projectTechnologiesAPI.getTechnologies(websiteId),
    enabled: !!websiteId,
  })
}

export function useCreateProjectTechnology(websiteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectTechnologyFormData) => projectTechnologiesAPI.createTechnology(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTechnologies', websiteId] })
    },
  })
}

export function useLinkTechnology() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, technologyId }: { projectId: string; technologyId: string }) =>
      projectTechnologiesAPI.linkTechnology(projectId, technologyId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useUnlinkTechnology() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, technologyId }: { projectId: string; technologyId: string }) =>
      projectTechnologiesAPI.unlinkTechnology(projectId, technologyId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

// ============================================================================
// STATS
// ============================================================================

export function useProjectStats(websiteId: string) {
  return useQuery({
    queryKey: ['projectStats', websiteId],
    queryFn: () => getProjectStats(websiteId),
    enabled: !!websiteId,
  })
}
