export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type OwnershipResult =
  | { allowed: true; reason: 'authorized' }
  | { allowed: false; reason: 'unauthorized' | 'forbidden' };
