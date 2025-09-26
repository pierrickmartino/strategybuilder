import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dehydrate, QueryClient } from "@tanstack/react-query";

import "./globals.css";

import { Providers } from "./providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { i18n } from "@/i18n/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strategy Builder",
  description: "Foundation for the Strategy Builder platform"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const queryClient = new QueryClient();
  const authSnapshot = session
    ? {
        id: session.user.id,
        email: session.user.email,
        roles: (session.user.app_metadata?.roles as string[] | undefined) ?? [],
        consentAccepted: Boolean(session.user.user_metadata?.accepted_simulation_only),
        consentAcceptedAt: session.user.user_metadata?.accepted_simulation_only_at ?? null
      }
    : null;

  queryClient.setQueryData(["auth", "profile"], authSnapshot);
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang={i18n.defaultLocale}>
      <body className={inter.className}>
        <Providers initialSession={session} initialState={dehydratedState}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
