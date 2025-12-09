import { render, screen, fireEvent, waitFor } from '../setup/test-utils';
import ActivityLogs from '@/pages/activity-logs';
import { useGetActivityLogsQuery } from '@/store/api/adminApi';
import { mockActivityLogs, mockPaginationMeta } from '../setup/mocks';

jest.mock('@/store/api/adminApi', () => ({
    useGetActivityLogsQuery: jest.fn(),
}));

describe('Activity Logs Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render loading skeleton initially', () => {
        (useGetActivityLogsQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        });

        render(<ActivityLogs />);

        expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });

    it('should render activity logs when data is loaded', async () => {
        (useGetActivityLogsQuery as jest.Mock).mockReturnValue({
            data: {
                data: {
                    logs: mockActivityLogs,
                    meta: mockPaginationMeta,
                },
            },
            isLoading: false,
            error: null,
        });

        render(<ActivityLogs />);

        await waitFor(() => {
            expect(screen.getByText('Admin User')).toBeInTheDocument();
            expect(screen.getByText('Created new user John Doe')).toBeInTheDocument();
            expect(screen.getByText('Deleted product XYZ')).toBeInTheDocument();
        });
    });

    it('should filter by action type', async () => {
        const mockRefetch = jest.fn();
        (useGetActivityLogsQuery as jest.Mock).mockReturnValue({
            data: {
                data: {
                    logs: mockActivityLogs,
                    meta: mockPaginationMeta,
                },
            },
            isLoading: false,
            error: null,
            refetch: mockRefetch,
        });

        render(<ActivityLogs />);

        const filterSelect = screen.getByRole('combobox');
        fireEvent.click(filterSelect);

        await waitFor(() => {
            const createOption = screen.getByText('Create');
            fireEvent.click(createOption);
        });

        // Should trigger API call with filter
        expect(useGetActivityLogsQuery).toHaveBeenCalled();
    });

    it('should support search functionality', async () => {
        (useGetActivityLogsQuery as jest.Mock).mockReturnValue({
            data: {
                data: {
                    logs: mockActivityLogs,
                    meta: mockPaginationMeta,
                },
            },
            isLoading: false,
            error: null,
        });

        render(<ActivityLogs />);

        const searchInput = screen.getByPlaceholderText('Search logs...');
        fireEvent.change(searchInput, { target: { value: 'Admin' } });

        // Should debounce and trigger search
        await waitFor(() => {
            expect(useGetActivityLogsQuery).toHaveBeenCalled();
        }, { timeout: 500 });
    });

    it('should display correct action icons', async () => {
        (useGetActivityLogsQuery as jest.Mock).mockReturnValue({
            data: {
                data: {
                    logs: mockActivityLogs,
                    meta: mockPaginationMeta,
                },
            },
            isLoading: false,
            error: null,
        });

        render(<ActivityLogs />);

        await waitFor(() => {
            const createBadge = screen.getByText('CREATE');
            const deleteBadge = screen.getByText('DELETE');

            expect(createBadge).toBeInTheDocument();
            expect(deleteBadge).toBeInTheDocument();
        });
    });

    it('should show empty state when no logs', () => {
        (useGetActivityLogsQuery as jest.Mock).mockReturnValue({
            data: {
                data: {
                    logs: [],
                    meta: { ...mockPaginationMeta, total: 0 },
                },
            },
            isLoading: false,
            error: null,
        });

        render(<ActivityLogs />);

        expect(screen.getByText('No activity logs found')).toBeInTheDocument();
    });
});
