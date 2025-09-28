"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import type { WorkspaceBootstrapPayload } from "@strategybuilder/shared";
import { useWorkspaceStore } from "@/stores/workspace-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function fetchWorkspaceBootstrap(token: string): Promise<WorkspaceBootstrapPayload> {
  const response = await fetch(`${API_BASE_URL}/workspaces/bootstrap`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to bootstrap workspace");
  }

  return response.json() as Promise<WorkspaceBootstrapPayload>;
}

export function useWorkspaceBootstrap() {
  const supabase = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const hydrate = useWorkspaceStore((state) => state.hydrateFromBootstrap);
  const hydrated = useWorkspaceStore((state) => state.hydrated);

  const queryFn = useCallback(async () => {
    const accessToken = session?.access_token;
    if (!accessToken) {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) {
        throw error ?? new Error("Missing Supabase session");
      }
      return fetchWorkspaceBootstrap(data.session.access_token);
    }

    return fetchWorkspaceBootstrap(accessToken);
  }, [session?.access_token, supabase]);

  return useQuery<WorkspaceBootstrapPayload>({
    queryKey: ["workspace", "bootstrap"],
    enabled: !hydrated && !sessionLoading,
    queryFn,
    staleTime: 5 * 60 * 1000,
    onSuccess: hydrate
  });
}
