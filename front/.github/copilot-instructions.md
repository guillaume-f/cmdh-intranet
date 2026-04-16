
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

- `private readonly`: Dependencies (injected services), internal state, and implementation details
- `protected readonly`: Signals and properties used in templates
- `protected`: Methods called from templates (that are not lifecycle hooks)
- Public (no prefix): Angular lifecycle hooks and methods that act like them

### Forms

- **Reactive forms**: Bind controls directly in templates without helper methods:
  - Access form controls via `form.controls.fieldName` in templates
  - Check errors directly with `form.controls.fieldName.errors?.['errorType']`
  - Check touched state with `form.controls.fieldName.touched`
  - Check invalid state with `form.controls.fieldName.invalid`
  - **Form-level errors**: Access via `form.errors?.['validatorName']`

- **Form submission pattern**:
  - Never disable submit buttons when form is invalid
  - Show validation errors as users type (on `touched` state change)
  - Prevent API calls with `if (!this.form.valid) { this.form.markAllAsTouched(); return; }`
  - Use `MessageService` for success/error notifications with `life` property for auto-dismiss

- **Component structure for forms**:
  - Show field-level error messages inline using PrimeNG `<p-message>` with `severity="error"`, `variant="simple"`, `size="small"`
  - Use signals for `isSubmitted`, `isLoading` state management
  - Create custom validators in `FormValidatorsService` and inject them: `this.formValidators.email()`, `this.formValidators.passwordStrength()`, etc.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Observable Management

**CRITICAL: All observables MUST be automatically unsubscribed using `takeUntilDestroyed`**

**Rules:**
- Always inject `DestroyRef` when subscribing to observables
- ALWAYS pipe `takeUntilDestroyed(this.destroyRef)` to every observable subscription
- Place `takeUntilDestroyed` AFTER other operators like `finalize`, `map`, etc.
- Never manually manage subscriptions with `subscription.unsubscribe()`

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services & Repositories

### Repository Pattern

**Repositories are TRANSPORT LAYER ONLY - they purely handle HTTP calls and return Observables:**

**Repository Rules:**
- NO business logic, NO subscriptions, NO services dependencies
- ONLY inject `HttpClient`
- Methods ONLY return `Observable<T>` - never subscribe internally
- All DTO types live in `[feature].model.ts` alongside the repository
- One repository per feature to group related API calls

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Services can orchestrate business logic using repositories
- Expose signals from services for reactive state management in components

## PrimeNG Component Guidelines

- Import only required modules (e.g., `ButtonModule`, `CardModule`) rather than wildcard imports
- For forms: Always import `MessageModule` for error display and `ToastModule` for notifications
- For notifications: Use PrimeNG Toast via `MessageService.add()`
- Use PrimeNG components with Tailwind utilities for consistent styling
- All PrimeNG components must maintain WCAG AA compliance; verify focus management and keyboard navigation
- **Customize PrimeNG theme**: Use custom preset (see `src/app/theme.config.ts`) instead of inline theme options
- Apply PrimeNG severity levels consistently: `success`, `info`, `warning`, `error` mapped to brand semantic colors
- Error messages: Always use `<p-message severity="error" variant="simple" size="small">` for inline validation errors

### PrimeNG Theme Customization

Override PrimeNG Nora theme defaults to match brand colors:

## Styling & Tailwind Integration

- Use Tailwind utilities as the primary styling mechanism
- Define custom CSS only when Tailwind cannot express the design
- Place component-scoped styles in the component's `.css` file; use CSS variables for theming
- **Always use CSS variables** instead of hardcoded colors to maintain design consistency

### CSS Architecture

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

### Directory Structure

- **Features**: `src/app/features/` – Feature modules with lazy-loaded routes
  - Each feature has its own routes file
  - Each component has a `models/` subdirectory for component-scoped types
- **Repositories**: `src/app/repositories/` – API transport layer, one per feature
  - Each repository has its own model file
- **Assets**: `src/assets/styles/` – Global CSS files
- **Utilities**: `src/app/utilities/` – Pure utility functions
- All new components are generated with `app` prefix (set in `angular.json`)

### Theme Configuration

Use custom PrimeNG preset in `src/app/theme.config.ts` and apply it in  `src/app/app.config.ts`

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

### Translation Structure

**Global translations** (`src/assets/i18n/fr.json`):
**Feature translations** (`src/assets/i18n/feature/fr.json`):

### Usage in Templates

Always import `TranslatePipe` in component imports
Then use in templates with the pipe:

### Adding a New Feature

When creating a new lazy-loaded feature, follow these steps:

1. **Create the feature module** in `src/app/features/<feature-name>/`

2. **Create translation file** at `src/assets/i18n/feature-name/fr.json`

3. **Namespace convention**: Group all translations under feature name in UPPER_SNAKE_CASE:
   - Global features use `COMMON.*`
   - features use `FEATURE_NAME.*`

4. **Error translations**: Always place error messages in a nested `ERRORS` object for consistency

5. **Import TranslatePipe** in all new components that use translations

## Debugging & Common Issues

- Use Chrome DevTools to inspect Angular component tree and signals state
- If styles don't apply: check CSS specificity conflicts with Tailwind or PrimeNG
  - Use `:deep()` selector in component CSS if needed to override PrimeNG styled components
- For PrimeNG theme issues: verify the custom preset is correctly applied in `app.config.ts`
- For form validation issues: check custom validators in `FormValidatorsService`
- Check browser console for accessibility warnings (AXE integration)
- If notifications don't appear: verify `<p-toast position="top-right"></p-toast>` is in template and `MessageService` is in providers
- For error display issues: ensure you're checking `touched` state in addition to `invalid`
