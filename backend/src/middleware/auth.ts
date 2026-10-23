import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ServerUser, ServerRole } from '../types';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { addAuditLog } from '../store';

/**
 * Middleware: Verify Bearer access token using Supabase Auth and database profiles table.
 * Rejects with 401 if token is invalid or profile not found.
 * Rejects with 403 if account status is not 'active'.
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return next(); // Unauthenticated, req.user remains undefined
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token format. Expected Bearer <token>' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token is missing' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const authUser = data.user;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'Unauthorized: User profile not found' });
    }

    if (profile.status && profile.status !== 'active') {
      return res.status(403).json({ error: 'Forbidden: Account status is not active' });
    }

    const role = (profile.role || 'customer') as ServerRole;

    const user: ServerUser = {
      id: profile.id,
      name: profile.full_name || profile.name || authUser.user_metadata?.full_name || 'User',
      email: profile.email || authUser.email || '',
      passwordHash: '',
      role,
      status: profile.status || 'active',
      phone: profile.phone || '',
      department: profile.department || '',
      permissions: profile.permissions || [],
      createdAt: profile.created_at || authUser.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    req.user = user;
    return next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}

/**
 * Require valid authenticated user session.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required. Please log in.' });
  }
  return next();
}

/**
 * Require specific user role(s).
 * Supports checking 'admin', 'superadmin', 'super_admin', 'customer'.
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const currentRole = (req.user.role || '').toLowerCase();
    const isSuper = currentRole === 'super_admin' || currentRole === 'superadmin';
    const isAdmin = currentRole === 'admin';

    const isAllowed = allowedRoles.some((r) => {
      const allowed = r.toLowerCase();
      if (allowed === 'superadmin' || allowed === 'super_admin') {
        return isSuper;
      }
      if (allowed === 'admin') {
        return isAdmin || isSuper;
      }
      return allowed === currentRole;
    });

    if (!isAllowed) {
      addAuditLog(
        req.user,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        req.originalUrl,
        `Role "${req.user.role}" attempted to access restricted endpoint requiring [${allowedRoles.join(', ')}]`
      );
      return res.status(403).json({
        error: `Forbidden: Access restricted. Your role '${req.user.role}' cannot access this resource.`,
        requiredRoles: allowedRoles,
      });
    }

    return next();
  };
}
