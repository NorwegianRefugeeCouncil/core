export class AlreadyExistsError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'AlreadyExistsError';
    Object.setPrototypeOf(this, new.target.prototype); // maintain proper stack trace
  }
}
