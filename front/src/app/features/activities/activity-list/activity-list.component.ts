import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';

@Component({
  selector: 'app-activity-list',
  imports: [DatePipe, RouterLink, NgTemplateOutlet, Tabs, TabList, Tab, TabPanels, TabPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.css',
})
export class ActivityListComponent {
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly authService = inject(AuthService);

  private readonly activities = toSignal(this.activitiesRepository.getAllActivities(), { initialValue: null });

  protected readonly canCreateActivity = signal(this.authService.can('activity:create'));

  protected readonly futureActivities = computed(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (this.activities() ?? [])
      .filter(a => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  protected readonly pastActivities = computed(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (this.activities() ?? [])
      .filter(a => new Date(a.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  protected readonly isLoading = computed(() => this.activities() === null);
}