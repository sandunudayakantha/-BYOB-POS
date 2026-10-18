import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import InventoryPage from '../pages/owner/InventoryPage';
import api from '../services/api';

// Mock API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock BranchContext
vi.mock('../contexts/BranchContext', () => ({
  useBranch: () => ({
    activeBranch: { _id: 1, name: 'Main Branch' },
  }),
}));

// Mock Modal component to render children directly when isOpen is true
vi.mock('../components/Modal', () => ({
  default: ({ isOpen, title, children }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h3>{title}</h3>
        {children}
      </div>
    );
  },
}));
vi.mock('../../components/Modal', () => ({
  default: ({ isOpen, title, children }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h3>{title}</h3>
        {children}
      </div>
    );
  },
}));
vi.mock('../components/Modal.jsx', () => ({
  default: ({ isOpen, title, children }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h3>{title}</h3>
        {children}
      </div>
    );
  },
}));

const mockRawItems = [
  {
    id: 101,
    name: 'Whole Broiler Chicken',
    sku: 'CHK-001',
    item_type: 'RAW_MATERIAL',
    current_stock: 45.5,
    unit_cost: 950.0,
    reorder_threshold: 20.0,
    uom_id: 1,
    uom_name: 'Kilogram',
    uom_symbol: 'kg',
    supplier_id: 5,
    supplier_name: 'Ceylon Poultry Suppliers',
    is_active: true,
  },
  {
    id: 102,
    name: 'Beef Tenderloin',
    sku: 'BF-002',
    item_type: 'RAW_MATERIAL',
    current_stock: 8.0,
    unit_cost: 2400.0,
    reorder_threshold: 15.0, // Low stock triggers alert
    uom_id: 1,
    uom_name: 'Kilogram',
    uom_symbol: 'kg',
    supplier_id: null,
    supplier_name: null,
    is_active: true,
  },
];

const mockPreps = [
  {
    id: 201,
    name: 'Chicken Rice Portion',
    base_raw_item_id: 101,
    base_raw_item_name: 'Whole Broiler Chicken',
    base_raw_item_uom_symbol: 'kg',
    uom_id: 3,
    uom_symbol: 'portion',
    portion_size_value: 120.0,
    portion_size_uom_id: 2,
    portion_size_uom_symbol: 'g',
    current_stock: 25.0,
    expected_yield_percent: 85.0,
    requires_image_evidence: true,
    track_wastage: true,
    requires_wastage_image: false,
  },
];

const mockBatches = [
  {
    id: 301,
    prep_definition_id: 201,
    prep_definition_name: 'Chicken Rice Portion',
    base_raw_item_id: 101,
    base_raw_item_name: 'Whole Broiler Chicken',
    base_raw_item_uom_symbol: 'kg',
    output_uom_symbol: 'portion',
    prepared_by_user_id: 1,
    prepared_by_name: 'Chef Sunil',
    raw_input_quantity: 10.0,
    actual_yield_quantity: 70.0,
    wastage_quantity: 1.6,
    wastage_reason: 'Skin and excessive fat trimmed off',
    wastage_image_url: 'https://images.example.com/waste_101.jpg',
    calculated_unit_cost: 135.7,
    status: 'COMPLETED',
    created_at: '2026-10-17T10:30:00Z',
  },
];

const mockUoms = [
  { id: 1, name: 'Kilogram', symbol: 'kg', uom_type: 'WEIGHT' },
  { id: 2, name: 'Gram', symbol: 'g', uom_type: 'WEIGHT' },
  { id: 3, name: 'Portion', symbol: 'portion', uom_type: 'PIECE_COUNT' },
];

const renderInventoryPage = (initialEntries = ['/inventory']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <InventoryPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('InventoryPage Component & Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.get.mockImplementation((url) => {
      if (url.includes('/inventory/items') && url.includes('/batches')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/inventory/items')) {
        return Promise.resolve({ data: mockRawItems });
      }
      if (url.includes('/inventory/preps/definitions')) {
        return Promise.resolve({ data: mockPreps });
      }
      if (url.includes('/inventory/preps/batches')) {
        return Promise.resolve({ data: mockBatches });
      }
      if (url.includes('/inventory/uoms')) {
        return Promise.resolve({ data: mockUoms });
      }
      if (url.includes('/inventory/suppliers')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders raw materials list with stock levels and low stock badge', async () => {
    renderInventoryPage();

    await waitFor(() => {
      expect(screen.getByText('Whole Broiler Chicken')).toBeInTheDocument();
      expect(screen.getByText('Beef Tenderloin')).toBeInTheDocument();
    });

    // Low stock warning for Beef Tenderloin (8 <= 15)
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('navigates to Raw Item Details page with KPIs, Preps, and Wastage Log', async () => {
    renderInventoryPage();

    await waitFor(() => {
      expect(screen.getByText('Whole Broiler Chicken')).toBeInTheDocument();
    });

    // Click on item name to open detail view
    fireEvent.click(screen.getByText('Whole Broiler Chicken'));

    // Check Detail Header
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Whole Broiler Chicken' })).toBeInTheDocument();
    });

    // Check KPIs
    expect(screen.getByText('Total Current Stock')).toBeInTheDocument();
    expect(screen.getByText('Weighted Unit Cost')).toBeInTheDocument();
    expect(screen.getByText('Trimmings / Wastage')).toBeInTheDocument();

    // Check Kitchen Preps card with portion badge
    expect(screen.getAllByText('Chicken Rice Portion').length).toBeGreaterThan(0);
    expect(screen.getByText(/⚖️ 120 g \/ portion/i)).toBeInTheDocument();

    // Check Preparation Wastage & Trimmings Log table
    expect(screen.getByText(/Preparation Wastage & Trimmings Log/i)).toBeInTheDocument();
    expect(screen.getByText('Skin and excessive fat trimmed off')).toBeInTheDocument();
    expect(screen.getAllByText('1.60 kg').length).toBeGreaterThan(0);
  });

  it('opens and populates the Edit Raw Item modal', async () => {
    renderInventoryPage();

    await waitFor(() => {
      expect(screen.getByText('Whole Broiler Chicken')).toBeInTheDocument();
    });

    // Click on item name to open detail view
    fireEvent.click(screen.getByText('Whole Broiler Chicken'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit Item/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Edit Item/i }));

    // Verify modal inputs are populated
    await waitFor(() => {
      expect(screen.getByDisplayValue('Whole Broiler Chicken')).toBeInTheDocument();
      expect(screen.getByDisplayValue('CHK-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });
  });

  it('opens Log Prep Batch modal and displays portion helper information', async () => {
    renderInventoryPage();

    await waitFor(() => {
      expect(screen.getByText('Whole Broiler Chicken')).toBeInTheDocument();
    });

    // Click on item name to open detail view
    fireEvent.click(screen.getByText('Whole Broiler Chicken'));

    await waitFor(() => {
      expect(screen.getAllByText('Chicken Rice Portion').length).toBeGreaterThan(0);
    });

    // Find the Log Batch button in the Preps list inside the details view
    const logBatchButtons = screen.getAllByRole('button', { name: /Log Batch/i });
    expect(logBatchButtons.length).toBeGreaterThan(0);
    fireEvent.click(logBatchButtons[0]);

    // Verify modal title and portion information badge
    await waitFor(() => {
      expect(screen.getByText(/Log Preparation Batch: Chicken Rice Portion/i)).toBeInTheDocument();
      expect(screen.getByText(/Portion Sized Item/i)).toBeInTheDocument();
      expect(screen.getAllByText(/120 g/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Confirm Batch & Update Stock/i)).toBeInTheDocument();
    });
  });
});
