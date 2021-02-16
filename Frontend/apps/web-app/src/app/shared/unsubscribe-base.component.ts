import { OnDestroy, Directive } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive()
export abstract class UnsubscribeBaseComponent implements OnDestroy {
  private subscriptions: Array<Subscription> = [];

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  protected addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }
}
