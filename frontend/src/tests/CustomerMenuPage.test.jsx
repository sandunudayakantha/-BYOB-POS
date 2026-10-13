import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomerMenuPage from '../pages/public/CustomerMenuPage';
import { vi } from 'vitest';
import api from '../services/api';

// Mock the API module
vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe('CustomerMenuPage Component', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/menu/fake-qr-token']}>
          <Routes>
            <Route path="/menu/:token" element={<CustomerMenuPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    // Provide a pending promise so the component stays in loading state
    api.get.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders menu data successfully', async () => {
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          restaurant: { name: 'Test Restaurant', logo: null, coverImage: null },
          branch: { name: 'Main Branch', address: '123 Main St' },
          menu: { name: 'Lunch Menu', description: 'Delicious lunch' },
          categories: [
            { _id: 'cat1', name: 'Burgers', icon: '🍔' }
          ],
          items: [
            { _id: 'item1', name: 'Cheeseburger', price: 10, category: 'cat1', image: null }
          ]
        }
      }
    });

    renderComponent();

    // Wait for the restaurant name to appear
    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    expect(screen.getByText('Main Branch')).toBeInTheDocument();
    expect(screen.getByText('Burgers')).toBeInTheDocument();
    expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
  });

  it('renders error message on invalid token', async () => {
    api.get.mockRejectedValue({
      message: 'Invalid or expired QR code.'
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired QR code.')).toBeInTheDocument();
    });
  });
});
