import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import { AdminIDDisplay } from './AdminIDDisplay';
import userReducer from '@/store/userSlice';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('AdminIDDisplay', () => {
  it('should not render when user is not admin', () => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <AdminIDDisplay id="test-id-123" />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when user is admin', () => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
    });

    // Set admin user
    store.dispatch({
      type: 'user/setUser',
      payload: {
        id: 'admin-user',
        username: 'admin',
        displayName: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        isVerified: true,
        avatarUrl: null,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <AdminIDDisplay id="test-id-123" label="Test ID" variant="badge" />
      </Provider>
    );

    // Check that the badge container is rendered
    const badge = container.querySelector('[title="Test ID: test-id-123"]');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toContain('test-id-');
  });

  it('should copy ID to clipboard on click', async () => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
    });

    store.dispatch({
      type: 'user/setUser',
      payload: {
        id: 'admin-user',
        username: 'admin',
        displayName: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        isVerified: true,
        avatarUrl: null,
      },
    });

    render(
      <Provider store={store}>
        <AdminIDDisplay id="test-id-123" variant="icon" />
      </Provider>
    );

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-id-123');
  });

  it('should render different variants correctly', () => {
    const store = configureStore({
      reducer: {
        user: userReducer,
      },
    });

    store.dispatch({
      type: 'user/setUser',
      payload: {
        id: 'admin-user',
        username: 'admin',
        displayName: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        isVerified: true,
        avatarUrl: null,
      },
    });

    // Test badge variant
    const { rerender } = render(
      <Provider store={store}>
        <AdminIDDisplay id="test-id" variant="badge" />
      </Provider>
    );

    expect(document.querySelector('[title="ID: test-id"]')).toBeInTheDocument();

    // Test icon variant
    rerender(
      <Provider store={store}>
        <AdminIDDisplay id="test-id" variant="icon" />
      </Provider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
