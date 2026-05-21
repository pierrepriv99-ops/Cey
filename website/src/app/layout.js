import './styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CryOS - Web3 Native Operating System',
  description: 'Financial sovereignty in your pocket. The first Web3-native OS for desktop and mobile.',
  keywords: ['cryptocurrency', 'web3', 'blockchain', 'defi', 'ethereum', 'mobile os'],
  openGraph: {
    title: 'CryOS - Web3 Native Operating System',
    description: 'Financial sovereignty in your pocket',
    url: 'https://cryos.io',
    siteName: 'CryOS',
    images: ['/og-image.png'],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}