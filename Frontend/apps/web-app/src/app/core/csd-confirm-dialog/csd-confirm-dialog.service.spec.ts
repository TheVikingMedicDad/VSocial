import { TestBed } from '@angular/core/testing';

import { CsdConfirmDialogService } from './csd-confirm-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { provideMock } from '../../testing-utils/provide-mock';

describe('CsdConfirmDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    TestBed.configureTestingModule({
      providers: [provideMock(MatDialog)],
    });
    const service: CsdConfirmDialogService = TestBed.inject(CsdConfirmDialogService);
    expect(service).toBeTruthy();
  });
});
