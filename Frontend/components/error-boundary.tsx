'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MediVault UI ErrorBoundary caught]:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-75 w-full flex flex-col items-center justify-center p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl my-4 text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Something went wrong rendering this component
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="flex items-center gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
