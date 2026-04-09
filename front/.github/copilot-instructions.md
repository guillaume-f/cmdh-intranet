
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

### Access Modifiers

**Encapsulation rules for properties and methods:**

- **`private readonly`**: Dependencies (injected services), internal state, and implementation details
  ```typescript
  private readonly authService = inject(AuthService);      // Injected service
  private readonly internalCache: string[] = [];           // Internal state
  private updatePasswordStrength(password: string): void {} // Internal method
  ```

- **`protected readonly`**: Signals and properties used in templates
  ```typescript
  protected readonly form = this.fb.group({ /* ... */ });           // Used in template
  protected readonly isLoading = this.authService.isLoading;        // Used in template binding
  protected readonly passwordStrengthIndicator = signal({ /* ... */ }); // Used in template
  ```

- **`protected`**: Methods called from templates (that are not lifecycle hooks)
  ```typescript
  protected getPasswordStrengthClass(): string { /* ... */ } // Called in template: [ngClass]="getPasswordStrengthClass()"
  ```

- **Public (no prefix)**: Angular lifecycle hooks and methods that act like them
  ```typescript
  ngOnInit(): void { /* ... */ }  // Angular lifecycle - no prefix
  onSubmit(): void { /* ... */ } // Form submission handler - acts like lifecycle
  ```

**Summary table:**

| Modifier | Where? | Example |
|----------|--------|----------|
| `private readonly` | Internal, not in template | Services, cache, helpers |
| `protected readonly` | In template as property | Signals, form, loading state |
| `protected` | In template as method call | `getPasswordStrengthClass()` |
| public (default) | Lifecycle-like | `onSubmit()`, `ngOnInit()` |

### Forms

- **Reactive forms**: Bind controls directly in templates without helper methods:
  - Access form controls via `form.controls.fieldName` in templates
  - Check errors directly with `form.controls.fieldName.errors?.['errorType']`
  - Check touched state with `form.controls.fieldName.touched`
  - Check invalid state with `form.controls.fieldName.invalid`
  - **Form-level errors**: Access via `form.errors?.['validatorName']`
  
- **Error display pattern** (simple required error):
  ```html
  <input [formControl]="form.controls.email" />
  @if (form.controls.email.errors?.['required'] && form.controls.email.touched) {
    <p-message severity="error" variant="simple" size="small">
      Ce champ est requis
    </p-message>
  }
  ```
  
- **Field-specific error pattern** (multiple error types):
  ```html
  <input [formControl]="form.controls.email" />
  @if (form.controls.email.errors?.['required'] && form.controls.email.touched) {
    <p-message severity="error" variant="simple" size="small">Ce champ est requis</p-message>
  }
  @if (form.controls.email.errors?.['invalidEmail'] && form.controls.email.touched) {
    <p-message severity="error" variant="simple" size="small">Email invalide</p-message>
  }
  ```

- **Accessibility attributes** (WCAG AA compliance):
  ```html
  <input 
    [formControl]="form.controls.email"
    [attr.aria-invalid]="form.controls.email.invalid && form.controls.email.touched"
  />
  ```

- **Form-level validator pattern** (password mismatch):
  ```typescript
  readonly form = this.fb.group(
    {
      newPassword: ['', [Validators.required, this.formValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.formValidators.passwordMatch('newPassword', 'confirmPassword')],
    }
  );
  ```
  ```html
  @if (form.errors?.['passwordMismatch'] && form.controls.confirmPassword.touched) {
    <p-message severity="error" variant="simple" size="small">
      Les mots de passe ne correspondent pas
    </p-message>
  }
  ```

- **Dynamic indicator pattern** (password strength):
  ```typescript
  readonly passwordStrengthIndicator = signal({ score: 0, text: '' });

  constructor() {
    effect(() => {
      const newPassword = this.form.get('newPassword')?.value as string;
      this.updatePasswordStrength(newPassword);
    });
  }

  private updatePasswordStrength(password: string): void {
    // Calculate score and update signal
  }

  getPasswordStrengthClass(): string {
    const score = this.passwordStrengthIndicator().score;
    // Return class based on score
  }
  ```
  ```html
  @if (passwordStrengthIndicator().text) {
    <div [ngClass]="getPasswordStrengthClass()">
      Force: {{ passwordStrengthIndicator().text }}
    </div>
  }
  ```

- **Form submission pattern**:
  - Never disable submit buttons when form is invalid
  - Show validation errors as users type (on `touched` state change)
  - Prevent API calls with `if (!this.form.valid) { this.form.markAllAsTouched(); return; }`
  - Use `MessageService` for success/error notifications with `life` property for auto-dismiss

- **Component structure for forms**:
  ```typescript
  @Component({
    selector: 'app-my-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      ButtonModule,
      InputTextModule,
      CardModule,
      MessageModule,
      ToastModule,
    ],
    providers: [MessageService],
    templateUrl: './my-form.component.html',
    styleUrl: './my-form.component.css',
  })
  export class MyFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly messageService = inject(MessageService);
    private readonly formValidators = inject(FormValidatorsService);

    readonly form = this.fb.group({
      fieldName: ['', [Validators.required, this.formValidators.email()]],
    });

    readonly isLoading = someService.isLoading;
    readonly isSubmitted = signal(false);

    onSubmit(): void {
      this.isSubmitted.set(true);
      if (!this.form.valid) {
        this.form.markAllAsTouched();
        return;
      }
      // Handle form submission
    }
  }
  ```

- Show field-level error messages inline using PrimeNG `<p-message>` with `severity="error"`, `variant="simple"`, `size="small"`
- Use signals for `isSubmitted`, `isLoading` state management
- Create custom validators in `FormValidatorsService` and inject them: `this.formValidators.email()`, `this.formValidators.passwordStrength()`, etc.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Services should manage API calls, business logic, and shared state via signals
- Expose signals from services for reactive state management in components

### Form Validators Service

Place custom validators in `src/app/services/form-validators.service.ts`:

```typescript
@Injectable({ providedIn: 'root' })
export class FormValidatorsService {
  /**
   * Email validator - checks format against pattern
   */
  email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(control.value) ? null : { invalidEmail: true };
    };
  }

  /**
   * Password strength validator - requires uppercase, lowercase, number, special char, 8+ chars
   */
  passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const password = control.value;
      const isValid =
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      return isValid ? null : { passwordStrength: true };
    };
  }

  /**
   * Password match validator - checks if two fields match
   */
  passwordMatch(fieldName: string, confirmFieldName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const field = group.get(fieldName);
      const confirmField = group.get(confirmFieldName);
      if (!field || !confirmField) return null;
      return field.value === confirmField.value ? null : { passwordMismatch: true };
    };
  }
}
```

- Use custom validators in form groups: `this.formValidators.email()`, `this.formValidators.passwordStrength()`
- For form-level validators, pass them in the second argument to `fb.group()`

## PrimeNG Component Guidelines

- Import only required modules (e.g., `ButtonModule`, `CardModule`) rather than wildcard imports
- For forms: Always import `MessageModule` for error display and `ToastModule` for notifications
- For notifications: Use PrimeNG Toast via `MessageService.add()` instead of custom alerts
  ```typescript
  // In component providers
  providers: [MessageService]
  
  // In template
  <p-toast position="top-right"></p-toast>
  
  // In component logic
  this.messageService.add({
    severity: 'success',          // success | info | warning | error
    summary: 'Succès',
    detail: 'Message details',
    life: 1500,                  // auto-dismiss in milliseconds (optional)
  });
  ```
- Use PrimeNG components with Tailwind utilities for consistent styling
- All PrimeNG components must maintain WCAG AA compliance; verify focus management and keyboard navigation
- **Customize PrimeNG theme**: Use custom preset (see `src/app/theme.config.ts`) instead of inline theme options
- Apply PrimeNG severity levels consistently: `success`, `info`, `warning`, `error` mapped to brand semantic colors
- Error messages: Always use `<p-message severity="error" variant="simple" size="small">` for inline validation errors

## Design System & Brand Guidelines

### Color Palette

Define these CSS variables in the root stylesheet for consistent theming:

```css
:root {
  /* Primary & Accent Colors */
  --color-primary: #ceaa18;        /* Gold accent - use for primary actions, highlights */
  --color-primary-dark: #a88914;   /* Darker gold for hover states */
  --color-primary-light: #e0bb2a;  /* Lighter gold for backgrounds */
  
  /* Neutral Colors */
  --color-text-primary: #222222;   /* Dark gray - main text */
  --color-text-secondary: #666666; /* Medium gray - secondary text, borders */
  --color-background: #ffffff;
  --color-background-light: #eeeeee; /* Light gray - subtle backgrounds */
  
  /* Semantic Colors */
  --color-danger: #dc3232;         /* Red - errors, warnings */
  --color-success: #4caf50;
  --color-info: #2196f3;
  --color-warning: #ff9800;
}
```

### Typography

- **Font Family**: Open Sans (fallback: sans-serif)
- Apply Open Sans globally in root styles and all components
- Use standard font weights: 400 (regular), 600 (semibold), 700 (bold)
- Headings: h1–h6 should use 700 weight with appropriate sizing
- Body text: Use 400 weight at 14–16px

### Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` (#ceaa18) for buttons, links, active states
- **Text**: Use `--color-text-primary` (#222222) for main text; `--color-text-secondary` (#666666) for secondary/disabled text
- **Error States**: Use `--color-danger` (#dc3232) for validation errors, alerts
- **Backgrounds**: Use `--color-background-light` (#eee) for subtle section backgrounds, hover states
- **Never hardcode colors**: Always reference CSS variables via `var(--color-*)` in styles
- Verify all color combinations meet WCAG AA contrast ratios (4.5:1 for text, 3:1 for graphics)

### PrimeNG Theme Customization

Override PrimeNG Nora theme defaults to match brand colors:

```typescript
// Configure PrimeNG preset colors in app.config.ts or component styles
import { providePrimeng } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeng({
      theme: {
        preset: 'nora',
        options: {
          primary: '#ceaa18',        // Brand gold
          surface: '#ffffff',
          darkSurface: '#222222',    // Brand dark
          gray: '#666666',           // Brand gray
          danger: '#dc3232',         // Brand danger
          focusRing: '0 0 0 0.2rem rgba(206, 170, 24, 0.5)', // Gold focus ring
        }
      }
    })
  ]
};
```

## Styling & Tailwind Integration

- Use Tailwind utilities as the primary styling mechanism
- Define custom CSS only when Tailwind cannot express the design (e.g., CSS Grid layouts, complex animations)
- Place component-scoped styles in the component's `.css` file; use CSS variables for theming
- **Always use CSS variables** (`var(--color-primary)`) instead of hardcoded colors to maintain design consistency

### CSS Architecture

Structure global styles in `src/assets/styles/`:

```
src/assets/styles/
├── index.css           # Master import file
├── variables.css       # Design system CSS variables
├── base.css            # Global typography, form elements, base styles
└── components.css      # PrimeNG component customization overrides
```

**variables.css** - Define brand colors as CSS variables:
```css
:root {
  --color-primary: #ceaa18;
  --color-primary-dark: #a88914;
  --color-primary-light: #e0bb2a;
  --color-text-primary: #222222;
  --color-text-secondary: #666666;
  --color-danger: #dc3232;
  --color-success: #4caf50;
  /* ... other variables */
}
```

**base.css** - Global form and typography styles:
```css
* {
  font-family: 'Open Sans', sans-serif;
}

.form-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-label.required::after {
  content: ' *';
  color: var(--color-danger);
}
```

- Import all CSS files in `src/styles.css` or component-level files
- Component-specific styles override global styles when needed
- Use CSS Grid and Flexbox for layouts; minimize custom positioning

## Development Workflow

**Starting the dev server:**
```bash
npm start
```
Runs Angular dev server on `http://localhost:4200/` with HMR enabled.

**Running tests:**
```bash
npm test
```
Executes Vitest suite in watch mode. Test files are colocated with components (`.spec.ts`).

**Building for production:**
```bash
npm build
```
Generates optimized build artifacts in `dist/` with tree-shaking and minification.

**Incremental development builds:**
```bash
npm run watch
```
Compiles changes without serving; useful for external dev servers.

## Project Structure & Conventions

- **Components**: `src/app/components/` – Reusable UI components
- **Features**: `src/app/features/` – Feature modules with lazy-loaded routes
  - Auth feature: `src/app/features/auth/` with login, forgot-password, reset-password pages
  - Each feature has its own routes file: `auth.routes.ts`
- **Services**: `src/app/services/` – Singleton services with `providedIn: 'root'`
  - `auth.service.ts` – Handles login, logout, password reset, token management
  - `form-validators.service.ts` – Custom form validators
- **Types**: `src/app/types/` – Shared interfaces and type definitions
  - `auth.types.ts` – Auth request/response types
- **Assets**: `src/assets/styles/` – Global CSS files
  - `variables.css` – Design system CSS variables
  - `base.css` – Global typography, form elements
  - `messages.css` – Alert/message component styles
  - `components.css` – PrimeNG component overrides
  - `index.css` – Master import file
- **Utilities**: `src/app/utils/` – Pure utility functions
- All new components are generated with `app` prefix (set in `angular.json`)

### Feature Routing Example (Auth)

```typescript
// src/app/features/auth/auth.routes.ts
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
];
```

```typescript
// src/app/app.routes.ts - Main routing with lazy loading
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  // Other routes...
];
```

### Theme Configuration

Use custom PrimeNG preset in `src/app/theme.config.ts`:

```typescript
import { definePreset } from '@primeuix/themes';
import { Nora } from '@primeuix/themes/nora';

export const CMDHPreset = definePreset(Nora, {
  semantic: {
    primary: {
      50: '#fef9f0',
      // ... color palette 50-950
      950: '#4a3a0a',
    },
  },
});
```

Apply in `src/app/app.config.ts`:

```typescript
import { providePrimeng } from 'primeng/config';
import { CMDHPreset } from './theme.config';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeng({
      theme: {
        preset: CMDHPreset,
      },
    }),
    // Other providers...
  ],
};
```

## Code Generation

Use Angular CLI schematics for consistency:

```bash
# Generate a standalone component
ng generate component features/my-feature/my-component

# Generate a service
ng generate service services/my-service

# Generate a route
ng generate module features/my-feature --route my-feature --module app.routes
```

Generated code follows the established patterns above automatically.

## Testing Guidelines

- Write unit tests for services, pipes, and utility functions
- Use Vitest's `describe` and `it` blocks
- Mock PrimeNG components when testing parent components
- Test accessibility: verify keyboard navigation and screen reader compatibility
- Aim for >80% code coverage on critical paths
- Test form validation: verify all error states display correctly
- Test custom validators: ensure email(), passwordStrength(), and passwordMatch() work as expected

## Internationalization (i18n) with ngx-translate

All user-visible text must be translatable using ngx-translate. The project uses lazy-loaded feature modules with scoped translation files.

### Project Structure

```
src/assets/i18n/
├── fr.json                 # Global translations (loaded at app startup)
└── auth/                   # Feature module: Auth
    ├── fr.json            # Auth-specific translations (lazy-loaded)
    └── ... (other feature modules)
```

### Configuration

**In `app.config.ts`** - Global loader (root translations):
```typescript
providePrimeNG({
  // ...
}),
provideTranslateService({
  defaultLanguage: 'fr',
  fallbackLang: 'fr',
  useDefaultLang: true,
  lang: 'fr',
  loader: provideTranslateHttpLoader({
    prefix: '/assets/i18n/',
    suffix: '.json'
  })
})
```

**In `app.routes.ts`** - Feature-scoped loader (lazy loading):
Each lazy-loaded route adds its feature's translations with `extend: true` to merge with global translations:
```typescript
{
  path: 'auth',
  loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  providers: [
    provideTranslateService({
      extend: true,                  // Merge with global translations
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/auth/',
        suffix: '.json'
      })
    })
  ],
}
```

### Translation Structure

**Global translations** (`src/assets/i18n/fr.json`):
```json
{
  "COMMON": {
    "LANGUAGE": "Français",
    "LOADING": "Chargement...",
    "ERROR": "Erreur",
    "SUCCESS": "Succès"
  }
}
```

**Feature translations** (`src/assets/i18n/auth/fr.json`):
```json
{
  "AUTH": {
    "LOGIN": {
      "TITLE": "Connexion",
      "EMAIL_LABEL": "Email",
      "EMAIL_PLACEHOLDER": "votre@email.com"
    },
    "ERRORS": {
      "EMAIL_REQUIRED": "Ce champ est requis",
      "EMAIL_INVALID": "Email invalide"
    }
  }
}
```

### Usage in Templates

Always import `TranslatePipe` in component imports:
```typescript
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  //...
  imports: [CommonModule, TranslatePipe, /* ... other imports ... */]
})
```

Then use in templates with the pipe:
```html
<!-- Simple text -->
<h1>{{ 'AUTH.LOGIN.TITLE' | translate }}</h1>

<!-- Input placeholders -->
<input [placeholder]="'AUTH.LOGIN.EMAIL_PLACEHOLDER' | translate" />

<!-- Error messages -->
@if (form.controls.email.errors?.['required'] && form.controls.email.touched) {
  <p-message severity="error" variant="simple" size="small">
    {{ 'AUTH.ERRORS.EMAIL_REQUIRED' | translate }}
  </p-message>
}

<!-- Button labels -->
<button [label]="'AUTH.LOGIN.SUBMIT' | translate"></button>
```

### Adding a New Feature

When creating a new lazy-loaded feature, follow these steps:

1. **Create the feature module** in `src/app/features/<feature-name>/`

2. **Update routing** in `src/app/app.routes.ts`:
   ```typescript
   {
     path: 'feature-name',
     loadChildren: () => import('./features/feature-name/feature-name.routes').then((m) => m.featureRoutes),
     providers: [
       provideTranslateService({
         extend: true,
         loader: provideTranslateHttpLoader({
           prefix: '/assets/i18n/feature-name/',
           suffix: '.json'
         })
       })
     ]
   }
   ```

3. **Create translation file** at `src/assets/i18n/feature-name/fr.json`:
   ```json
   {
     "FEATURE_NAME": {
       "PAGE_TITLE": "Your Page",
       "FIELD_LABEL": "Label",
       "BUTTON_TEXT": "Click me",
       "ERRORS": {
         "GENERIC": "An error occurred"
       }
     }
   }
   ```

4. **Namespace convention**: Group all translations under feature name in UPPER_SNAKE_CASE:
   - Global features use `COMMON.*`
   - Auth features use `AUTH.*`
   - New features use `FEATURE_NAME.*`

5. **Error translations**: Always place error messages in a nested `ERRORS` object for consistency:
   ```json
   {
     "FEATURE_NAME": {
       "ERRORS": {
         "REQUIRED": "This field is required",
         "INVALID": "This value is invalid"
       }
     }
   }
   ```

6. **Import TranslatePipe** in all new components that use translations:
   ```typescript
   import { TranslatePipe } from '@ngx-translate/core';
   ```

## Debugging & Common Issues

- Use Chrome DevTools to inspect Angular component tree and signals state
- If styles don't apply: check CSS specificity conflicts with Tailwind or PrimeNG
  - Use `:deep()` selector in component CSS if needed to override PrimeNG styled components
- For PrimeNG theme issues: verify the custom preset is correctly applied in `app.config.ts`
- For form validation issues: check custom validators in `FormValidatorsService`
- Check browser console for accessibility warnings (AXE integration)
- If notifications don't appear: verify `<p-toast position="top-right"></p-toast>` is in template and `MessageService` is in providers
- For error display issues: ensure you're checking `touched` state in addition to `invalid`
