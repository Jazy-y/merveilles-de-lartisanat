'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // If it's a hydration error, try to recover
    if (error.message.includes('hydration') || 
        error.message.includes('bis_skin_checked') ||
        error.message.includes('server rendered HTML') ||
        error.message.includes('client properties')) {

      // Remove problematic attributes immediately
      try {
        const bisElements = document.querySelectorAll('[bis_skin_checked]');
        bisElements.forEach(element => {
          element.removeAttribute('bis_skin_checked');
        });
        
        const dataBisElements = document.querySelectorAll('[data-bis_skin_checked]');
        dataBisElements.forEach(element => {
          element.removeAttribute('data-bis_skin_checked');
        });
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.warn('Error removing attributes:', e);
      }
      
      // Try to recover after a short delay
      setTimeout(() => {
        this.setState({ hasError: false })
      }, 1000)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              The page encountered an error. This might be caused by a browser extension.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
