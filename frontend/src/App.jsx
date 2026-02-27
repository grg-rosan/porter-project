import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './rootlayout/RootLayout'
import AuthPage from './pages/AuthPage'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<AuthPage />} />
      {/* <Route  path='register' element={< />} /> */}
      {/* <Route path='consumer' element={<ConsumerDashboard />} />
      <Route path='rider' element={<RiderDashboard />} /> */}
    </Route>
  )
)
const App = () => {
  return (
    <RouterProvider router={router} />
  )
}
export default App