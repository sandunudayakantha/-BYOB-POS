import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import { vi } from 'vitest';
import api from '../services/api';

// Mock the API module
vi.mock('../services/api', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the initial /auth/me call to fail (user is not logged in)
    api.get.mockRejectedValue(new Error('Not logged in'));
  });

  it('renders the login form', async () => {
    renderLoginPage();
    
    // Wait for AuthProvider to finish its initial loading state
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    api.post.mockRejectedValue({ message: 'Invalid credentials' });
    
    renderLoginPage();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrong' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('calls the login API successfully', async () => {
    api.post.mockResolvedValue({
      data: {
        user: { name: 'Test User', role: 'RESTAURANT_OWNER' },
        accessToken: 'fake-token'
      }
    });

    renderLoginPage();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'owner@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'owner@test.com',
        password: 'password123'
      });
    });
  });
});
