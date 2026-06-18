import { pb } from '@/lib/pocketbase'
import type { Course, Chapter, Lecture, CourseRating, CourseUser, CourseCategory, CourseReview, Transaction } from './types'

export async function uploadCourseThumbnail(file: File, courseId: string): Promise<string> {
  const formData = new FormData()
  formData.append('thumbnail', file)
  const record = await pb.collection('courses_list').update(courseId, formData)
  return pb.files.getURL(record, record.thumbnail) as string
}

export async function uploadLectureVideo(file: File, lectureId: string): Promise<string> {
  const formData = new FormData()
  formData.append('video_file', file)
  const record = await pb.collection('course_lectures').update(lectureId, formData)
  return pb.files.getURL(record, record.video_file) as string
}

export async function uploadLectureThumbnail(file: File, lectureId: string): Promise<string> {
  const formData = new FormData()
  formData.append('thumbnail', file)
  const record = await pb.collection('course_lectures').update(lectureId, formData)
  return pb.files.getURL(record, record.thumbnail) as string
}

export async function uploadMediaFile(file: File, bucketName: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', file.name)
  formData.append('bucket_name', bucketName)
  const record = await pb.collection('media').create(formData)
  return pb.files.getURL(record, record.file) as string
}

export async function createCourse(data: Partial<Course>): Promise<string | null> {
  try {
    const record = await pb.collection('courses_list').create({
      title: data.title || 'Nowy kurs', description: data.description || '',
      price: data.price || 0, discount: data.discount || 0, thumbnail: data.thumbnail || '',
      educator_id: data.educator_id || '', educator_name: data.educator_name || '',
      educator_avatar: data.educator_avatar || '',
      is_published: data.is_published ?? false,
      category: data.category || '', level: data.level || 'all', language: data.language || 'Polski', estimated_duration: data.estimated_duration || 0,
      requirements: data.requirements || [],
      what_you_will_learn: data.what_you_will_learn || [],
      tags: data.tags || [], ratings: [],
      enrolled_count: 0, avg_rating: 0, ratings_count: 0,
      total_duration: data.total_duration || 0, chapters_count: data.chapters_count || 0,
    })
    return record.id
  } catch (e) { console.error('createCourse:', e); return null }
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<boolean> {
  try {
    await pb.collection('courses_list').update(id, {
      title: data.title, description: data.description,
      price: data.price, discount: data.discount, thumbnail: data.thumbnail,
      educator_id: data.educator_id, educator_name: data.educator_name,
      educator_avatar: data.educator_avatar, is_published: data.is_published,
      category: data.category, level: data.level, language: data.language,
      estimated_duration: data.estimated_duration,
      requirements: data.requirements, what_you_will_learn: data.what_you_will_learn,
      tags: data.tags, ratings: data.ratings,
      enrolled_count: data.enrolled_count, avg_rating: data.avg_rating,
      ratings_count: data.ratings_count, total_duration: data.total_duration,
      chapters_count: data.chapters_count,
    })
    return true
  } catch (e) { console.error('updateCourse:', e); return false }
}

export async function deleteCourse(id: string): Promise<boolean> {
  try { await pb.collection('courses_list').delete(id); return true } catch (e) { return false }
}

export async function togglePublishCourse(id: string, publish: boolean): Promise<boolean> {
  try { await pb.collection('courses_list').update(id, { is_published: publish }); return true } catch (e) { return false }
}

export async function createChapter(data: { course_id: string; chapter_title: string; order_index: number }): Promise<string | null> {
  try { const r = await pb.collection('course_chapters').create(data); return r.id } catch (e) { return null }
}

export async function updateChapter(id: string, data: Partial<Chapter>): Promise<boolean> {
  try { await pb.collection('course_chapters').update(id, { chapter_title: data.chapter_title, order_index: data.order_index }); return true } catch (e) { return false }
}

export async function deleteChapter(id: string): Promise<boolean> {
  try { await pb.collection('course_chapters').delete(id); return true } catch (e) { return false }
}

export async function reorderChapters(chapters: Chapter[]): Promise<boolean> {
  try {
    await Promise.all(chapters.map((ch, i) => pb.collection('course_chapters').update(ch.id, { order_index: i + 1 })));
    return true
  } catch (e) { return false }
}

export async function createLecture(data: { course_id: string; chapter_id: string; title: string; video_url: string; video_file: string; thumbnail: string; duration: string; order_index: number; is_preview?: boolean }): Promise<string | null> {
  try { const r = await pb.collection('course_lectures').create({ ...data, is_preview: data.is_preview ?? false }); return r.id } catch (e) { return null }
}

export async function updateLecture(id: string, data: Partial<Lecture>): Promise<boolean> {
  try { await pb.collection('course_lectures').update(id, data); return true } catch (e) { return false }
}

export async function deleteLecture(id: string): Promise<boolean> {
  try { await pb.collection('course_lectures').delete(id); return true } catch (e) { return false }
}

export async function reorderLectures(lectures: Lecture[]): Promise<boolean> {
  try { await Promise.all(lectures.map((l, i) => pb.collection('course_lectures').update(l.id, { order_index: i + 1 }))); return true } catch (e) { return false }
}

export async function createUser(data: Partial<CourseUser>): Promise<string | null> {
  try { const r = await pb.collection('course_users').create(data); return r.id } catch (e) { return null }
}

export async function updateUser(id: string, data: Partial<CourseUser>): Promise<boolean> {
  try { await pb.collection('course_users').update(id, data); return true } catch (e) { return false }
}

export async function deleteUser(id: string): Promise<boolean> {
  try { await pb.collection('course_users').delete(id); return true } catch (e) { return false }
}

export async function createCategory(data: Partial<CourseCategory>): Promise<string | null> {
  try { const r = await pb.collection('course_categories').create(data); return r.id } catch (e) { return null }
}

export async function updateCategory(id: string, data: Partial<CourseCategory>): Promise<boolean> {
  try { await pb.collection('course_categories').update(id, data); return true } catch (e) { return false }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try { await pb.collection('course_categories').delete(id); return true } catch (e) { return false }
}

export async function approveReview(id: string, approved: boolean): Promise<boolean> {
  try { await pb.collection('course_reviews').update(id, { is_approved: approved }); return true } catch (e) { return false }
}

export async function deleteReview(id: string): Promise<boolean> {
  try { await pb.collection('course_reviews').delete(id); return true } catch (e) { return false }
}

export async function getVideoUrl(lectureId: string, filename: string): Promise<string> {
  return pb.files.getURL({ id: lectureId } as any, filename) as string
}

export async function getQuizzes(lectureId: string) {
  try {
    const records = await pb.collection('course_quizzes').getList(1, 100, { sort: 'order_index', filter: `lecture_id = "${lectureId}"` })
    return records.items.map((r: any) => ({
      id: r.id,
      lecture_id: r.lecture_id || '',
      question: r.question || '',
      options: Array.isArray(r.options) ? r.options : (r.options ? JSON.parse(r.options) : ['', '', '', '']),
      correct_answer: r.correct_answer ?? 0,
      explanation: r.explanation || '',
      order_index: r.order_index || 0,
      created: r.created
    }))
  } catch { return [] }
}

export async function createQuiz(data: { lecture_id: string; question: string; options: string[]; correct_answer: number; explanation: string; order_index: number }) {
  try { const r = await pb.collection('course_quizzes').create(data); return r.id } catch (e) { console.error(e); return null }
}

export async function updateQuiz(id: string, data: { question: string; options: string[]; correct_answer: number; explanation: string }) {
  try { await pb.collection('course_quizzes').update(id, data); return true } catch (e) { return false }
}

export async function removeQuiz(id: string) {
  try { await pb.collection('course_quizzes').delete(id); return true } catch { return false }
}

export { removeQuiz as deleteQuiz };
export { uploadMaterialFile as uploadMaterial };

export async function uploadMaterialFile(file: File, lectureId: string, title: string, description: string) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lecture_id', lectureId)
    formData.append('title', title)
    formData.append('file_name', file.name)
    formData.append('file_type', file.type)
    formData.append('file_size', file.size.toString())
    formData.append('description', description || '')
    const record = await pb.collection('course_materials').create(formData)
    return pb.files.getURL(record, record.file) as string
  } catch (e) { console.error(e); return null }
}

export async function getMaterials(lectureId: string) {
  try {
    const records = await pb.collection('course_materials').getList(1, 100, { filter: `lecture_id = "${lectureId}"` })
    return records.items.map((r: any) => ({
      id: r.id,
      lecture_id: r.lecture_id || '',
      title: r.title || '',
      file: r.file ? pb.files.getURL(r, r.file) as string : '',
      file_name: r.file_name || '',
      file_type: r.file_type || '',
      file_size: r.file_size || 0,
      description: r.description || '',
      created: r.created
    }))
  } catch { return [] }
}

export async function deleteMaterial(id: string) {
  try { await pb.collection('course_materials').delete(id); return true } catch { return false }
}

export async function getLessonProgress(enrollmentId: string) {
  try {
    const records = await pb.collection('lesson_progress').getList(1, 500, { filter: `enrollment_id = "${enrollmentId}"` })
    return records.items.map((r: any) => ({
      id: r.id,
      enrollment_id: r.enrollment_id || '',
      lecture_id: r.lecture_id || '',
      watch_percent: r.watch_percent || 0,
      last_position: r.last_position || 0,
      completed: r.completed ?? false,
      completed_at: r.completed_at || null,
      created: r.created
    }))
  } catch { return [] }
}

export async function updateLessonProgressItem(enrollmentId: string, lectureId: string, watchPercent: number, lastPosition: number, completed: boolean) {
  try {
    const existing = await pb.collection('lesson_progress').getList(1, 1, { filter: `enrollment_id = "${enrollmentId}" && lecture_id = "${lectureId}"` })
    if (existing.items.length > 0) {
      await pb.collection('lesson_progress').update(existing.items[0].id, {
        watch_percent: watchPercent, last_position: lastPosition,
        completed, completed_at: completed ? new Date().toISOString() : null
      })
    } else {
      await pb.collection('lesson_progress').create({
        enrollment_id: enrollmentId, lecture_id: lectureId,
        watch_percent: watchPercent, last_position: lastPosition,
        completed, completed_at: completed ? new Date().toISOString() : null
      })
    }
    return true
  } catch (e) { console.error(e); return false }
}

export async function createManualEnrollment(data: { course_id: string; course_title: string; student_name: string; student_email: string; price_paid: number }) {
  try {
    const r = await pb.collection('course_enrollments').create({
      ...data, progress_percent: 0, enrolled_date: new Date().toISOString()
    })
    return r.id
  } catch (e) { console.error(e); return null }
}

export async function updateEnrollmentStats(enrollmentId: string, progressPercent: number) {
  try {
    await pb.collection('course_enrollments').update(enrollmentId, { progress_percent: progressPercent })
    return true
  } catch { return false }
}

export async function createStripeCheckout(courseId: string, courseTitle: string, price: number, studentEmail: string) {
  try {
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, courseTitle, price, studentEmail })
    })
    const data = await res.json()
    return data.url || null
  } catch (e) { console.error(e); return null }
}

export async function getStudentEnrollments(studentEmail: string) {
  try {
    const records = await pb.collection('course_enrollments').getList(1, 100, {
      filter: `student_email = "${studentEmail}"`,
      sort: '-enrolled_date'
    })
    return records.items.map((r: any) => ({
      id: r.id,
      course_id: r.course_id || '',
      course_title: r.course_title || '',
      student_name: r.student_name || '',
      student_email: r.student_email || '',
      price_paid: r.price_paid || 0,
      progress_percent: r.progress_percent || 0,
      enrolled_date: r.enrolled_date,
      completed_date: r.completed_date || null,
    }))
  } catch { return [] }
}

export async function getStudentProgress(enrollmentId: string) {
  try {
    const records = await pb.collection('lesson_progress').getList(1, 500, {
      filter: `enrollment_id = "${enrollmentId}"`,
      sort: '-updated'
    })
    return records.items.map((r: any) => ({
      id: r.id,
      enrollment_id: r.enrollment_id || '',
      lecture_id: r.lecture_id || '',
      watch_percent: r.watch_percent || 0,
      last_position: r.last_position || 0,
      completed: r.completed ?? false,
      completed_at: r.completed_at || null,
      created: r.created,
      updated: r.updated,
    }))
  } catch { return [] }
}

export async function markLessonComplete(enrollmentId: string, lectureId: string) {
  try {
    const existing = await pb.collection('lesson_progress').getList(1, 1, {
      filter: `enrollment_id = "${enrollmentId}" && lecture_id = "${lectureId}"`
    })
    const now = new Date().toISOString()
    
    if (existing.items.length > 0) {
      await pb.collection('lesson_progress').update(existing.items[0].id, {
        completed: true,
        watch_percent: 100,
        completed_at: now,
      })
    } else {
      await pb.collection('lesson_progress').create({
        enrollment_id: enrollmentId,
        lecture_id: lectureId,
        completed: true,
        watch_percent: 100,
        last_position: 0,
        completed_at: now,
      })
    }
    return true
  } catch (e) { console.error(e); return false }
}

export async function getEnrollmentById(enrollmentId: string) {
  try {
    const r = await pb.collection('course_enrollments').getOne(enrollmentId)
    return {
      id: r.id,
      course_id: r.course_id || '',
      course_title: r.course_title || '',
      student_name: r.student_name || '',
      student_email: r.student_email || '',
      student_avatar: r.student_avatar || '',
      price_paid: r.price_paid || 0,
      progress_percent: r.progress_percent || 0,
      enrolled_date: r.enrolled_date,
      completed_date: r.completed_date || null,
    }
  } catch { return null }
}

export async function getLastLesson(enrollmentId: string) {
  try {
    const progress = await pb.collection('lesson_progress').getList(1, 1, {
      filter: `enrollment_id = "${enrollmentId}"`,
      sort: '-updated'
    })
    if (progress.items.length > 0) {
      return {
        lecture_id: progress.items[0].lecture_id,
        last_position: progress.items[0].last_position || 0,
        completed: progress.items[0].completed ?? false,
      }
    }
    return null
  } catch { return null }
}
