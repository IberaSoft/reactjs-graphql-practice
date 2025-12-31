import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import gql from 'graphql-tag';
import { endpoint, prodEndpoint } from '../config';

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'development' ? endpoint : prodEndpoint,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        items: {
          merge(existing = [], incoming: any[]) {
            return incoming;
          },
        },
        cartOpen: {
          read() {
            return false;
          },
        },
      },
    },
  },
});

// Initialize cache with default values
cache.writeQuery({
  query: LOCAL_STATE_QUERY,
  data: {
    cartOpen: false,
  },
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache,
  credentials: 'include',
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Export the local state query for use in components
export { LOCAL_STATE_QUERY };

