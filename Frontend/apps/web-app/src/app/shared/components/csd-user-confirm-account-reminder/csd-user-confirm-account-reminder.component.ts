import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CsdCurrentUserService } from '../../../auth/csd-current-user.service';
import { UnsubscribeBaseComponent } from '../../unsubscribe-base.component';
import { ActivatedRoute } from '@angular/router';
import { CsdSnackbarService } from '../../../features/csd-snackbar/csd-snackbar.service';
import { CsdNotAuthenticatedError } from '../../../auth/auth.errors';
import { BaseGqlInput } from '../../../core/core.types';

@Component({
  selector: 'csd-user-confirm-account-reminder',
  templateUrl: './csd-user-confirm-account-reminder.component.html',
  styleUrls: ['./csd-user-confirm-account-reminder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdUserConfirmAccountReminderComponent
  extends UnsubscribeBaseComponent
  implements OnInit {
  constructor(
    private csdCurrentUserService: CsdCurrentUserService,
    private csdSnackbarService: CsdSnackbarService
  ) {
    super();
  }

  ngOnInit() {}

  resendAccountConfirmationEmail(): void {
    const baseInput: BaseGqlInput = {};
    this.csdCurrentUserService.resendAccountConfirmationEmail$(baseInput).subscribe(
      (response) => {
        console.log('Response Object:', response);
        this.csdSnackbarService.success('USER_CONFIRM_ACCOUNT_REMINDER.RESEND.SUCCESS');
      },
      (error) => {
        if (error instanceof CsdNotAuthenticatedError) {
          this.csdCurrentUserService.setAuthenticationToken(null);
          document.location.reload();
        } else {
          this.csdSnackbarService.error();
        }
      }
    );
  }
}
