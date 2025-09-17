// src/features/survey/services/surveyApi.ts
// 역할: 서버 API 호출 전담
// 특징:
// axios 설정, URL, HTTP 메서드 등 서버 통신 세부사항을 숨김
// 응답 형식/에러 처리도 여기서 담당 가능
// 저장소 접근 없음
import axios from "axios";
import { SurveyData } from "./surveyRepository";

export const surveyApi = {
  async submitSurvey(data: SurveyData) {
    const res = await axios.post("/api/survey/submit", data);
    return res.data;
  },
};
