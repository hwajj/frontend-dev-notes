// src/features/survey/services/surveyStorageService.ts
import { surveyRepository, SurveyData } from "./surveyRepository";
import { surveyApi } from "./surveyApi";
// 역할: Repository와 API를 묶어서 컨테이너·훅이 쉽게 쓸 수 있는 단일 진입점 제공

// 특징:

// draft → committed 승격 같은 오케스트레이션 로직 포함

// 컨테이너는 surveyStorageService.submitSurvey()만 호출하면
// 내부적으로 API 호출 + 로컬 저장 + draft 삭제까지 처리됨

// updatedAt 같은 공통 데이터 변환도 여기서 처리
export const surveyStorageService = {
  // 로컬 draft 가져오기
  getDraft: (surveyId: string, userId: string) =>
    surveyRepository.getDraft(surveyId, userId),

  // draft 저장
  saveDraft: (data: SurveyData) =>
    surveyRepository.saveDraft({ ...data, updatedAt: Date.now() }),

  // committed 가져오기
  getCommitted: (surveyId: string, userId: string) =>
    surveyRepository.getCommitted(surveyId, userId),

  // committed 저장
  saveCommitted: (data: SurveyData) =>
    surveyRepository.saveCommitted({ ...data, updatedAt: Date.now() }),

  // draft 삭제
  deleteDraft: (surveyId: string, userId: string) =>
    surveyRepository.deleteDraft(surveyId, userId),

  // 서버 제출 + committed로 승격
  async submitSurvey(data: SurveyData) {
    // 1. 서버 전송
    await surveyApi.submitSurvey(data);
    // 2. 로컬 저장
    surveyRepository.saveCommitted({
      ...data,
      status: "committed",
      updatedAt: Date.now(),
    });
    // 3. draft 삭제
    surveyRepository.deleteDraft(data.surveyId, data.userId);
  },
};
