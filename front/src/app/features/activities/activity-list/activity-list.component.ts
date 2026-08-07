import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { ButtonDirective } from 'primeng/button';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';

@Component({
  selector: 'app-activity-list',
  imports: [
    DatePipe,
    RouterLink,
    NgTemplateOutlet,
    ButtonDirective,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-list.component.html',
})
export class ActivityListComponent {
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly authService = inject(AuthService);

  protected canRegister = signal(this.authService.can('registration:create'));

  private readonly activities = toSignal(this.activitiesRepository.getAllActivities(), {
    initialValue: null,
  });

  protected readonly canCreateActivity = signal(this.authService.can('activity:create'));

  protected readonly futureActivities = computed(() => {
    const now = dayjs();
    return (this.activities() ?? [])
      .filter((a) => dayjs(a.datetime).isAfter(now, 'day') || dayjs(a.datetime).isSame(now, 'day'))
      .sort((a, b) => dayjs(a.datetime).valueOf() - dayjs(b.datetime).valueOf());
  });

  protected readonly pastActivities = computed(() => {
    const now = dayjs();
    return (this.activities() ?? [])
      .filter((a) => dayjs(a.datetime).isBefore(now, 'day'))
      .sort((a, b) => dayjs(b.datetime).valueOf() - dayjs(a.datetime).valueOf());
  });

  protected readonly isLoading = computed(() => this.activities() === null);
}
