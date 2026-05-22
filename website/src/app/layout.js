import '@/styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0ea5e9',
};

export const metadata = {
  title: {
    default: 'CryOS - Web3 Native Operating System',
    template: '%s | CryOS',
  },
  description: 'Financial sovereignty in your pocket. The first Web3-native OS for desktop and mobile with multi-chain wallet, DeFi dashboard, and NFT gallery.',
  keywords: ['cryptocurrency', 'web3', 'blockchain', 'defi', 'ethereum', 'mobile os', 'crypto wallet'],
  authors: [{ name: 'CryOS Foundation' }],
  creator: 'CryOS Foundation',
  publisher: 'CryOS Foundation',
  metadataBase: new URL('https://cryos.io'),
  openGraph: {
    title: 'CryOS - Web3 Native Operating System',
    description: 'Financial sovereignty in your pocket',
    url: 'https://cryos.io',
    siteName: 'CryOS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CryOS - Web3 Native Operating System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryOS - Web3 Native Operating System',
    description: 'Financial sovereignty in your pocket',
    images: ['/og-image.png'],
    creator: '@cryos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}