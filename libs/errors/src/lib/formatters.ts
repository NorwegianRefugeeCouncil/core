import { ZodError } from 'zod';

export const formatZodError = (err: ZodError) => ({
  message: 'Validation Failed',
  errors: err.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  })),
});

const hasStatusCode = (err: any): err is { statusCode: number } => {
  return typeof err.statusCode === 'number';
};

export const formatHttpError = (err: any, showStack = false) => {
  const errStatus = hasStatusCode(err)
    ? err.statusCode
    : (err as any).status || 500;
  const errMsg = err.message || 'Something went wrong';
  return {
    success: false,
    status: errStatus,
    message: errMsg,
    stack: showStack ? err.stack : {},
  };
};
