import React from 'react';

export class ErrorBoundary extends React.Component<{ children: any; }> {
  state = {
    hasError: false,
    error: null as any,
    errorInfo: null as any
  };
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error.message };
  }

  constructor(props: any){
    super(props);
    this.unhandledRejectionListener = this.unhandledRejectionListener.bind(this);
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Caught an error in react');
    console.error('error', error);
    console.error('errorInfo', errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack });
  }

  componentDidMount(): void {
    window.addEventListener('unhandledrejection', this.unhandledRejectionListener)
  }
  componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.unhandledRejectionListener)
  }
  unhandledRejectionListener(e: PromiseRejectionEvent) {
    console.error('Caught an error in a promise');
    console.error('Reason', e.reason.message);
    console.error('stack', e.reason.stack);
    this.setState({hasError: true, error: e.reason.message, errorInfo: e.reason.stack})
  }

  render() {
    if (this.state.hasError) {
      return <div>
        <h1>An error occurred</h1>
        <button onClick={() => window.location.reload()}>Reload</button>
        <pre>{this.state.error}</pre>
        <pre>{this.state.errorInfo}</pre>
      </div>;
    }

    return this.props.children;
  }
}
