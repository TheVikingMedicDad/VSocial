import { Inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { Observable, EMPTY } from 'rxjs';
import { CsdSnackbarComponent } from './csd-snackbar.component';
import { Level } from './csd-snackbar.constants';
import { catchError } from 'rxjs/operators';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { ensureTranslationObjectType, TranslationObject } from '../../translation/translation.type';

const DEFAULT_ERROR_TRANSLATION_KEY = 'ERROR.DEFAULT';

@Injectable()
export class CsdSnackbarService {
  constructor(
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService,
    private mdSnackbar: MatSnackBar
  ) {}

  success(translation: string | TranslationObject, cssClass?: string): MatSnackBarRef<any> {
    return this.show(Level.SUCCESS, translation, cssClass);
  }

  info(translation: string | TranslationObject, cssClass?: string): MatSnackBarRef<any> {
    return this.show(Level.INFO, translation, cssClass);
  }

  warning(translation: string | TranslationObject, cssClass?: string): MatSnackBarRef<any> {
    return this.show(Level.WARNING, translation, cssClass);
  }

  error(
    translation: string | TranslationObject = DEFAULT_ERROR_TRANSLATION_KEY,
    cssClass?: string
  ): MatSnackBarRef<any> {
    return this.show(Level.ERROR, translation, cssClass);
  }

  onError(observable: Observable<any>, translationKey: string = DEFAULT_ERROR_TRANSLATION_KEY) {
    observable.subscribe(
      () => {
        return;
      },
      (error) => {
        console.log(error);
        this.show(Level.ERROR, translationKey);
      }
    );
  }

  catchError<T>(
    translationKey: string = DEFAULT_ERROR_TRANSLATION_KEY
  ): (i: Observable<T>) => Observable<T> {
    return (obs) =>
      obs.pipe(
        catchError((error) => {
          this.error(translationKey);
          return EMPTY as Observable<T>;
        })
      );
  }

  private show(
    level: Level,
    translation: string | TranslationObject,
    cssClass?: string
  ): MatSnackBarRef<any> {
    const translationObject = ensureTranslationObjectType(translation);
    const snackbarMessage: string = this.i18NextService.t(
      translationObject.key,
      translationObject.payload
    );
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    const extraClasses = ['csd-snackbar'];
    if (cssClass) {
      extraClasses.push(cssClass);
    }
    switch (level) {
      case Level.SUCCESS:
        extraClasses.push('csd-snackbar-success');
        break;
      case Level.INFO:
        extraClasses.push('csd-snackbar-info');
        break;
      case Level.WARNING:
        extraClasses.push('csd-snackbar-warning');
        break;
      case Level.ERROR:
        extraClasses.push('csd-snackbar-error');
        break;
    }
    config.panelClass = extraClasses;
    const snackBarRef: MatSnackBarRef<CsdSnackbarComponent> = this.mdSnackbar.openFromComponent(
      CsdSnackbarComponent,
      config
    );
    snackBarRef.instance.message = snackbarMessage;
    snackBarRef.instance.level = level;
    snackBarRef.instance.mdSnackBarRef = snackBarRef;
    return snackBarRef;
  }
}
