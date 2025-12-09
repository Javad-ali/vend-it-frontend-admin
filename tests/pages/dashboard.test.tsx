import { render, screen, waitFor } from '../setup/test-utils';
import Dashboard from '@/pages/dashboard';
import { useGetDashboardQuery, useGetChartDataQuery } from '@/store/api/adminApi';
import { mockDashboardMetrics } from '../setup/mocks';

jest.mock('@/store/api/adminApi', () => ({
  useGetDashboardQuery: jest.fn(),
  useGetChartDataQuery: jest.fn(),
}));

jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div>Chart Component</div>;
  return DynamicComponent;
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading skeleton initially', () => {
    (useGetDashboardQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    (useGetChartDataQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<Dashboard />);

    // Should show skeleton loaders
    expect(screen.getAllByTestId('card-skeleton').length).toBeGreaterThan(0);
  });

  it('should render dashboard metrics when data is loaded', async () => {
    (useGetDashboardQuery as jest.Mock).mockReturnValue({
      data: {
        data: mockDashboardMetrics,
      },
      isLoading: false,
      error: null,
    });

    (useGetChartDataQuery as jest.Mock).mockReturnValue({
      data: {
        data: {
          revenue: [],
          orders: [],
          userGrowth: [],
          machineStatus: [],
        },
      },
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,500')).toBeInTheDocument(); // Total users
      expect(screen.getByText('5,000')).toBeInTheDocument(); // Total orders
      expect(screen.getByText('KWD 25,000.00')).toBeInTheDocument(); // Revenue
      expect(screen.getByText('20')).toBeInTheDocument(); // Active machines
    });
  });

  it('should render error message when API fails', () => {
    (useGetDashboardQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'API Error' },
    });

    (useGetChartDataQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);

    expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument();
  });

  it('should render charts when chart data is loaded', async () => {
    (useGetDashboardQuery as jest.Mock).mockReturnValue({
      data: {
        data: mockDashboardMetrics,
      },
      isLoading: false,
      error: null,
    });

    (useGetChartDataQuery as jest.Mock).mockReturnValue({
      data: {
        data: {
          revenue: [{ month: 'Jan', revenue: 1000 }],
          orders: [{ date: '2024-01-01', orders: 50 }],
          userGrowth: [{ month: 'Jan', users: 100 }],
          machineStatus: [{ status: 'active', count: 10 }],
        },
      },
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      // Dynamic components should render
      const charts = screen.getAllByText('Chart Component');
      expect(charts.length).toBe(4);
    });
  });
});
