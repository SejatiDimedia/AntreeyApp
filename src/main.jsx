import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BusinessProvider } from './context/BusinessContext.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <App />
          <Toaster richColors position="top-right" />
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
