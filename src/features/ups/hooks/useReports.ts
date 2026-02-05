import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { createScheduledReport, getScheduledReports } from "../api/upsApi";
import { demoScheduledReports } from "../data/demoData";
import type { ScheduledReport } from "../types";

export const useReports = () => {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<ScheduledReport[]>(demoScheduledReports);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      if (!isAuthenticated) {
        setReports(demoScheduledReports);
        setLoading(false);
        return;
      }

      try {
        const response = await getScheduledReports();
        if (active && response?.isSuccess && response.data) {
          setReports(response.data);
        } else if (active) {
          setReports(demoScheduledReports);
        }
      } catch (error) {
        if (active) {
          setReports(demoScheduledReports);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const createReport = async (payload: Omit<ScheduledReport, "id" | "nextRun">) => {
    try {
      const response = await createScheduledReport(payload);
      if (response?.isSuccess && response.data) {
        setReports((prev) => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      const optimistic: ScheduledReport = {
        ...payload,
        id: Date.now().toString(),
        nextRun: new Date(),
      };
      setReports((prev) => [optimistic, ...prev]);
      return optimistic;
    }
    return null;
  };

  return { reports, loading, createReport };
};
