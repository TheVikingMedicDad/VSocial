import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { CsdSnackbarComponent } from './csd-snackbar.component';
import { CsdSnackbarService } from './csd-snackbar.service';

@NgModule({
  imports: [CommonModule, MatIconModule, MatSnackBarModule, RouterModule, FlexLayoutModule],
  declarations: [CsdSnackbarComponent],
  exports: [],
  entryComponents: [CsdSnackbarComponent],
})
export class CsdSnackbarModule {
  static forRoot(): ModuleWithProviders<CsdSnackbarModule> {
    return {
      ngModule: CsdSnackbarModule,
      providers: [CsdSnackbarService],
    };
  }
}
