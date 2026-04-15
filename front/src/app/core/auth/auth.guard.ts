import { DestroyRef, inject } from "@angular/core"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { CanActivateFn, Router } from "@angular/router"
import { map, tap } from "rxjs"
import { AuthRepository } from "../../repositories/auth/auth.repository"
import { AuthService } from "./auth.service"

export const authGuard: CanActivateFn = () => {
  const authRepository   = inject(AuthRepository)
  const authService   = inject(AuthService)
  const router = inject(Router)
  const destroyRef = inject(DestroyRef)

  return authRepository.me().pipe(
    tap((user) => authService.setUser(user)),
    map(() => {
      if (authService.isAuthenticated()) return true
      
      router.navigate(['/auth/login'])
      return false
    }),
    takeUntilDestroyed(destroyRef),
  )
}