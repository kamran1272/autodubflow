import type { NextFunction, Request, Response } from 'express';
import { auth } from './config';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean | null;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export const attachCurrentUser = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Headers,
    });

    if (session?.user) {
      req.user = session.user as AuthenticatedUser;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Headers,
    });

    if (!session?.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    req.user = session.user as AuthenticatedUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    if (error instanceof Error) {
      console.error('auth-error', error.message);
    }
  }
};

export const requireUser = requireAuth;
