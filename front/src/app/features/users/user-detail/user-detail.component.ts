import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { MenuItem } from "primeng/api";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { TagModule } from "primeng/tag";
import { BehaviorSubject, map, switchMap, tap } from "rxjs";
import { UsersRepository } from "../../../repositories/users/users.repository";
import { UserValidatedActivitiesComponent } from "./user-validated-activities/user-validated-activities.component";

@Component({
  selector: 'app-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbModule, RouterLink, TagModule, UserValidatedActivitiesComponent],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent {
    private readonly translateService = inject(TranslateService);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly userRepository = inject(UsersRepository);

      private readonly refreshDataSource = new BehaviorSubject<void>(void 0);
      private readonly refreshData$ = this.refreshDataSource.asObservable();
    
    protected readonly breadcrumbItems = computed<MenuItem[]>(() => [
    { label: this.translateService.instant('USERS.BREADCRUMB.LIST'), routerLink: '/users' },
    { label: this.user()?.firstName  },
  ]);

    protected readonly userId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map((params) => params.get('userId')),
      map((value) => value ?? ''),
      tap(() => this.refreshDataSource.next())
    ),
    { initialValue: '' }
  );

    protected readonly user = toSignal(
      this.refreshData$.pipe(
        switchMap(() => this.userRepository.getUserById(this.userId()))
      ),
      { initialValue: null }
    );
}