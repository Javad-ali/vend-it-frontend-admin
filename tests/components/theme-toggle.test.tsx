import { ThemeToggle } from '@/components/ui/theme-toggle';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
  })),
}));

describe('ThemeToggle', () => {
  it('should render theme toggle button', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show dropdown on click', async () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should show theme options
    expect(screen.getByText(/light/i)).toBeInTheDocument();
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });
});
