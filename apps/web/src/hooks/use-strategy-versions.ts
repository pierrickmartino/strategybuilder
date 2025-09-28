"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

import type { CanvasValidationIssue, StrategyGraph, StrategyVersionSummary } from "@strategybuilder/shared";
import { resolveAccessToken } from "@/lib/resolve-access-token";
import {
  createStrategyVersion,
  listStrategyVersions,
  revertStrategyVersion,
  validateStrategyGraph
} from "@/services/strategy-versions";

const versionsKey = (strategyId: string | null) => ["strategies", strategyId, "versions"] as const;

export function useStrategyVersions(strategyId: string | null) {
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();

  const queryFn = useCallback(async () => {
    if (!strategyId) {
      return [] as StrategyVersionSummary[];
    }
    const token = await resolveAccessToken(session, supabase);
    return listStrategyVersions(token, strategyId);
  }, [session, strategyId, supabase]);

  return useQuery({
    queryKey: versionsKey(strategyId),
    enabled: Boolean(strategyId),
    queryFn,
    staleTime: 60 * 1000
  });
}

export function useAutosaveStrategyVersion(strategyId: string | null) {
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["strategies", strategyId, "versions", "save"],
    mutationFn: async (input: { graph: StrategyGraph; label?: string | null }) => {
      if (!strategyId) {
        throw new Error("Strategy ID is required for autosave");
      }
      const token = await resolveAccessToken(session, supabase);
      return createStrategyVersion(token, strategyId, {
        graph: input.graph,
        label: input.label ?? undefined
      });
    },
    onSuccess: (version) => {
      if (!strategyId) {
        return;
      }
      queryClient.setQueryData(versionsKey(strategyId), (existing: StrategyVersionSummary[] | undefined) => {
        if (!existing) {
          return [version];
        }
        const deduped = existing.filter((item) => item.id !== version.id);
        return [version, ...deduped];
      });
    }
  });
}

export function useValidateStrategyGraph(strategyId: string | null) {
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();

  return useMutation({
    mutationKey: ["strategies", strategyId, "versions", "validate"],
    mutationFn: async (graph: StrategyGraph): Promise<CanvasValidationIssue[]> => {
      if (!strategyId) {
        throw new Error("Strategy ID is required for validation");
      }
      const token = await resolveAccessToken(session, supabase);
      return validateStrategyGraph(token, strategyId, graph);
    }
  });
}

export function useRevertStrategyVersion(strategyId: string | null) {
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["strategies", strategyId, "versions", "revert"],
    mutationFn: async (versionId: string) => {
      if (!strategyId) {
        throw new Error("Strategy ID is required for revert");
      }
      const token = await resolveAccessToken(session, supabase);
      return revertStrategyVersion(token, strategyId, versionId);
    },
    onSuccess: (version) => {
      if (!strategyId) {
        return;
      }
      queryClient.setQueryData(versionsKey(strategyId), (existing: StrategyVersionSummary[] | undefined) => {
        if (!existing) {
          return [version];
        }
        const deduped = existing.filter((item) => item.id !== version.id);
        return [version, ...deduped];
      });
    }
  });
}

