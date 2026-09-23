import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './middleware';

export const enforceOwnership = ({
  ownerId,
  userId,
}: {
  ownerId: string | null | undefined;
  userId: string | null | undefined;
}) => {
  if (!userId) {
    return { allowed: false, reason: 'unauthorized' as const };
  }

  if (!ownerId || ownerId !== userId) {
    return { allowed: false, reason: 'forbidden' as const };
  }

  return { allowed: true, reason: 'authorized' as const };
};

export const requireOwnership = (
  ownerId: string | null | undefined,
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const result = enforceOwnership({
      ownerId,
      userId: req.user?.id,
    });

    if (!result.allowed) {
      res.status(result.reason === 'unauthorized' ? 401 : 403).json({
        error: result.reason === 'unauthorized' ? 'Authentication required.' : 'Forbidden: resource does not belong to this user.',
      });
      return;
    }

    next();
  };
};
