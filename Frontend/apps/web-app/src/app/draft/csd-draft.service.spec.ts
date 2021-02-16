import { inject, TestBed } from '@angular/core/testing';
import { InMemoryCache } from '@apollo/client/core';
import { CsdDraftService } from './csd-draft.service';
import { User } from '../core/state/user/csd-user.types';
import { Organisation } from '../core/state/organisation/csd-organisation.types';
import { filter, map, switchMap } from 'rxjs/operators';
import { APOLLO_TESTING_CACHE, ApolloTestingModule } from 'apollo-angular/testing';

describe('DraftService', () => {
  let service: CsdDraftService;
  const userId = 'UserType:1';
  let user: User;
  beforeEach(() => {
    const cache = new InMemoryCache();
    user = Object.assign(new User(), {
      id: userId,
      email: 'test.test@test.io',
      firstName: 'Test',
      lastName: 'Tester',
      salutation: 'MR',
      country: 'AT',
    });

    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        {
          provide: APOLLO_TESTING_CACHE,
        },
        CsdDraftService,
      ],
    });
  });
  beforeEach(inject([CsdDraftService], (_service) => {
    service = _service;
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should add drafts with draftInput of different types', (done) => {
    const organisation: Organisation = Object.assign(new Organisation(), {
      id: 'OrganisationType:1',
      name: 'Test Organisation',
      owner: userId,
    });
    service.createOrUpdateDraft(user, User, userId);
    service.createOrUpdateDraft(organisation, Organisation, organisation.id);

    service
      .getAllDrafts$()
      .pipe(filter((drafts) => drafts.length >= 2))
      .subscribe((drafts) => {
        expect(drafts.length).toBe(2);
        expect(drafts[0].data).toEqual(user);
        expect(drafts[1].data).toEqual(organisation);
        done();
      });
  });

  it('should remove draft', (done) => {
    // subscription needs to be implemented first, because it does only fire on changes.
    // if the subscription would be after creation and deletion, it would not fire,
    // because there are no changes
    service
      .getAllDrafts$()
      .pipe(filter((drafts) => drafts.length === 0))
      .subscribe((drafts) => {
        expect(drafts.length).toBe(0);
        done();
      });
    service.createOrUpdateDraft(user, User, userId);

    service.deleteDraft(userId);
  });

  it('should get specific draft by id', (done) => {
    service.createOrUpdateDraft(user, User, userId);

    service.getDraftByModelId$(userId).subscribe((draft) => {
      expect(draft.data).toEqual(user);
      done();
    });
  });

  it('should update a draft', (done) => {
    service.createOrUpdateDraft(user, User, userId);
    const updatedUser = Object.assign(new User(), {
      id: userId,
      email: 'test.test@test.io',
      firstName: 'Max',
      lastName: 'Tester',
      salutation: 'MR',
      country: 'AT',
    });
    service.createOrUpdateDraft(updatedUser, User, userId);
    service
      .getDraftByModelId$(userId)
      .pipe(filter((draft) => draft.data.firstName === updatedUser.firstName))
      .subscribe((draft) => {
        expect(draft.data.firstName).toEqual(updatedUser.firstName);
        expect(draft.data.lastName).toEqual(user.lastName);
        done();
      });
  });

  it('should get specific draft by id of model', (done) => {
    service.createOrUpdateDraft(user, User);

    service.getDraftByModelId$(userId).subscribe((draft) => {
      expect(draft.data).toEqual(user);
      done();
    });
  });

  it('should get all drafts of a model', (done) => {
    service.createOrUpdateDraft(user, User, userId);
    service.createOrUpdateDraft({}, Organisation);
    service.createOrUpdateDraft({}, User);
    service.getAllDraftsOfModel$(User).subscribe((drafts) => {
      expect(drafts.length).toBe(2);
      done();
    });
  });

  it('should delete all drafts that belong to specific model', (done) => {
    service.createOrUpdateDraft(user, User, 'Draft:1');
    service.createOrUpdateDraft(user, User, 'Draft:2');
    service.createOrUpdateDraft({}, User, 'Draft:3');

    service.deleteAllDraftsOfModel(user.id);
    service
      .getAllDrafts$()
      // only the correct stream should be evaluated
      .pipe(filter((drafts) => drafts.length === 1 && drafts[0].id === 'Draft:3'))
      .subscribe((drafts) => {
        expect(drafts.length).toBe(1);
        expect(drafts.find((draft) => draft.dataId === userId)).toBeUndefined();
        done();
      });
  });

  it('should make an id if none is provided', (done) => {
    service.createOrUpdateDraft({}, User);
    service.getAllDrafts$().subscribe((drafts) => {
      expect(drafts[0].id).not.toBe(null);
      done();
    });
  });

  it('should get or create Draft by id', (done) => {
    let draftOfFirstFunction;
    // a draft should be returned
    service
      .getOrCreateDraftById$(User.typeName)
      .pipe(
        switchMap((draft) => {
          draftOfFirstFunction = draft;
          return service.getOrCreateDraftById$(User.typeName, draftOfFirstFunction.id);
        }),
        switchMap((draft) => {
          expect(draftOfFirstFunction.id).toEqual(draft.id);
          return service.getAllDrafts$();
        }),
        map((drafts) => {
          expect(drafts.length).toBe(1);
          done();
        })
      )
      .subscribe();
  });
});
