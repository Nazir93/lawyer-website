import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Адвокат | Юридические услуги премиум-класса",
    template: "%s | Адвокат",
  },
  description:
    "Профессиональные юридические услуги. Защита прав и интересов физических и юридических лиц. Консультации, представительство в суде.",
  keywords: [
    "адвокат",
    "юрист",
    "юридические услуги",
    "консультация юриста",
    "защита в суде",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
