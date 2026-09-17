import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  failed: boolean
}

/** If WebGL throws for any reason, drop the 3D layer and keep the page usable. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('3D background disabled:', error)
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
