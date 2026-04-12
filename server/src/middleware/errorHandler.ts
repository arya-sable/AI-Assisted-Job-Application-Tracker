import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    res.status(400).json({ message: err.message || 'Invalid request data' });
    return;
  }

  res.status(500).json({ message: err.message || 'Internal server error' });
};
