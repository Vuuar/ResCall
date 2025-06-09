import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Une erreur est survenue
              </h2>
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md overflow-auto">
                <p className="font-medium">Message d'erreur:</p>
                <p className="mt-2 text-sm">{this.state.error?.message || 'Erreur inconnue'}</p>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
