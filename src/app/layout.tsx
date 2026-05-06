import '../styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Admin Panel | EarnRewardzz',
  description: 'Premium administrative dashboard for EarnRewardzz ecosystem.',
};

import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
