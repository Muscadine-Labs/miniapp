import { formatCurrency } from '../app/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats small fractions correctly', () => {
    expect(formatCurrency(0.000001)).toBe('$0.00'); // rounds to 2 decimals
    expect(formatCurrency(0.005)).toBe('$0.01'); // rounds up
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-100.5)).toBe('-$100.50');
  });

  it('formats decimal values correctly', () => {
    expect(formatCurrency(123.456)).toBe('$123.46'); // rounds to 2 decimals
    expect(formatCurrency(76100)).toBe('$76,100.00');
  });
});

