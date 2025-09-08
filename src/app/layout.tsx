import "./globals.css";
import type { Metadata } from "next";
import "react-photo-view/dist/react-photo-view.css";

export const metadata: Metadata = {
  title: "A&A Wedding Photo Share",
  description: "Share and view wedding photos with family and friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
