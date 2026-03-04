import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import RootLayout from './rootlayout/RootLayout'
import AuthPage from './pages/AuthPage'
import DashBoard from './pages/DashBoard'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<AuthPage />} />
      <Route path="dashboard" element={<DashBoard />}/>
    </Route>
  )
)
const App = () => {
  return (
    <RouterProvider router={router} />
    // <DashBoard />
  )
}
export default App