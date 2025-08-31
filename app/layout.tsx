import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StarField } from '@/components/StarField'
import { Header } from '@/components/Header'
import { FloatingSocialBubbles } from '@/components/FloatingSocialBubbles'
import { UserIDProvider } from '@/components/UserIDProvider'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UpStream - Platform Streaming Langsung",
  description: "Platform streaming langsung untuk acara pilihan dengan kualitas HD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <UserIDProvider>
          <div className="min-h-screen relative">
            <StarField />
            <Header />
            <FloatingSocialBubbles />
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </UserIDProvider>
      </body>
    </html>
  );
}
