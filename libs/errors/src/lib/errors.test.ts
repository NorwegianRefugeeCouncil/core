import { AlreadyExistsError } from './errors';

describe('Errors', () => {
  it('should create an instance', () => {
    expect(new AlreadyExistsError()).toBeTruthy();
  });
});
