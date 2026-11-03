import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });

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
      <body className={roboto.className}>
        <header className="topo">
          <Link href="/" className="marca">
            Gerenciador de <span>tarefas</span>
          </Link>
        </header>
        <main>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
