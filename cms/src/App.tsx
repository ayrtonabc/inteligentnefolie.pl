import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { SiteProvider } from './context/SiteContext'
import { LanguageProvider } from './context/LanguageContext'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import AuthLayout from './components/AuthLayout'
import DashboardLayout from './components/DashboardLayout'
import Login from './pages/Login'
import BlogList from './pages/BlogList'
import CategoryList from './pages/CategoryList'
import KitchenStandalone from './pages/restaurant/KitchenDisplayStandalone'
import { pb } from '@/lib/pocketbase'
import './App.css'

const queryClient = new QueryClient()

const requireAuthLoader = async () => {
  // Check PocketBase session
  if (!pb.authStore.isValid) {
    throw redirect('/login')
  }
  return null
}

const redirectIfAuthenticatedLoader = async () => {
  if (pb.authStore.isValid) {
    throw redirect('/website')
  }
  return null
}

const router = createBrowserRouter(
  [
    {
      element: <AuthLayout />,
      children: [
        {
          path: '/login',
          loader: redirectIfAuthenticatedLoader,
          element: <Login />,
        },
      ],
    },
    {
      path: '/',
      element: <DashboardLayout />,
      loader: requireAuthLoader,
      children: [
        { index: true, loader: () => redirect('website') },
        {
          path: 'website',
          lazy: async () => {
            const { default: Website } = await import('./pages/Website')
            return { Component: Website }
          },
        },
        {
          path: 'pages',
          lazy: async () => {
            const { default: Pages } = await import('./pages/Pages')
            return { Component: Pages }
          },
        },
        {
          path: 'visual-cms/:slug',
          lazy: async () => {
            const { default: VisualEditor } = await import('./pages/VisualEditor')
            return { Component: VisualEditor }
          },
        },
        {
          path: 'pages/:id',
          lazy: async () => {
            const { default: PageEditor } = await import('./pages/PageEditor')
            return { Component: PageEditor }
          },
        },
        {
          path: 'media',
          lazy: async () => {
            const { default: Media } = await import('./pages/Media')
            return { Component: Media }
          },
        },
        {
          path: 'seo',
          lazy: async () => {
            const { default: Seo } = await import('./pages/Seo')
            return { Component: Seo }
          },
        },
        {
          path: 'popups',
          lazy: async () => {
            const { default: Popups } = await import('./pages/Popups')
            return { Component: Popups }
          },
        },
        {
          path: 'leads',
          lazy: async () => {
            const { default: Leads } = await import('./pages/Leads')
            return { Component: Leads }
          },
        },
        { path: 'blog', element: <BlogList /> },
        {
          path: 'blog/new',
          lazy: async () => {
            const { default: BlogForm } = await import('./pages/BlogForm')
            return { Component: BlogForm }
          },
        },
        {
          path: 'blog/:id',
          lazy: async () => {
            const { default: BlogForm } = await import('./pages/BlogForm')
            return { Component: BlogForm }
          },
        },
        { path: 'blog/categories', element: <CategoryList /> },
        {
          path: 'addons',
          lazy: async () => {
            const { default: Addons } = await import('./pages/Addons')
            return { Component: Addons }
          },
        },
        {
          path: 'shop/*',
          lazy: async () => {
            const { default: Shop } = await import('./pages/shop/Shop')
            return { Component: Shop }
          },
        },
        {
          path: 'courses/*',
          lazy: async () => {
            const { default: Courses } = await import('./pages/Courses')
            return { Component: Courses }
          },
        },
        {
          path: 'restaurant/*',
          lazy: async () => {
            const { default: Restaurant } = await import('./pages/menu/RestaurantPage')
            return { Component: Restaurant }
          },
        },
        {
          path: 'bookings/*',
          lazy: async () => {
            const { default: Bookings } = await import('./pages/Bookings')
            return { Component: Bookings }
          },
        },
        {
          path: 'languages/*',
          lazy: async () => {
            const { default: Languages } = await import('./pages/Languages')
            return { Component: Languages }
          },
        },
        {
          path: 'multilang/*',
          lazy: async () => {
            const { default: Languages } = await import('./pages/Languages')
            return { Component: Languages }
          },
        },
        {
          path: 'portfolio/*',
          lazy: async () => {
            const { default: Portfolio } = await import('./pages/Portfolio')
            return { Component: Portfolio }
          },
        },
        {
          path: 'settings',
          lazy: async () => {
            const { default: Settings } = await import('./pages/Settings')
            return { Component: Settings }
          },
        },
        {
          path: 'sites',
          lazy: async () => {
            const { default: Sites } = await import('./pages/Sites')
            return { Component: Sites }
          },
        },
        {
          path: 'ai',
          lazy: async () => {
            const { default: AiSettings } = await import('./pages/AiSettings')
            return { Component: AiSettings }
          },
        },
        {
          path: 'docs',
          lazy: async () => {
            const { default: DocsPage } = await import('./pages/DocsPage')
            return { Component: DocsPage }
          },
        },
        { path: '*', loader: () => redirect('website') },
      ],
    },
  ],
  { basename: '/panel' },
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteProvider>
          <ErrorBoundary name="App">
            <LanguageProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </LanguageProvider>
          </ErrorBoundary>
        </SiteProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
