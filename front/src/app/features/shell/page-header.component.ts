import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/auth/auth.service';

const ROLE_LABELS: Record<string, string> = {
  candidate: 'Candidat',
  member: 'Membre',
  encoder: 'Encodeur',
  admin: 'Administrateur',
};

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MenuModule, AvatarModule],
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  private readonly authService = inject(AuthService);

  protected readonly userName = () => {
    const user = this.authService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  };

  protected readonly userInitials = () => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  protected readonly roleLabel = () => {
    const role = this.authService.userRole();
    return role ? (ROLE_LABELS[role] ?? role) : '';
  };

  protected readonly userMenuItems: MenuItem[] = [
    {
      label: 'Mon profil',
      icon: 'pi pi-user',
      routerLink: ['/profile'],
    },
    {
      label: 'Se déconnecter',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout(),
    },
  ];
}
