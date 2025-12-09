import { formatCurrency, formatDate, debounce, getStatusVariant } from '@/lib/utils';

describe('Utils', () => {
    describe('formatCurrency', () => {
        it('should format currency correctly', () => {
            expect(formatCurrency(1000)).toBe('KWD 1,000.00');
            expect(formatCurrency(1234.56)).toBe('KWD 1,234.56');
            expect(formatCurrency(0)).toBe('KWD 0.00');
        });

        it('should handle negative values', () => {
            expect(formatCurrency(-500)).toBe('KWD -500.00');
        });
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = '2024-01-15T10:30:00Z';
            const result = formatDate(date);
            expect(result).toContain('Jan');
            expect(result).toContain('15');
            expect(result).toContain('2024');
        });

        it('should handle invalid dates', () => {
            expect(formatDate('invalid')).toBe('Invalid Date');
        });
    });

    describe('debounce', () => {
        jest.useFakeTimers();

        it('should debounce function calls', () => {
            const mockFn = jest.fn();
            const debouncedFn = debounce(mockFn, 300);

            debouncedFn('test1');
            debouncedFn('test2');
            debouncedFn('test3');

            expect(mockFn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(300);

            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(mockFn).toHaveBeenCalledWith('test3');
        });

        jest.useRealTimers();
    });

    describe('getStatusVariant', () => {
        it('should return correct variants', () => {
            expect(getStatusVariant('completed')).toBe('default');
            expect(getStatusVariant('pending')).toBe('secondary');
            expect(getStatusVariant('cancelled')).toBe('destructive');
            expect(getStatusVariant('refunded')).toBe('outline');
            expect(getStatusVariant('unknown')).toBe('secondary');
        });
    });
});
