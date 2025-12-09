import { render, screen, fireEvent } from '../../setup/test-utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

describe('ConfirmDialog Component', () => {
    const mockOnConfirm = jest.fn();
    const mockOnOpenChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when open', () => {
        render(
            <ConfirmDialog
                open={true}
                onOpenChange={mockOnOpenChange}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByText('Delete Item')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        render(
            <ConfirmDialog
                open={false}
                onOpenChange={mockOnOpenChange}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
    });

    it('should call onConfirm when confirm button is clicked', async () => {
        mockOnConfirm.mockResolvedValue(undefined);

        render(
            <ConfirmDialog
                open={true}
                onOpenChange={mockOnOpenChange}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={mockOnConfirm}
            />
        );

        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('should call onOpenChange when cancel button is clicked', () => {
        render(
            <ConfirmDialog
                open={true}
                onOpenChange={mockOnOpenChange}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={mockOnConfirm}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should show destructive styling when variant is destructive', () => {
        render(
            <ConfirmDialog
                open={true}
                onOpenChange={mockOnOpenChange}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={mockOnConfirm}
                variant="destructive"
            />
        );

        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('should disable buttons while loading', async () => {
        const slowConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

        render(
            <ConfirmDialog
                open={true}
                onOpenChange={mockOnOpenChange}
                title="Delete Item"
                description="Are you sure?"
                onConfirm={slowConfirm}
            />
        );

        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        // Button should be disabled during async operation
        expect(confirmButton).toBeDisabled();
    });
});
