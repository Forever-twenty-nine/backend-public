export class AppError extends Error {
  status: number;
  key?: string;
  errors?: any[];

  constructor(message: string, status = 500, key?: string, errors?: any[]) {
    super(message);
    this.status = status;
    this.key = key;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
