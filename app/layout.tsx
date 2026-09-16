import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WORK OUT — персональные тренировки",
  description: "Персональные программы тренировок дома и в зале",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
