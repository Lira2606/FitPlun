import type { Metadata } from 'next';
import './globals.css';
import { WorkoutProvider } from '@/components/WorkoutProvider';

export const metadata: Metadata = {
  title: 'Treino Pro',
  description: 'Seu app de treino para levar a sério.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-poppins: 'Poppins', sans-serif;
                --font-bebas-neue: 'Bebas Neue', sans-serif;
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <WorkoutProvider>
            <div className="mx-auto max-w-md h-full bg-background shadow-2xl shadow-black">
                {children}
            </div>
        </WorkoutProvider>
      </body>
    </html>
  );
}
