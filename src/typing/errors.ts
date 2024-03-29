export class TypeCheckingError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, TypeCheckingError.prototype);
  }
}
