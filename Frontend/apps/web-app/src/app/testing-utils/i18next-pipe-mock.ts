import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'i18next' })
export class I18nextPipeMock implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
