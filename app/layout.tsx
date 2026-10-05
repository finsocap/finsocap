import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/Providers/AuthProvider";
import { ThemeProvider } from "@/components/Providers/ThemeProvider";
import GlobalTopProgressBar from "@/components/Global/TopProgressBar";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "Finsocap - Operations & CRM Dashboard",
    template: "%s | Finsocap Dashboard",
  },
  description:
    "Enterprise White-label Content & Operations Management Dashboard.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-[#f4f6fa] text-slate-800 font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <GlobalTopProgressBar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
