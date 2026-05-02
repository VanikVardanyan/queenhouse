import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Armenian } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/content";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});
const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-armenian",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(SITE.url),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        hy: "/hy",
        ru: "/ru",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE.url}/${locale}`,
      siteName: SITE.name,
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${notoArmenian.variable}`}
    >
      <head>
        <ThemeScript />
        <JsonLd locale={locale as "hy" | "ru" | "en"} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
