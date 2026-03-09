import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom'
import RootLayout from './rootlayout/RootLayout'
import AuthPage from './pages/AuthPage'
import DashBoard from './pages/DashBoard'
import CustomerPage from './pages/customer/CustomerPage.jsx'
import RiderPage from './pages/rider/RiderPage.jsx'
import ProtectedRoute from './routes/ProtectedRoutes'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>

      {/* public */}
      <Route index element={<AuthPage />} />

      {/* any logged in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashBoard />} />
      </Route>

      {/* customer only */}
      <Route element={<ProtectedRoute allowedRole="customer" />}>
        <Route path="customer" element={<CustomerPage />} />
      </Route>

      {/* rider only */}
      <Route element={<ProtectedRoute allowedRole="rider" />}>
        <Route path="rider" element={<RiderPage />} />
      </Route>

      {/* catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Route>
  )
)

const App = () => {
  return <RouterProvider router={router} />
}

export default App