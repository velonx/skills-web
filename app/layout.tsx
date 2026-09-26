import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, IBM_Plex_Sans, Patrick_Hand } from "next/font/google";
import { CloseNavOnRouteChange, SlashToSearch } from "@/components/client";
import { PaperFilters } from "@/components/doodles";
import { Footer, Header, Sidebar } from "@/components/site";
import { getCategories, getRegistryRevision } from "@/lib/registry";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });
const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-caveat" });

const description = "Open-source skills for AI agents. Discover, understand and reuse skills from the Velonx community.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Velonx Skills — Open-source skills for AI agents", template: "%s — Velonx Skills" },
  description,
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon_io/android-chrome-512x512%20Background%20Removed.png",
  },
  manifest: "/favicon_io/site.webmanifest",
  openGraph: { type: "website", siteName: "Velonx Skills", url: SITE_URL, description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e4" },
    { media: "(prefers-color-scheme: dark)", color: "#2a2e27" },
  ],
};

// Runs before paint so the saved theme never flashes.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('vx-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [categories, revision] = await Promise.all([getCategories(), getRegistryRevision()]);
  return (
    <html lang="en" suppressHydrationWarning className={`${plexSans.variable} ${plexMono.variable} ${patrick.variable} ${caveat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans text-[15px] leading-relaxed">
        <PaperFilters />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <div className="mx-auto grid max-w-[1560px] grid-cols-[232px_minmax(0,1fr)] gap-[30px] px-8 pb-10 pt-[30px] max-lg:grid-cols-[minmax(0,1fr)] max-lg:px-4 max-lg:pt-5">
          <Sidebar categories={categories} className="sticky top-[104px] min-h-[calc(100dvh-134px)] self-start max-lg:hidden" />
          <main id="main" className="min-w-0">
            {children}
            <Footer revision={revision} />
          </main>
        </div>
        <div id="mobile-nav" popover="auto" aria-label="Menu">
          <Sidebar categories={categories} className="h-full overflow-y-auto" />
        </div>
        <CloseNavOnRouteChange />
        <SlashToSearch />
      </body>
    </html>
  );
}
