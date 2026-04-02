
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from 'react-router-dom'
import RootLayout     from './rootlayout/RootLayout'
import AuthPage       from './pages/AuthPage'
import DashBoard      from './pages/DashBoard'
import CustomerPage   from './pages/customer/CustomerPage.jsx'
import CustomerLayout from './components/layouts/CustomerLayout.jsx'
import RiderPage      from './pages/rider/RiderPage.jsx'
import RiderLayout from './components/layouts/RiderLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoutes'
import AdminPage      from './pages/admin/AdminPage.jsx'
import AdminLayout from './components/layouts/AdminLayout.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>

      {/* public */}
      <Route index element={<AuthPage />} />

      {/* any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashBoard />} />
      </Route>

      {/* customer — layout fetches profile once, shares via Outlet context */}
      <Route element={<ProtectedRoute allowedRole="customer" />}>
        <Route element={<CustomerLayout />}>
          <Route path="customer" element={<CustomerPage />} />
        </Route>
      </Route>

      {/* rider — layout fetches profile once, shares via Outlet context */}
      <Route element={<ProtectedRoute allowedRole="rider" />}>
        <Route element={<RiderLayout />}>
          <Route path="rider" element={<RiderPage />} />
        </Route>
      </Route>

      {/* admin */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route element ={<AdminLayout />}>
         <Route path='admin' element={<AdminPage />} />
        </Route>
      </Route>

      {/* catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Route>
  )
)

const App = () => <RouterProvider router={router} />

export default App