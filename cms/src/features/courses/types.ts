import { pb, getTenantFilter } from '@/lib/pocketbase'

export interface CourseRating {
  user_name: string
  user_avatar: string
  rating: number
  review: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  price: number
  discount: number
  thumbnail: string
  educator_id: string
  educator_name: string
  educator_avatar: string
  is_published: boolean
  category: string
  level: string
  language: string
  estimated_duration: number
  requirements: string[]
  what_you_will_learn: string[]
  tags: string[]
  ratings: CourseRating[]
  enrolled_count: number
  avg_rating: number
  ratings_count: number
  total_duration: number
  chapters_count: number
  created: string
  updated: string
}

export interface Chapter {
  id: string
  course_id: string
  chapter_title: string
  order_index: number
  created: string
}

export interface Lecture {
  id: string
  course_id: string
  chapter_id: string
  title: string
  video_url: string
  video_file: string
  thumbnail: string
  duration: string
  order_index: number
  is_preview: boolean
  created: string
}

export interface Enrollment {
  id: string
  course_id: string
  course_title: string
  student_name: string
  student_email: string
  student_avatar: string
  price_paid: number
  progress_percent: number
  enrolled_date: string
  completed_date: string | null
}

export interface CourseStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  avgRating: number
  publishedCourses: number
  totalEnrollments: number
}

export interface CourseUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'student' | 'instructor' | 'admin'
  is_blocked: boolean
  enrolled_courses: number
  created: string
}

export interface CourseCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order_index: number
  courses_count: number
}

export interface CourseReview {
  id: string
  course_id: string
  course_title: string
  user_name: string
  user_avatar: string
  rating: number
  review: string
  is_approved: boolean
  created: string
}

export interface Transaction {
  id: string
  course_id: string
  course_title: string
  student_name: string
  student_email: string
  amount: number
  status: 'completed' | 'pending' | 'refunded' | 'failed'
  payment_method: string
  transaction_id: string
  created: string
}

export interface Quiz {
  id: string
  lecture_id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  order_index: number
  created: string
}

export interface Material {
  id: string
  lecture_id: string
  title: string
  file: string
  file_name: string
  file_type: string
  file_size: number
  description: string
  created: string
}

export interface LessonProgress {
  id: string
  enrollment_id: string
  lecture_id: string
  watch_percent: number
  last_position: number
  completed: boolean
  completed_at: string | null
  created: string
}

export interface EnrollmentDetail {
  id: string
  course_id: string
  course_title: string
  student_name: string
  student_email: string
  student_avatar: string
  price_paid: number
  progress_percent: number
  enrolled_date: string
  completed_date: string | null
  progress: LessonProgress[]
}

export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  perPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginationParams {
  page?: number
  perPage?: number
  sort?: string
  filter?: string
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 2 }).format(price / 100)
}

export function getLevelLabel(level: string): string {
  const map: Record<string, string> = { beginner: 'PoczÄ…tkujÄ…cy', intermediate: 'Åšredniozaawansowany', advanced: 'Zaawansowany', all: 'Wszystkie poziomy' }
  return map[level] || level
}

export function getLevelColor(level: string): string {
  const map: Record<string, string> = { beginner: 'bg-emerald-100 text-emerald-700', intermediate: 'bg-amber-100 text-amber-700', advanced: 'bg-rose-100 text-rose-700', all: 'bg-sky-100 text-sky-700' }
  return map[level] || 'bg-gray-100 text-gray-700'
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = { frontend: 'Frontend', backend: 'Backend', data: 'Data Science', devops: 'DevOps', design: 'Design', mobile: 'Mobile', marketing: 'Marketing', business: 'Biznes' }
  return map[cat] || cat
}

export const DEFAULT_THUMBNAIL = '/placeholder.png'

function mapCourse(r: any): Course {
  return {
    id: r.id, title: r.title || '', description: r.description || '',
    price: r.price || 0, discount: r.discount || 0,
    thumbnail: r.thumbnail || DEFAULT_THUMBNAIL,
    educator_id: r.educator_id || '', educator_name: r.educator_name || '',
    educator_avatar: r.educator_avatar || '', is_published: r.is_published ?? false,
    category: r.category || '', level: r.level || 'all', language: r.language || 'Polski',
    estimated_duration: r.estimated_duration || 0,
    requirements: Array.isArray(r.requirements) ? r.requirements : (r.requirements ? JSON.parse(r.requirements) : []),
    what_you_will_learn: Array.isArray(r.what_you_will_learn) ? r.what_you_will_learn : (r.what_you_will_learn ? JSON.parse(r.what_you_will_learn) : []),
    tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
    ratings: Array.isArray(r.ratings) ? r.ratings : (r.ratings ? JSON.parse(r.ratings) : []),
    enrolled_count: r.enrolled_count || 0, avg_rating: r.avg_rating || 0,
    ratings_count: r.ratings_count || 0, total_duration: r.total_duration || 0,
    chapters_count: r.chapters_count || 0, created: r.created, updated: r.updated,
  }
}

export async function getCourses(page = 1, perPage = 20): Promise<PaginatedResponse<Course>> {
  try {
    const records = await pb.collection('courses_list').getList(page, perPage, {
      sort: '-created',
      filter: getTenantFilter()
    })
    return {
      items: records.items.map(mapCourse),
      totalItems: records.totalItems,
      totalPages: Math.ceil(records.totalItems / records.perPage),
      currentPage: records.page,
      perPage: records.perPage,
      hasNextPage: records.page < Math.ceil(records.totalItems / records.perPage),
      hasPrevPage: records.page > 1,
    }
  } catch { return { items: [], totalItems: 0, totalPages: 0, currentPage: 1, perPage: 20, hasNextPage: false, hasPrevPage: false } }
}

export async function getCoursesPaginated(params: PaginationParams): Promise<PaginatedResponse<Course>> {
  return getCourses(params.page || 1, params.perPage || 20)
}

export async function getCourse(id: string): Promise<Course | null> {
  try {
    const r = await pb.collection('courses_list').getOne(id) as any
    return mapCourse(r)
  } catch { return null }
}

export async function getChapters(courseId: string): Promise<Chapter[]> {
  try {
    const records = await pb.collection('course_chapters').getList(1, 500, { sort: 'order_index', filter: `course_id = "${courseId}"` })
    return records.items.map((r: any) => ({ id: r.id, course_id: r.course_id || '', chapter_title: r.chapter_title || '', order_index: r.order_index || 0, created: r.created }))
  } catch { return [] }
}

export async function getLectures(courseId: string): Promise<Lecture[]> {
  try {
    const records = await pb.collection('course_lectures').getList(1, 500, { sort: 'order_index', filter: `course_id = "${courseId}"` })
    return records.items.map((r: any) => ({ id: r.id, course_id: r.course_id || '', chapter_id: r.chapter_id || '', title: r.title || '', video_url: r.video_url || '', video_file: r.video_file || '', thumbnail: r.thumbnail || '', duration: r.duration || '0:00', order_index: r.order_index || 0, is_preview: r.is_preview ?? false, created: r.created }))
  } catch { return [] }
}

export async function getEnrollments(courseId?: string): Promise<Enrollment[]> {
  try {
    const filter = courseId ? `course_id = "${courseId}"` : getTenantFilter()
    const records = await pb.collection('course_enrollments').getList(1, 500, { sort: '-enrolled_date', filter })
    return records.items.map((r: any) => ({ id: r.id, course_id: r.course_id || '', course_title: r.course_title || '', student_name: r.student_name || '', student_email: r.student_email || '', student_avatar: r.student_avatar || '', price_paid: r.price_paid || 0, progress_percent: r.progress_percent || 0, enrolled_date: r.enrolled_date, completed_date: r.completed_date || null }))
  } catch { return [] }
}

export async function getUsers(): Promise<CourseUser[]> {
  try {
    const records = await pb.collection('course_users').getList(1, 500, { sort: '-created', filter: getTenantFilter() })
    return records.items.map((r: any) => ({ id: r.id, name: r.name || '', email: r.email || '', avatar: r.avatar || '', role: r.role || 'student', is_blocked: r.is_blocked ?? false, enrolled_courses: r.enrolled_courses || 0, created: r.created }))
  } catch { return [] }
}

export async function getCategories(): Promise<CourseCategory[]> {
  try {
    const records = await pb.collection('course_categories').getList(1, 100, { sort: 'order_index' })
    return records.items.map((r: any) => ({ id: r.id, name: r.name || '', slug: r.slug || '', description: r.description || '', icon: r.icon || '', color: r.color || '#3B82F6', order_index: r.order_index || 0, courses_count: r.courses_count || 0 }))
  } catch { return [] }
}

export async function getReviews(): Promise<CourseReview[]> {
  try {
    const records = await pb.collection('course_reviews').getList(1, 500, { sort: '-created', filter: getTenantFilter() })
    return records.items.map((r: any) => ({ id: r.id, course_id: r.course_id || '', course_title: r.course_title || '', user_name: r.user_name || '', user_avatar: r.user_avatar || '', rating: r.rating || 0, review: r.review || '', is_approved: r.is_approved ?? false, created: r.created }))
  } catch { return [] }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const records = await pb.collection('course_transactions').getList(1, 500, { sort: '-created', filter: getTenantFilter() })
    return records.items.map((r: any) => ({ id: r.id, course_id: r.course_id || '', course_title: r.course_title || '', student_name: r.student_name || '', student_email: r.student_email || '', amount: r.amount || 0, status: r.status || 'pending', payment_method: r.payment_method || '', transaction_id: r.transaction_id || '', created: r.created }))
  } catch { return [] }
}

export async function getCourseStats(): Promise<CourseStats> {
  try {
    const coursesResp = await getCourses()
    const enrollments = await getEnrollments()
    const revenue = enrollments.reduce((s, e) => s + e.price_paid, 0)
    const ratings = coursesResp.items.filter(c => c.avg_rating > 0)
    return {
      totalCourses: coursesResp.items.length,
      totalStudents: new Set(enrollments.map(e => e.student_email)).size,
      totalRevenue: revenue,
      avgRating: ratings.length > 0 ? Math.round(ratings.reduce((s, c) => s + c.avg_rating, 0) / ratings.length * 10) / 10 : 0,
      publishedCourses: coursesResp.items.filter(c => c.is_published).length,
      totalEnrollments: enrollments.length,
    }
  } catch { return { totalCourses: 0, totalStudents: 0, totalRevenue: 0, avgRating: 0, publishedCourses: 0, totalEnrollments: 0 } }
}