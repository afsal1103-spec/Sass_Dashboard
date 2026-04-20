import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Sass Dashboard | Freelancer Operating System",
  description: "Client, project, invoice, and proposal workflows built for freelancers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-[#050b16] font-[var(--font-manrope)] text-[#ecf2ff] antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(7, 20, 36, 0.95)",
              color: "#ecf2ff",
              border: "1px solid rgba(136, 203, 255, 0.26)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
