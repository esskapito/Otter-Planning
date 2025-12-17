import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: Explicitly extending React.Component to ensure that the 'props' property from the base class is properly recognized by the TypeScript compiler.
export class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Using class property for state initialization which is more compatible with current React TypeScript definitions.
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You could also log the error to an error reporting service here
  }

  render() {
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

    return this.props.children;
  }
}
