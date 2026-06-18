import { useState, useEffect, useCallback } from 'react'
import { getCourses, getCourse, getChapters, getLectures, getEnrollments, getCourseStats, type Course, type Chapter, type Lecture, type Enrollment, type CourseStats, type PaginatedResponse, type LessonProgress } from './types'
import * as api from './api'

export function useCourses(page = 1, perPage = 20) {
  const [response, setResponse] = useState<PaginatedResponse<Course>>({
    items: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setResponse(await getCourses(page, perPage)) } catch (e: any) { setError(e?.message) } finally { setLoading(false) }
  }, [page, perPage])
  useEffect(() => { fetch() }, [fetch])
  return { courses: response.items, pagination: response, loading, error, refetch: fetch }
}

export function useCourse(id: string | null) {
  const [course, setCourse] = useState<Course | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    try {
      const [c, ch, le, en] = await Promise.all([getCourse(id), getChapters(id), getLectures(id), getEnrollments(id)])
      setCourse(c); setChapters(ch); setLectures(le); setEnrollments(en)
    } catch {} finally { setLoading(false) }
  }, [id])
  useEffect(() => { fetch() }, [fetch])
  return { course, chapters, lectures, enrollments, loading, refetch: fetch }
}

export function useCourseStats() {
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const fetch = useCallback(async () => { setLoading(true); try { setStats(await getCourseStats()) } catch {} finally { setLoading(false) } }, [])
  useEffect(() => { fetch() }, [fetch])
  return { stats, loading, refetch: fetch }
}

export function useStudentProgress(enrollmentId: string | null) {
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!enrollmentId) { setProgress([]); return }
    setLoading(true)
    try {
      const data = await api.getStudentProgress(enrollmentId)
      setProgress(data)
    } catch {} finally { setLoading(false) }
  }, [enrollmentId])

  useEffect(() => { fetch() }, [fetch])

  return { progress, loading, refetch: fetch }
}

export function useEnrollment(enrollmentId: string | null) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!enrollmentId) { setEnrollment(null); return }
    setLoading(true)
    try {
      const data = await api.getEnrollmentById(enrollmentId)
      setEnrollment(data)
    } catch {} finally { setLoading(false) }
  }, [enrollmentId])

  useEffect(() => { fetch() }, [fetch])

  return { enrollment, loading, refetch: fetch }
}
