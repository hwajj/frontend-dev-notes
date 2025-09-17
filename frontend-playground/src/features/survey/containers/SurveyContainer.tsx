import React from "react";
import { SurveyForm } from "../components/SurveyForm";
import { useSurveyDraft } from "../hooks/useSurveyDraft";

//상태·이벤트를 관리하고, Hook을 호출해서 데이터를 가져오고 저장
export function SurveyContainer({
  surveyId,
  userId,
}: {
  surveyId: string;
  userId: string;
}) {
  const { draft, saveDraft, submit } = useSurveyDraft(surveyId, userId);

  return (
    <SurveyForm
      draft={draft}
      onChange={(partial) => saveDraft(partial)}
      onSubmit={submit}
    />
  );
}
