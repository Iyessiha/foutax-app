import React, { useEffect } from 'react';
import { JSDOM } from 'jsdom';

// Minimal jsdom environment for tests
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.localStorage = dom.window.localStorage;
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx';

function RegTester() {
  const { register, user } = useAuth();
  useEffect(()=>{
    (async ()=>{
      await register({ name: 'Test', email: 'test@example.com', password: 'password123' });
    })();
  }, [register]);
  return <div data-testid="u-mail">{user?.email || 'no'}</div>;
}

function LoginTester() {
  const { login, user } = useAuth();
  useEffect(()=>{
    (async ()=>{
      await login({ email: 'test@example.com', password: 'password123' });
    })();
  }, [login]);
  return <div data-testid="u-mail">{user?.email || 'no'}</div>;
}

describe('Auth flows (local)', () => {
  // Provide a minimal localStorage mock if not present (jsdom/environment differences)
  const ensureLocalStorage = () => {
    if (typeof global.localStorage === 'undefined') {
      let store = {};
      global.localStorage = {
        getItem: (k) => store[k] ?? null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; },
      };
    }
  };

  beforeEach(() => {
    ensureLocalStorage();
    localStorage.clear();
  });

  it('register stores user and exposes it', async () => {
    render(
      <AuthProvider>
        <RegTester />
      </AuthProvider>
    );

    await waitFor(() => expect(localStorage.getItem('fx_user')).not.toBeNull());
    const s = JSON.parse(localStorage.getItem('fx_user'));
    expect(s.email).toBe('test@example.com');
    expect(s.password).toBe('password123');
  });

  it('login with password works and grants XP', async () => {
    // prepare a stored user
    const u = { name: 'Test', email: 'test@example.com', password: 'password123', xp: 0, lastLogin: new Date().toISOString() };
    localStorage.setItem('fx_user', JSON.stringify(u));

    render(
      <AuthProvider>
        <LoginTester />
      </AuthProvider>
    );

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('fx_user'));
      // login should add XP (LOGIN = 50)
      expect(stored.xp).toBeGreaterThanOrEqual(50);
    });
  });
});
