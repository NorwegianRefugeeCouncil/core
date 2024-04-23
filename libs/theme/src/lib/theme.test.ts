import { theme } from './theme';

describe('theme', () => {
  it('should have custom properties', () => {
    expect(theme).toHaveProperty('colors.primary');
  });
});
