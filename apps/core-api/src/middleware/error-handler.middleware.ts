import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

const hasStatusCode = (err: any): err is { statusCode: number } => {
  return typeof err.statusCode === 'number';
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation Failed',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  } else {
    const errStatus = hasStatusCode(err)
      ? err.statusCode
      : (err as any).status || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
      success: false,
      status: errStatus,
      message: errMsg,
      stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
  }
};
