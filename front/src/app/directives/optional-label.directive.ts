import {
  Directive,
  ElementRef,
  Renderer2,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import {
  AbstractControl,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appOptionalLabel]',
  standalone: true,
})
export class OptionalLabelDirective {
  private el = inject(ElementRef<HTMLLabelElement>);
  private renderer = inject(Renderer2);
  private translateService = inject(TranslateService);

  /**
   * Usage:
   * <label [appOptionalLabel]="form.controls.email">Email</label>
   */
  appOptionalLabel = input.required<AbstractControl<unknown>>();

  private optionalTextNode?: HTMLElement;

  readonly isOptional = computed(() => {
    const ctrl = this.appOptionalLabel();
   
    return !ctrl.hasValidator(Validators.required);
  });

  constructor() {
    effect(() => {
      const optional = this.isOptional();
      if (optional) {
        this.appendOptionalText();
      } else {
        this.removeOptionalText();
      }
    });
  }

  private appendOptionalText(): void {
    if (this.optionalTextNode) return;

    const span = this.renderer.createElement('span');
    const text = this.renderer.createText(
      `(${this.translateService.instant('COMMON.OPTIONAL')})`
    );

    this.renderer.addClass(span, 'optional-label-text');
    this.renderer.appendChild(span, text);
    this.renderer.appendChild(this.el.nativeElement, span);

    this.optionalTextNode = span;
  }

  private removeOptionalText(): void {
    if (!this.optionalTextNode) return;

    this.renderer.removeChild(
      this.el.nativeElement,
      this.optionalTextNode
    );

    this.optionalTextNode = undefined;
  }
}