import { Request } from 'express';

export type ServerRole = 'customer' | 'admin' | 'super_admin';

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: ServerRole;
  status: 'active' | 'disabled';
  phone?: string;
  department?: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface ServerAuditLog {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: ServerRole;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface AuthenticatedRequest extends Request {
  user?: ServerUser;
}
