"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Analysis } from "@/lib/analysis-types";
import {
  loadAnalyses,
  prependAnalysis,
  removeAnalysis,
  saveAnalyses,
} from "@/lib/storage";

const STORAGE_WARNING =
  "Your analyses could not be saved in this browser. Check that site storage is enabled and that private browsing is not blocking it.";

export interface UseAnalysesResult {
  analyses: Analysis[];
  isLoaded: boolean;
  storageError: string | null;
  addAnalysis: (analysis: Analysis) => void;
  deleteAnalysis: (id: string) => void;
}

export function useAnalyses(): UseAnalysesResult {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // A ref mirrors the latest list so that writes are synchronous and never
  // depend on when React re-renders. This matters because the home page
  // saves an analysis and then navigates to its detail page immediately.
  const analysesRef = useRef<Analysis[]>([]);

  useEffect(() => {
    const stored = loadAnalyses();
    analysesRef.current = stored;
    setAnalyses(stored);
    setIsLoaded(true);
  }, []);

  const commit = useCallback((next: Analysis[]) => {
    analysesRef.current = next;
    const saved = saveAnalyses(next);
    setStorageError(saved ? null : STORAGE_WARNING);
    setAnalyses(next);
  }, []);

  const addAnalysis = useCallback(
    (analysis: Analysis) => {
      commit(prependAnalysis(analysesRef.current, analysis));
    },
    [commit],
  );

  const deleteAnalysis = useCallback(
    (id: string) => {
      commit(removeAnalysis(analysesRef.current, id));
    },
    [commit],
  );

  return { analyses, isLoaded, storageError, addAnalysis, deleteAnalysis };
    }
