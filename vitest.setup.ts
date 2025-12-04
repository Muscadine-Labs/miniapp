import '@testing-library/jest-dom';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Ensure React is available globally for JSX and class components
global.React = React;

// Ensure React DOM is available (critical for CI)
interface GlobalWithCreateRoot {
  createRoot?: typeof createRoot;
}
const globalWithCreateRoot = global as unknown as GlobalWithCreateRoot;
if (typeof globalWithCreateRoot.createRoot === 'undefined') {
  globalWithCreateRoot.createRoot = createRoot;
}

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock process.env
Object.defineProperty(process, 'env', {
  value: {
    NODE_ENV: 'test',
  },
  writable: true,
});

// Ensure document structure exists (critical for CI where JSDOM may not be fully initialized)
if (!document.documentElement) {
  const html = document.createElement('html');
  const body = document.createElement('body');
  html.appendChild(body);
  
  Object.defineProperty(document, 'documentElement', {
    value: html,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(document, 'body', {
    value: body,
    writable: false,
    configurable: true
  });
} else if (!document.body) {
  const body = document.createElement('body');
  document.documentElement.appendChild(body);
  
  Object.defineProperty(document, 'body', {
    value: body,
    writable: false,
    configurable: true
  });
}

// Mock additional browser APIs (needed for CI and some local environments)
if (!window.getComputedStyle || process.env.CI) {
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => '',
    }),
  });
}

// Mock ResizeObserver if not available
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock IntersectionObserver if not available
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof IntersectionObserver;
}


