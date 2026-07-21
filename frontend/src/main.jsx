import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
          },
          success: {
            style: {
              background: '#059669',
              color: '#F9FAFB',
            },
          },
          error: {
            style: {
              background: '#DC2626',
              color: '#F9FAFB',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
