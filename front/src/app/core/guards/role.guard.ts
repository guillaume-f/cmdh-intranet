import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router'
import { UserRole } from '../../models/user.model'
import { AuthService } from '../services/auth.service'
/**
 * Guard basé sur le rôle minimum requis.
 * Usage dans les routes :
 *   canActivate: [roleGuard],
 *   data: { minRole: 'encoder' }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService)
  const router = inject(Router)

  const minRole = route.data['minRole'] as UserRole | undefined

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'])
    return false
  }

  if (minRole && !auth.hasMinRole(minRole)) {
    router.navigate(['/403'])
    return false
  }

  return true
}