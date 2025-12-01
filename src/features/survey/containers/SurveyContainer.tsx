// Container 컴포넌트: 상태와 이벤트 핸들링만 담당
import React from 'react';
import { SurveyForm } from '../components/SurveyForm';
import { useSurvey } from '../hooks/useSurvey';
import { SurveyData, Question } from '../services/SurveyRepository';

export const SurveyContainer: React.FC = () => {
  const {
    survey,
    loading,
    error,
    createSurvey,
    addQuestion,
    updateQuestion,
    commitSurvey,
    loadSurveyDraft
  } = useSurvey();
  
  // 설문지 제목 변경
  const handleTitleChange = async (title: string) => {
    if (!survey) {
      // 새 설문지 생성
      try {
        await createSurvey(title);
      } catch (error) {
        console.error('Failed to create survey:', error);
      }
    } else {
      // 기존 설문지 제목 업데이트
      try {
        await updateQuestion(survey.id, { title });
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    }
  };
  
  // 질문 추가
  const handleAddQuestion = async (question: Omit<Question, 'id'>) => {
    try {
      await addQuestion(question);
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };
  
  // 질문 수정
  const handleUpdateQuestion = async (questionId: string, updates: Partial<Question>) => {
    try {
      await updateQuestion(questionId, updates);
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };
  
  // 질문 삭제
  const handleDeleteQuestion = async (questionId: string) => {
    if (!survey) return;
    
    try {
      const updatedQuestions = survey.questions.filter(q => q.id !== questionId);
      const updatedSurvey = {
        ...survey,
        questions: updatedQuestions,
        updatedAt: new Date()
      };
      
      // SurveyStorageService를 통해 업데이트
      const { SurveyStorageService } = await import('../services/SurveyStorageService');
      const storageService = new SurveyStorageService();
      await storageService.updateSurveyDraft(updatedSurvey);
      
      // 로컬 상태 업데이트
      loadSurveyDraft();
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };
  
  // 설문지 확정
  const handleCommit = async () => {
    try {
      await commitSurvey();
      alert('설문지가 성공적으로 확정되었습니다!');
    } catch (error) {
      console.error('Failed to commit survey:', error);
      alert('설문지 확정에 실패했습니다.');
    }
  };
  
  return (
    <div className="survey-container">
      <header className="survey-header">
        <h1>설문지 생성기</h1>
        <p>설문지를 만들고 관리하세요</p>
      </header>
      
      <main className="survey-main">
        <SurveyForm
          survey={survey}
          onTitleChange={handleTitleChange}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onCommit={handleCommit}
          loading={loading}
          error={error}
        />
      </main>
      
      {survey && (
        <aside className="survey-info">
          <h3>설문지 정보</h3>
          <p><strong>제목:</strong> {survey.title}</p>
          <p><strong>질문 수:</strong> {survey.questions.length}개</p>
          <p><strong>상태:</strong> {survey.status === 'draft' ? '임시저장' : '확정'}</p>
          <p><strong>생성일:</strong> {survey.createdAt.toLocaleDateString()}</p>
          <p><strong>수정일:</strong> {survey.updatedAt.toLocaleDateString()}</p>
        </aside>
      )}
    </div>
  );
}; 