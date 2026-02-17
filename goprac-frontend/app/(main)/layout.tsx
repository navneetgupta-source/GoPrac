import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/header";

import { cookies } from 'next/headers';
import InitZustand from "@/components/InitZustand";

import { userProfileUpdateStatus } from '@/actions/isProfileUpdated';
import ProfileUpdate from "@/components/profile-update/profile-update";
import Footer from "@/components/footer";
import ActivityLogger from "@/lib/activityLogger";
import { Toaster } from 'sonner';
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goprac",
  description: "Goprac",
  icons: {
    icon: '/favicon.ico',
  },
};

const ALLOWED_ROUTES = ['/profile'];


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const jwtToken = cookieStore.get("_GP_")?.value || null;
  const userId = cookieStore.get("pracUser")?.value || null;
  const userType = cookieStore.get("pracUserType")?.value || null;
  const pracIsLoggedin = cookieStore.get("PracIsLoggedin")?.value || null;
  const userName = cookieStore.get("pracUserName")?.value || null;



  // console.log("user", user);

  // Only check for logged-in users
  let isProfileUpdated = null;
  if (userId) {
    isProfileUpdated = await userProfileUpdateStatus();
  }

  // Get current path (for route allow-list)
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  // const isAllowed = ALLOWED_ROUTES.some(route => pathname.startsWith(route));


  const user = { jwtToken, userId, userType, pracIsLoggedin, userName, isProfileUpdated };

  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased font-sans`}
      >
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <InitZustand
          user={user}
        />
        <ActivityLogger />
        <div className="min-h-screen bg-slate-50 text-black flex flex-col">
          <Header />
          <main className="flex-grow mx-auto w-full">
            {children}
          </main>
          <Footer />
        </div>
         <Toaster richColors />
      </body>
    </html>
  );
}
