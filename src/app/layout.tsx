import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; // импорт по умолчанию

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
