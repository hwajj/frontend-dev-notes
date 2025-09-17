// src/features/survey/services/surveyRepository.ts
// 역할: 저장소(LocalStorage) 접근 전담

// 특징:

// LocalStorage key 규칙(makeKey)을 내부에만 숨김

// 읽기/쓰기/삭제만 담당

// API 호출, 비즈니스 로직 없음

/**
 * 새로운 설문 Draft 생성
 * @param surveyId - 설문 ID
 * @param userId - 사용자 ID
 * @param payload - 설문 데이터 (질문-답변 매핑)
 * @param schemaVersion - 현재 설문 스키마 버전
 * @param deviceId - 작성한 디바이스 ID
 */
export interface SurveyData {
  surveyId: string;
  userId: string;
  version: number;
  status: "draft" | "committed";
  updatedAt: number;
  payload: Record<string, unknown>;
  schemaVersion: number;
  deviceId: string;
}

const makeKey = (
  surveyId: string,
  userId: string,
  type: "draft" | "committed"
) => `survey:${surveyId}:${userId}:${type}`;

export const surveyRepository = {
  getDraft(surveyId: string, userId: string): SurveyData | null {
    const raw = localStorage.getItem(makeKey(surveyId, userId, "draft"));
    return raw ? JSON.parse(raw) : null;
  },

  saveDraft(survey: SurveyData) {
    localStorage.setItem(
      makeKey(survey.surveyId, survey.userId, "draft"),
      JSON.stringify(survey)
    );
  },

  getCommitted(surveyId: string, userId: string): SurveyData | null {
    const raw = localStorage.getItem(makeKey(surveyId, userId, "committed"));
    return raw ? JSON.parse(raw) : null;
  },

  saveCommitted(survey: SurveyData) {
    localStorage.setItem(
      makeKey(survey.surveyId, survey.userId, "committed"),
      JSON.stringify(survey)
    );
  },

  deleteDraft(surveyId: string, userId: string) {
    localStorage.removeItem(makeKey(surveyId, userId, "draft"));
  },
};
