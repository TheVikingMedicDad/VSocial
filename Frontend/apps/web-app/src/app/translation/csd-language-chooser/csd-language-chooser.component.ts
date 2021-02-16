import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';
import { UnsubscribeBaseComponent } from '../../shared/unsubscribe-base.component';
import { LANGUAGES } from '../../core/constants/general.constants';

@Component({
  selector: 'csd-language-chooser',
  templateUrl: './csd-language-chooser.component.html',
  styleUrls: ['./csd-language-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdLanguageChooserComponent extends UnsubscribeBaseComponent implements OnInit {
  language = 'EN';
  languages = LANGUAGES.map((lang) => lang.toUpperCase());

  constructor(@Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService) {
    super();
  }

  ngOnInit() {
    this.addSubscription(
      this.i18NextService.events.initialized.subscribe((event) => {
        if (event) {
          this.updateState(this.i18NextService.language);
        }
      })
    );
  }

  setLanguage(language: string) {
    this.i18NextService.changeLanguage(language.toLowerCase()).then(() => {
      this.updateState(language);
      document.location.reload();
    });
  }

  private updateState(lang: string) {
    this.language = lang.toUpperCase();
  }
}
