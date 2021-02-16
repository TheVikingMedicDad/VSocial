import { Component } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { Level } from './csd-snackbar.constants';

@Component({
  selector: 'csd-snackbar',
  templateUrl: 'csd-snackbar.component.html',
})
export class CsdSnackbarComponent {
  message = '';
  mdSnackBarRef: MatSnackBarRef<CsdSnackbarComponent>;
  iconName: string;
  private _level: Level;

  constructor() {
    this.level = Level.ERROR;
  }

  close() {
    if (this.mdSnackBarRef) {
      this.mdSnackBarRef.dismiss();
    }
  }

  set level(level: Level) {
    this._level = level;
    switch (level) {
      case Level.ERROR:
        this.iconName = '&#xE001;'; // error_outline
        break;
      case Level.WARNING:
        this.iconName = '&#xE88F;'; // info_outline
        break;
      case Level.SUCCESS:
        this.iconName = '&#xE876;'; // done
        break;
      case Level.INFO:
      default:
        this.iconName = '&#xE88F;'; // info_outline
        break;
    }
  }

  get level(): Level {
    return this._level;
  }
}
