import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CsdSnackbarService } from '../../features/csd-snackbar/csd-snackbar.service';

@Component({
  selector: 'csd-snackbar-overview',
  templateUrl: './csd-snackbar-overview.component.html',
  styleUrls: ['./csd-snackbar-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdSnackbarOverviewComponent implements OnInit {
  constructor(private csdSnackbarService: CsdSnackbarService) {}

  ngOnInit() {}

  showSnackbar(type: string) {
    switch (type) {
      case 'success':
        this.csdSnackbarService.success('Success message');
        return;
      case 'error':
        this.csdSnackbarService.error('Error message');
        return;
      case 'info':
        this.csdSnackbarService.info('Info message');
        return;
      case 'warning':
        this.csdSnackbarService.warning('Warning message');
        return;
    }
  }
}
