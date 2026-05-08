import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { OptionalLabelDirective } from '../../../directives/optional-label.directive';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';
import { ActivityForm } from './models/activity-form.model';

@Component({
  selector: 'app-activity-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    MessageModule,
    ButtonModule,
    TranslatePipe,
    OptionalLabelDirective,
  ],
  templateUrl: './activity-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activitiesRepository = inject(ActivitiesRepository);

  protected readonly form: FormGroup<ActivityForm> = this.fb.group({
    titre: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    date: [null as Date | null, [Validators.required]],
    heure: ['', [Validators.required]],
    adresse: [''],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.activitiesRepository.addActivity(this.form.value).subscribe(() => {
      
    });
  }
}
