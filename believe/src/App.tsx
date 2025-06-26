import React from 'react'
import AppRouter from './router'
import './styles/globals.css'
import { Toaster } from 'react-hot-toast'

export function App() {
  return (
    <>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              border: '1px solid #10B981',
            },
          },
          error: {
            style: {
              border: '1px solid #EF4444',
            },
          },
        }}
      />
    </>
  )
}
