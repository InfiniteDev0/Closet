import { Geist, Geist_Mono, Outfit, Teachers } from "next/font/google";
import "./globals.css";

const teachers = Teachers({
  variable: "--font-teachers",
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "CLOSET - Your AI-Powered Wardrobe Assistant",
  description:
    "Organize everything you wear, keep it clean, and get AI-powered outfit suggestions for any occasion. Your digital closet that thinks ahead.",
  keywords:
    "wardrobe, closet organizer, outfit planner, AI stylist, laundry tracker, fashion assistant",
  authors: [{ name: "The Closet Team" }],
  creator: "Abdiaziz Mohamed",
  publisher: "InfiniteDev0",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "CLOSET - Your AI-Powered Wardrobe Assistant",
    description:
      "Organize and manage your clothes effortlessly with AI-powered outfit suggestions.",
    type: "website",
    siteName: "CLOSET",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLOSET - Your AI-Powered Wardrobe Assistant",
    description:
      "Your digital closet that organizes, suggests, and plans ahead.",
  },
  manifest: "/manifest.json",
  themeColor: "#905B33",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${teachers.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
