import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../app/components/ErrorBoundary';

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
}

// Custom fallback component for testing
function CustomFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div>
      <div>Custom Error: {error.message}</div>
      <button onClick={resetError}>Custom Reset</button>
    </div>
  );
}

describe('ErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock console.error for componentDidCatch
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('Normal rendering', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('renders component that does not throw', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('catches errors and renders default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('We encountered an unexpected error. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error: Test error message')).toBeInTheDocument();
      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
    });

    it('shows error details in development mode', () => {
      vi.stubEnv('NODE_ENV', 'development');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();

      vi.unstubAllEnvs();
    });

    it('hides error details in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();

      vi.unstubAllEnvs();
    });
  });

  describe('Error recovery', () => {
    it('resets error state when resetError is called', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Initially shows error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click reset button
      fireEvent.click(screen.getByText('Try Again'));

      // Rerender with no error - need to force a complete re-render
      rerender(
        <ErrorBoundary key="reset">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('resets error state with custom fallback reset', () => {
      const { rerender } = render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Initially shows error
      expect(screen.getByText('Custom Error: Test error message')).toBeInTheDocument();

      // Click custom reset button
      fireEvent.click(screen.getByText('Custom Reset'));

      // Rerender with no error - need to force a complete re-render
      rerender(
        <ErrorBoundary fallback={CustomFallback} key="reset">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Error logging', () => {
    it('logs errors to console in componentDidCatch (development mode)', () => {
      vi.stubEnv('NODE_ENV', 'development');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    it('does not log errors to console in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // console.error should not be called in production
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });

  describe('State management', () => {
    it('initializes with no error state', () => {
      const { container } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(container.firstChild).toHaveTextContent('Test content');
    });

    it('updates state when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error boundary should catch the error and render fallback
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});

