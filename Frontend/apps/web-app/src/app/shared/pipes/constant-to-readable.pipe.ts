import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'constantToReadable',
})
export class ConstantToReadablePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let result = value.split('_').join(' ');
    result = result.toLowerCase();
    return result;
  }
}
