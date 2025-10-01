"use client";

import { useEffect, useRef } from "react";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useShallow } from "zustand/react/shallow";

import { sendOnboardingEvents } from "@/services/analytics";
import { useOnboardingProgress } from "@/stores/onboarding-progress";

export function OnboardingAnalyticsBridge() {
  const supabase = useSupabaseClient();
  const { session, isLoading } = useSessionContext();
  const flushingRef = useRef(false);

  const { pendingEvents, drainEvents, requeueEvents } = useOnboardingProgress(
    useShallow((state) => ({
      pendingEvents: state.pendingEvents,
      drainEvents: state.drainEvents,
      requeueEvents: state.requeueEvents
    }))
  );

  useEffect(() => {
    if (isLoading || pendingEvents.length === 0 || flushingRef.current) {
      return;
    }

    let cancelled = false;

    async function flush() {
      const events = drainEvents();
      if (events.length === 0) {
        return;
      }

      flushingRef.current = true;

      try {
        let accessToken = session?.access_token;
        if (!accessToken) {
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session?.access_token) {
            throw error ?? new Error("Missing Supabase session");
          }
          accessToken = data.session.access_token;
        }

        await sendOnboardingEvents(accessToken, events);
      } catch (error) {
        console.error("Failed to send onboarding analytics", error);
        if (!cancelled) {
          requeueEvents(events);
        }
      } finally {
        if (!cancelled) {
          flushingRef.current = false;
        }
      }
    }

    void flush();

    return () => {
      cancelled = true;
    };
  }, [drainEvents, isLoading, pendingEvents, requeueEvents, session?.access_token, supabase]);

  return null;
}
