import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lindsey Jorissen | Fullstack Developer",
  description: "Fullstack developer portfolio showcasing projects in Django, React, Flask, Next.js, and Python. Building systems that live on the internet.",
  keywords: ["Fullstack Developer", "Web Development", "Django", "React", "Next.js", "Python", "Portfolio"],
  authors: [{ name: "Lindsey Jorissen" }],
  creator: "Lindsey Jorissen",
  metadataBase: new URL('https://lindseyjorissen.blackcatstudios.xyz'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lindseyjorissen.blackcatstudios.xyz", 
    title: "Lindsey Jorissen | Fullstack Developer",
    description: "Fullstack developer portfolio showcasing projects in Django, React, Flask, Next.js, and Python.",
    siteName: "Lindsey Jorissen Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lindsey Jorissen | Fullstack Developer",
    description: "Fullstack developer portfolio showcasing projects in Django, React, Flask, Next.js, and Python.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background500/50 text-foreground">
        {children}
      </body>
    </html>
  )
}
