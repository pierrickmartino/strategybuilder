"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import type { EducationSuite } from "@strategybuilder/shared";
import { getOnboardingEducation } from "@/services/education";

export function useOnboardingEducation() {
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

    return getOnboardingEducation(token);
  }, [session?.access_token, supabase]);

  return useQuery<EducationSuite>({
    queryKey: ["education", "onboarding"],
    enabled: !isLoading,
    queryFn,
    staleTime: 10 * 60 * 1000
  });
}
