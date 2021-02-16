import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CsdCurrentUserService } from '../csd-current-user.service';
import { CsdDuplicateEmailError, CsdInvalidTokenError } from '../auth.errors';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { PATH_USER_ACCOUNT } from '../../core/constants/router.constants';
import { ConfirmEmailInput } from '../auth.types';

@Component({
  selector: 'csd-confirm-email',
  templateUrl: './csd-confirm-email.component.html',
  styleUrls: ['./csd-confirm-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdConfirmEmailComponent extends UnsubscribeBaseComponent implements OnInit {
  @Input() confirmationToken: string;
  inProgress = true;
  confirmed = false;
  invalidToken = false;
  duplicateEmail = false;
  otherError = false;
  accountUrl = PATH_USER_ACCOUNT;

  constructor(
    private route: ActivatedRoute,
    private csdCurrentUserService: CsdCurrentUserService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    const confirmEmailInput: ConfirmEmailInput = {
      key: this.confirmationToken,
    };
    this.addSubscription(
      this.csdCurrentUserService.confirmEmail$(confirmEmailInput).subscribe(
        () => {
          console.log('CsdConfirmEmailComponent.ngOnInit: confirmation succeeded');
          this.inProgress = false;
          this.confirmed = true;
          this.changeDetectorRef.markForCheck();
        },
        (error) => {
          this.inProgress = false;
          console.log('CsdConfirmEmailComponent.ngOnInit: confirmation FAILED: ', error);
          if (error instanceof CsdInvalidTokenError) {
            this.invalidToken = true;
          } else if (error instanceof CsdDuplicateEmailError) {
            this.duplicateEmail = true;
          } else {
            this.otherError = true;
          }
          this.changeDetectorRef.markForCheck();
        }
      )
    );
  }
}
