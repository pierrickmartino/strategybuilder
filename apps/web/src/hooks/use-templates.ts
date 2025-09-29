"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import type { TemplateShare } from "@strategybuilder/shared";
import { listTemplates } from "@/services/templates";

export function useTemplates() {
  const supabase = useSupabaseClient();
  const { session, isLoading } = useSessionContext();

  const queryFn = useCallback(async () => {
    let token = session?.access_token;
    if (!token) {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) {
        throw error ?? new Error("Missing Supabase session");
      }
      token = data.session.access_token;
    }

    return listTemplates(token);
  }, [session?.access_token, supabase]);

  return useQuery<TemplateShare[]>({
    queryKey: ["templates", "library"],
    enabled: !isLoading,
    queryFn,
    staleTime: 5 * 60 * 1000
  });
}
