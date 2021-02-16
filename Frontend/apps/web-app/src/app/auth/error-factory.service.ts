import { Injectable } from '@angular/core';
import { CsdBaseError, CsdNetworkError, CsdUnauthorizedError } from '../shared/errors';
import { ApolloError } from '@apollo/client/core';
import { Observable, throwError } from 'rxjs';
import {
  CsdDuplicateEmailError,
  CsdIntegrityError,
  CsdInvalidCredentialsError,
  CsdInvalidEmailError,
  CsdInvalidTokenError,
  CsdNotAuthenticatedError,
  CsdPermissionDeniedError,
} from './auth.errors';

@Injectable({
  providedIn: 'root',
})
export class CsdErrorFactory {
  // TODO: create list of possible errors and method for extending it
  //  in order to be used by lazy loading modules

  private static extractErrorObjectFromResponse(result: any): CsdBaseError {
    // structure of response dict: data -> mutation_name -> error
    const mutationName = Object.keys(result.data)[0];
    return result.data[mutationName].error;
  }

  public static handleAppError(graphqlResponse: any) {
    const errorObj = this.extractErrorObjectFromResponse(graphqlResponse);
    if (errorObj) {
      switch (errorObj.id) {
        case CsdInvalidCredentialsError.key: {
          throw new CsdInvalidCredentialsError(errorObj.message, errorObj.data);
        }
        case CsdIntegrityError.key: {
          throw new CsdIntegrityError(errorObj.message, errorObj.data);
        }
        case CsdNotAuthenticatedError.key: {
          throw new CsdNotAuthenticatedError(errorObj.message, errorObj.data);
        }
        case CsdInvalidTokenError.key: {
          throw new CsdInvalidTokenError(errorObj.message, errorObj.data);
        }
        case CsdDuplicateEmailError.key: {
          throw new CsdDuplicateEmailError(errorObj.message, errorObj.data);
        }
        case CsdPermissionDeniedError.key: {
          throw new CsdPermissionDeniedError(errorObj.message, errorObj.data);
        }
        case CsdInvalidEmailError.key: {
          throw new CsdInvalidEmailError(errorObj.message, errorObj.data);
        }
        default: {
          throw new CsdBaseError(errorObj.message, errorObj.id.toString(), errorObj.data);
        }
      }
    }
  }

  public static handleGraphqlError(error: CsdNetworkError) {
    throw new CsdNetworkError(error.message);
  }

  public static catchNetworkErrors(error): Observable<never> {
    if (error instanceof ApolloError) {
      const apolloError = (error as ApolloError).message;
      // Dev server response is 401 OK so this is a workaround
      if (apolloError.indexOf('401 ') > -1) {
        // probably we should redirect at this point to some logout page?
        // or notify a global error service which is doing the redirect?
        return throwError(new CsdUnauthorizedError());
      }
    }
    return throwError(new CsdNetworkError(error.message));
  }
}
