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
// Fix: Use React.Component explicitly to ensure 'state' and 'props' are correctly inherited and recognized by the TypeScript compiler.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Define state as a class property instead of only in the constructor to ensure 'this.state' is correctly recognized.
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Fix: 'state' is now correctly recognized as an inherited property from React.Component.
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

    // Fix: 'props' is now correctly recognized as an inherited property from React.Component.
    return this.props.children;
  }
}
