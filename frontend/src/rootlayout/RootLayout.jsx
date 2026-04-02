// rootlayout/RootLayout.jsx
// RootLayout is now just a shell — no navbar here.
// Each role layout (CustomerLayout, RiderLayout) renders its own navbar.
// Only public/shared pages (AuthPage, Dashboard) go through RootLayout directly.
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return <Outlet />
}

export default RootLayout