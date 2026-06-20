import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal Ticket Curry",
  description:
    "A mobile-first meal ticket loop where adults add 200 yen so children can eat warm curry without shame.",
};

type RootLayoutProps = {
  readonly children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
