import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";
import { ConfigProvider } from "@/lib/config-store";
import { AuthProvider } from "@/lib/auth-context";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tu Carné Gremial — Registro campesino y gallero",
  description:
    "Plataforma sencilla para registrar y conocer a nuestra comunidad campesina y gallera de Colombia. El poder de estar unidos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <ToastProvider>
          <ConfigProvider>
            <AuthProvider>{children}</AuthProvider>
          </ConfigProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
