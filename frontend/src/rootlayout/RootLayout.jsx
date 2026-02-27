import React from 'react'
import Navbar from '../components/layoutComps/Navbar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}

export default RootLayout