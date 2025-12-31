import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import Page from '../components/Page';
import { client } from '../lib/apollo-client';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Page>
        <Component {...pageProps} />
      </Page>
    </ApolloProvider>
  );
}

export default MyApp;

