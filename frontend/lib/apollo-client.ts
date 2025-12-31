import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
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

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
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
      Mutation: {
        fields: {
          toggleCart(_, { cache }) {
            const { cartOpen } = cache.readQuery({
              query: require('graphql-tag').default`
                query {
                  cartOpen @client
                }
              `,
            }) as { cartOpen: boolean };
            const data = {
              cartOpen: !cartOpen,
            };
            cache.writeQuery({
              query: require('graphql-tag').default`
                query {
                  cartOpen @client
                }
              `,
              data,
            });
            return data;
          },
        },
      },
    },
  }),
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

