import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';

@Component({
  selector: 'app-activity-list',
  imports: [DatePipe, RouterLink, NgTemplateOutlet, ButtonDirective, Tabs, TabList, Tab, TabPanels, TabPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-list.component.html',
})
export class ActivityListComponent {
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly authService = inject(AuthService);

  private readonly activities = toSignal(this.activitiesRepository.getAllActivities(), { initialValue: null });

  protected readonly canCreateActivity = signal(this.authService.can('activity:create'));

  protected readonly futureActivities = computed(() => {
    const now = new Date();
    return (this.activities() ?? [])
      .filter((a) => new Date(a.datetime) >= now)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  });

  protected readonly pastActivities = computed(() => {
    const now = new Date();
    return (this.activities() ?? [])
      .filter((a) => new Date(a.datetime) < now)
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  });

  protected readonly isLoading = computed(() => this.activities() === null);
}