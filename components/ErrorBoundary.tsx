import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
// FIX: Using React.Component explicitly with generic types for props and state ensures that 'this.props' and 'this.state' are correctly typed and recognized by the TypeScript compiler.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
          <div className="text-center max-w-md">
             <h1 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-4">Oups ! Quelque chose s'est mal passé.</h1>
             <p className="text-slate-600 dark:text-slate-400 mb-6">
                Une erreur inattendue est survenue. Veuillez essayer de rafraîchir la page. Si le problème persiste, vous pouvez essayer de vider les données de l'application.
             </p>
             <button
               onClick={() => window.location.reload()}
               className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
             >
                Rafraîchir la page
             </button>
          </div>
        </div>
      );
    }

    // FIX: 'this.props' is now correctly inherited from the React.Component base class.
    return this.props.children;
  }
}