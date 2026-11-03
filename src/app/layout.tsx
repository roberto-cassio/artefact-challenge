import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Gerenciador simples de tarefas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topo">
          <Link href="/">Tarefas</Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
