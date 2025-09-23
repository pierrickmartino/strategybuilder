"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import type { WorkspaceConsent } from "@strategybuilder/shared";

type AuthProfile = {
  id: string;
  email: string | null;
  roles: string[];
  consent: WorkspaceConsent | null;
};

const authQueryKey = ["auth", "profile"] as const;

export function useAuthProfile() {
  const { session } = useSessionContext();
  const supabase = useSupabaseClient();
  const initialSnapshot = useMemo(() => {
    if (!session) {
      return null;
    }

    const consentMetadata = session.user.user_metadata ?? {};
    const roles = (session.user.app_metadata?.roles as string[] | undefined) ?? [];
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      roles,
      consent: session.user.user_metadata?.accepted_simulation_only
        ? {
            acceptedSimulationOnly: true,
            acceptedAt: consentMetadata.accepted_simulation_only_at ?? new Date().toISOString()
          }
        : null
    } satisfies AuthProfile;
  }, [session]);

  return useQuery<AuthProfile | null>({
    queryKey: authQueryKey,
    enabled: Boolean(session),
    queryFn: async () => {
      if (!session) {
        return null;
      }

      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!user) {
        return null;
      }

      const consentMetadata = user.user_metadata ?? {};
      const consent: WorkspaceConsent | null = user.user_metadata?.accepted_simulation_only
        ? {
            acceptedSimulationOnly: true,
            acceptedAt: consentMetadata.accepted_simulation_only_at ?? new Date().toISOString()
          }
        : null;

      const roles = (user.app_metadata?.roles as string[] | undefined) ?? [];

      return {
        id: user.id,
        email: user.email ?? null,
        roles,
        consent
      } satisfies AuthProfile;
    },
    initialData: initialSnapshot
  });
}

export function useHasRole(role: string) {
  const { data } = useAuthProfile();
  return data?.roles?.includes(role) ?? false;
}
