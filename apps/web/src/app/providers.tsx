"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProvidersProps = {
  children: ReactNode;
  initialSession: Session | null;
  initialState?: DehydratedState;
};

export function Providers({ children, initialSession, initialState }: ProvidersProps) {
  const [supabaseClient] = useState(() => createSupabaseBrowserClient());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={initialState}>{children}</HydrationBoundary>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </SessionContextProvider>
  );
}
