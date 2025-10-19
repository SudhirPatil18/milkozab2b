import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import BlockedAccountModal from '../components/BlockedAccountModal'
import toast from 'react-hot-toast'

function AdminRouteProtected({ children }) {
  const navigate = useNavigate()
  const { isAuthenticated, isBlocked, admin } = useAdminAuth()
  const [showBlockedModal, setShowBlockedModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      if (isBlocked()) {
        setShowBlockedModal(true)
      } else {
        toast.error('Please login to access admin dashboard')
        navigate('/admin/login')
      }
    }
  }, [isAuthenticated, isBlocked, navigate])

  // Check if user is authenticated
  if (!isAuthenticated()) {
    if (isBlocked()) {
      return (
        <BlockedAccountModal 
          admin={admin} 
          onClose={() => {
            setShowBlockedModal(false)
            navigate('/admin/login')
          }} 
        />
      )
    }
    return null // Will redirect in useEffect
  }

  return children
}

export default AdminRouteProtected
