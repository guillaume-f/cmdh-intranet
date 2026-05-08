import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from './auth.service'
import { Permission } from './permissions.type'

type RoutePermissionsData = {
  permissions?: Permission[]
}

export const permissionsGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const routeData = route.data as RoutePermissionsData | undefined
  const permissionsValue = routeData?.permissions
  const requiredPermissions = permissionsValue && permissionsValue.length > 0 ? permissionsValue : []

  if (requiredPermissions.length === 0) {
    return true
  }

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'])
  }

  if (authService.canAll(requiredPermissions)) {
    return true
  }

  return router.createUrlTree(['/'])
}