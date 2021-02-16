import { Injector, INJECTOR, NgModule, PLATFORM_ID } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClientOptions } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { isPlatformBrowser } from '@angular/common';
import { CSD_GRAPHQL_UNIVERSAL_HOST } from './core.types';
import { InMemoryCache } from '@apollo/client/cache';
import { ApolloLink } from '@apollo/client/core';

const uriRelative = '/api/graphql/';

export function apolloFactory(
  httpLink: HttpLink,
  platformId: Object,
  injector: Injector
): ApolloClientOptions<any> {
  let uri = null;
  // authLink
  let auth = null;

  // when at browser, send the auth token taken from the localStorage
  // at server side we cannot send any auth token
  if (isPlatformBrowser(platformId)) {
    uri = uriRelative;
    auth = setContext((request, previousContext) => {
      // Send auth token if exists to server for graphql queries
      const token = localStorage.getItem('authtoken');
      if (!token) {
        return {};
      } else {
        return {
          headers: {
            Authorization: `Token ${token}`,
          },
        };
      }
    });
  } else {
    // universal server:
    auth = setContext((request, previousContext) => {});
    const injectedHostFromNode: string = injector.get(CSD_GRAPHQL_UNIVERSAL_HOST);
    uri = `${injectedHostFromNode}${uriRelative}`;
  }
  // http link
  const http = httpLink.create({ uri: uri });

  const apolloErrorHandling = onError(({ graphQLErrors, networkError = {} as any }) => {
    // Add error info to be available when catching inside of csd-data.service.ts
    // https://github.com/apollographql/apollo-link/issues/855
    // https://github.com/apollographql/apollo-link/issues/1022
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );

    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  });

  return {
    // solution to apolloError not being triggered
    link: ApolloLink.from([apolloErrorHandling, auth, http]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
    },
  };
}

@NgModule({
  imports: [],
  exports: [],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: apolloFactory,
      deps: [HttpLink, PLATFORM_ID, INJECTOR],
    },
  ],
})
export class CsdGraphqlModule {}
