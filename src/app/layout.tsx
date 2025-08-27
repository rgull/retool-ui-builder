import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Retool Next App",
  description: "This app is copy of retool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
