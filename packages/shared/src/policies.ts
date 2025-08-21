import { Role } from './types';

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

export function assertOwnership(userId: string, resourceOwnerId: string): void {
  if (userId !== resourceOwnerId) {
    throw new AccessDeniedError('You do not own this resource');
  }
}

export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole);
}

export function assertRole(userRole: Role, requiredRoles: Role[]): void {
  if (!hasRole(userRole, requiredRoles)) {
    throw new AccessDeniedError(`Required role: ${requiredRoles.join(' or ')}`);
  }
}
