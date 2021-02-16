import { Injectable } from '@angular/core';
import { DocumentNode } from '@apollo/client';
import { catchError, map, pluck } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { get, keys } from 'lodash-es';
import { Apollo } from 'apollo-angular';
import { CsdErrorFactory } from '../../auth/error-factory.service';
import { CsdNetworkError } from '../../shared/errors';

@Injectable({
  providedIn: 'root',
})
export class CsdDataService {
  constructor(private apollo: Apollo) {}

  mutate$<T>(mutation: DocumentNode, variables: {}, apolloOptions = {}): Observable<T> {
    return this.apollo.mutate({ ...apolloOptions, mutation: mutation, variables: variables }).pipe(
      catchError((error) => {
        return CsdErrorFactory.catchNetworkErrors(error);
      }),
      map((result) => {
        if (result instanceof CsdNetworkError) {
          CsdErrorFactory.handleGraphqlError(result);
          return throwError(result);
        }

        try {
          CsdErrorFactory.handleAppError(result);
        } catch (e) {
          throw e;
        }

        const data = result.data;
        return data[Object.keys(data)[0]];
      })
    );
  }

  query<T, V = any>(query: DocumentNode, variables?: V, options?: {}) {
    // TODO: query error handling
    return this.apollo.watchQuery<T, V>({ query: query, variables: variables, ...options });
  }

  query$<T, V = any>(query: DocumentNode, variables?: V, options?: {}) {
    return this.query<T, V>(query, variables, options).valueChanges.pipe(
      catchError((error) => {
        return CsdErrorFactory.catchNetworkErrors(error);
      })
    );
  }

  typedQuery<T, R>(query, variables: {}, path: string[], options?: {}): Observable<R> {
    return this.query$(query, variables, options).pipe(pluck(...path));
  }
}

/**
 * A little helper function that returns the value of the first key-element
 * Throws an error if there is more than one Child!
 */
function extractChild(elem: any): any {
  const all_keys = keys(elem);
  if (all_keys.length !== 1) {
    throw Error('extractChild: `elem` must have exactly one child element!');
  }
  return get(elem, all_keys[0]);
}
