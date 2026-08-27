import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CartProvider } from './context/CartProvider'
import HomePage from './pages/HomePage'

// Páginas secundárias carregam sob demanda — a home abre mais rápido.
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const BrandsPage = lazy(() => import('./pages/BrandsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Painel administrativo — carregado só quando alguém acessa /admin.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'))
const AdminBrandsPage = lazy(() => import('./pages/admin/AdminBrandsPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))

function PageFallback() {
  return (
    <div className="container-page py-24 text-center text-sm text-ink-500" role="status">
      Carregando…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="produtos" element={<CatalogPage />} />
              <Route path="produtos/:slug" element={<ProductPage />} />
              <Route path="categorias" element={<CategoriesPage />} />
              <Route path="marcas" element={<BrandsPage />} />
              <Route path="sobre" element={<AboutPage />} />
              <Route path="contato" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin/entrar" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/produtos" replace />} />
              <Route path="produtos" element={<AdminProductsPage />} />
              <Route path="produtos/novo" element={<AdminProductFormPage />} />
              <Route path="produtos/:id" element={<AdminProductFormPage />} />
              <Route path="marcas" element={<AdminBrandsPage />} />
              <Route path="categorias" element={<AdminCategoriesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </CartProvider>
    </BrowserRouter>
  )
}
