// src/features/survey/hooks/useSurveyDraft.ts
import { useState, useCallback } from "react";
import { surveyStorageService } from "../services/surveyStorageService";
import { SurveyData } from "../services/surveyRepository";

export function useSurveyDraft(surveyId: string, userId: string) {
  const [draft, setDraft] = useState<SurveyData | null>(
    surveyStorageService.getDraft(surveyId, userId)
  );

  const saveDraft = useCallback((data: SurveyData) => {
    surveyStorageService.saveDraft(data);
    setDraft(data);
  }, []);

  const submitSurvey = useCallback(async (data: SurveyData) => {
    await surveyStorageService.submitSurvey(data);
    setDraft(null);
  }, []);

  return { draft, saveDraft, submitSurvey };
}
