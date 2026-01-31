import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import Header from "@/components/Header";
import { checkUser } from "@/lib/checkUser";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Annapurna - AI Recipe Platform",
  description: "",
};

export default async function RootLayout({ children }) {
  const user = await checkUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider
          appearance={{
            baseTheme: neobrutalism,
          }}
        >
          <Header user={user} />

          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="py-8 px-4 border-t">
            <div className="max-w-6xl mx-auto flex justify-center items-center">
              <p className="text-stone-500 text-sm">
                Made with 💗 by Kalp Kothari
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
