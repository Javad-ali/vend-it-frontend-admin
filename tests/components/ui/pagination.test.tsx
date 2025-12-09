import { render, screen, fireEvent } from '../../setup/test-utils';
import '@testing-library/jest-dom';
import { Pagination } from '@/components/ui/pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();
  const mockOnItemsPerPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pagination controls', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should call onPageChange when next button is clicked', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when previous button is clicked', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should allow clicking specific page numbers', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const pageButton = screen.getByRole('button', { name: '3' });
    fireEvent.click(pageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should highlight current page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
        itemsPerPage={10}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const currentPageButton = screen.getByRole('button', { name: '3' });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });
});
