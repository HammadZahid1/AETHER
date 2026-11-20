import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Prevents a renderer exception from taking down the entire workspace. */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('AETHER renderer error', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="aether-panel max-w-md p-5 text-center">
          <Icon name="storm" size={28} className="mx-auto text-[var(--aether-danger)]" />
          <h2 className="mt-3 text-[13px] font-semibold text-[var(--aether-text)]">Viewport stopped unexpectedly</h2>
          <p className="mt-2 text-[11px] leading-snug text-[var(--aether-text-muted)]">
            The 3D renderer encountered an error. Your simulation settings and saved data are unaffected.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="aether-panel mt-4 px-3 py-1.5 text-[11px] text-[var(--aether-accent)]"
          >
            Retry viewport
          </button>
        </div>
      </div>
    );
  }
}
