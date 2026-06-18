import { useState, useEffect, useCallback } from 'react'
import { getProducts, getCategories, getOrders, getReviews, getStats, getCustomers, getCustomer, getCustomerOrders, getSettings, getCoupons, getFlashSales, getBundles, type ShopProduct, type ShopCategory, type ShopOrder, type ShopReview, type ShopStats, type ShopCustomer, type ShopSettings, type ShopCoupon, type ShopFlashSale, type ShopBundle } from './types'
import * as api from './api'

export function useProducts() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useCategories() {
  const [categories, setCategories] = useState<ShopCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  return { categories, loading, error, refetch: fetchCategories }
}

export function useOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<ShopReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReviews(productId)
      setReviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading reviews')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  return { reviews, loading, error, refetch: fetchReviews }
}

export function useShopStats() {
  const [stats, setStats] = useState<ShopStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

export function useCustomers() {
  const [customers, setCustomers] = useState<ShopCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  return { customers, loading, error, refetch: fetchCustomers }
}

export function useCustomerOrders(email: string) {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!email) { setOrders([]); setLoading(false); return }
    setLoading(true)
    try {
      const data = await getCustomerOrders(email)
      setOrders(data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, refetch: fetchOrders }
}

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  return { settings, loading, error, refetch: fetchSettings }
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<ShopCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCoupons()
      setCoupons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  return { coupons, loading, error, refetch: fetchCoupons, create: api.createCoupon, update: api.updateCoupon, delete: api.deleteCoupon }
}

export function useFlashSales() {
  const [flashSales, setFlashSales] = useState<ShopFlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFlashSales = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getFlashSales()
      setFlashSales(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading flash sales')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFlashSales() }, [fetchFlashSales])

  return { flashSales, loading, error, refetch: fetchFlashSales, create: api.createFlashSale, update: api.updateFlashSale, delete: api.deleteFlashSale }
}

export function useBundles() {
  const [bundles, setBundles] = useState<ShopBundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBundles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBundles()
      setBundles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading bundles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBundles() }, [fetchBundles])

  return { bundles, loading, error, refetch: fetchBundles, create: api.createBundle, update: api.updateBundle, delete: api.deleteBundle }
}
