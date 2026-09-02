import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AeroWatch — Extreme Weather Intelligence Command Center',
  description: 'AI-driven spatio-temporal tracking of extreme weather anomalies in medium-range forecasts. SIH26078.',
  keywords: ['weather', 'anomaly detection', 'extreme weather', 'India', 'forecasting', 'SIH2024'],
  openGraph: {
    title: 'AeroWatch',
    description: 'AI-Powered Extreme Weather Intelligence & Operational Command Center',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Geist:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className="bg-background text-on-surface antialiased scanlines overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
