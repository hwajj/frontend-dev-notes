// Custom Hook: 설문지 상태 관리
import { useState, useEffect, useCallback } from 'react';
import { SurveyStorageService } from '../services/SurveyStorageService';
import { SurveyData, Question } from '../services/SurveyRepository';

export const useSurvey = () => {
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const storageService = new SurveyStorageService();
  
  // 설문지 초기 로드
  useEffect(() => {
    loadSurveyDraft();
  }, []);
  
  // 임시 저장된 설문지 로드
  const loadSurveyDraft = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const draft = await storageService.getSurveyDraft();
      setSurvey(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 새 설문지 생성
  const createSurvey = useCallback(async (title: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const surveyData = {
        title,
        questions: [],
        status: 'draft' as const
      };
      
      const id = await storageService.saveSurveyDraft(surveyData);
      const newSurvey: SurveyData = {
        ...surveyData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSurvey(newSurvey);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 질문 추가
  const addQuestion = useCallback(async (question: Omit<Question, 'id'>) => {
    if (!survey) return;
    
    try {
      const newQuestion: Question = {
        ...question,
        id: Date.now().toString(36)
      };
      
      const updatedSurvey = {
        ...survey,
        questions: [...survey.questions, newQuestion],
        updatedAt: new Date()
      };
      
      await storageService.updateSurveyDraft(updatedSurvey);
      setSurvey(updatedSurvey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question');
    }
  }, [survey]);
  
  // 질문 수정
  const updateQuestion = useCallback(async (questionId: string, updates: Partial<Question>) => {
    if (!survey) return;
    
    try {
      const updatedQuestions = survey.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      
      const updatedSurvey = {
        ...survey,
        questions: updatedQuestions,
        updatedAt: new Date()
      };
      
      await storageService.updateSurveyDraft(updatedSurvey);
      setSurvey(updatedSurvey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question');
    }
  }, [survey]);
  
  // 설문지 확정
  const commitSurvey = useCallback(async () => {
    if (!survey) return;
    
    try {
      setLoading(true);
      setError(null);
      await storageService.commitSurvey(survey.id);
      setSurvey(null); // 임시 데이터 삭제
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit survey');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [survey]);
  
  return {
    survey,
    loading,
    error,
    createSurvey,
    addQuestion,
    updateQuestion,
    commitSurvey,
    loadSurveyDraft
  };
}; 