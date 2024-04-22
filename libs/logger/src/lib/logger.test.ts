import { getLogger } from './logger';

describe('logger', () => {
  it('should be defined', () => {
    const logger = getLogger();
    expect(logger).toBeDefined();
  });
});
