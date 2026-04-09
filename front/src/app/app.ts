import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App  {
  private readonly translateService = inject(TranslateService);
  
  constructor() {
    this.translateService.use('fr');
  }
}
