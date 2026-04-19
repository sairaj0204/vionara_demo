import '@/app/globals.css';
import Providers from '@/components/Providers';

export default function App({ Component, pageProps }) {
    return (
        <Providers>
            <Component {...pageProps} />
        </Providers>
    );
}
