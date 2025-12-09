import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/layout/Sidebar';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Sidebar', () => {
  it('should render sidebar with navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/users/i)).toBeInTheDocument();
    expect(screen.getByText(/machines/i)).toBeInTheDocument();
    expect(screen.getByText(/products/i)).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(<Sidebar />);
    
    const dashboardLink = screen.getByText(/dashboard/i).closest('a');
    expect(dashboardLink).toHaveClass('bg-gray-100');
  });

  it('should render all menu items', () => {
    render(<Sidebar />);
    
    const expectedItems = [
      'Dashboard',
      'Users',
      'Machines',
      'Products',
      'Orders',
      'Categories',
      'Campaigns',
    ];
    
    expectedItems.forEach((item) => {
      expect(screen.getByText(new RegExp(item, 'i'))).toBeInTheDocument();
    });
  });
});
