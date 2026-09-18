import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sanjeevani-Mesh | Cross-District Medicine Rebalancing Engine',
  description:
    'Decentralized healthcare logistics platform monitoring medicine inventories across PHCs/CHCs with algorithmic FEFO rebalancing and Vertex AI integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
