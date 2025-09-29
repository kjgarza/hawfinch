import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";

export const metadata: Metadata = {
  metadataBase: new URL("https://hawfinch.vercel.app"),
  title: "Automatic Multiple Tool Steps Preview",
  description: "Automatically handle multiple tool steps using the AI SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <AuthModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
