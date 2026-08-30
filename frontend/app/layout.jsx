import "./globals.css";
import { AuthProvider } from "../src/context/AuthContext.jsx";

export const metadata = {
  title: "MineRakshak AI — Smart Governance & Compliance Platform",
  description:
    "AI-Based Smart Governance and Compliance Monitoring System for Coal Mines. Real-time inspection tracking, risk analytics, and statutory compliance management.",
  keywords: [
    "coal mine safety",
    "DGMS compliance",
    "mine governance",
    "AI risk scoring",
    "inspection management",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas text-ink font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
