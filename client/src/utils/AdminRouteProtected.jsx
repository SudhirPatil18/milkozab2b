import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function AdminRouteProtected({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const adminInfo = localStorage.getItem('adminInfo')

    if (!token || !adminInfo) {
      toast.error('Please login to access admin dashboard')
      navigate('/admin/login')
    }
  }, [navigate])

  // Check if user is authenticated
  const token = localStorage.getItem('adminToken')
  const adminInfo = localStorage.getItem('adminInfo')

  if (!token || !adminInfo) {
    return null // Will redirect in useEffect
  }

  return children
}

export default AdminRouteProtected
