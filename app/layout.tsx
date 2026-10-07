import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Flow 2026 | Gestiona tus tareas sin distracciones",
  description: "Una herramienta simple y gratuita para gestionar tus tareas que guarda todo automaticamente. Sin registro, sin anuncios, 100% gratis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
