import './App.css'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { HeadAdminAuthProvider } from './contexts/HeadAdminAuthContext'
import { CartProvider } from './contexts/CartContext'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <HeadAdminAuthProvider>
          <CartProvider>
            <AppRoutes/>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </HeadAdminAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
