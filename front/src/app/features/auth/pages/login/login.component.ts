// src/app/features/auth/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { RouterLink, ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '../../../../core/services/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  loading = false
  errorMessage = ''
  showPassword = false
  sessionExpired = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })

    this.sessionExpired = this.route.snapshot.queryParamMap.get('expired') === 'true'
  }

  get emailInvalid(): boolean {
    const ctrl = this.loginForm.get('email')
    return !!(ctrl?.invalid && ctrl.touched)
  }

  get passwordInvalid(): boolean {
    const ctrl = this.loginForm.get('password')
    return !!(ctrl?.invalid && ctrl.touched)
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched()
      return
    }

    this.loading = true
    this.errorMessage = ''

    const { email, password } = this.loginForm.value

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/activities'])
      },
      error: (err) => {
        this.loading = false
        this.errorMessage = err.error?.message ?? 'Erreur de connexion. Veuillez réessayer.'
      }
    })
  }
}
