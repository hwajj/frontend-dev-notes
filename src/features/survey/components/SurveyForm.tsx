// Presenter 컴포넌트: props 기반 렌더링, 상태 없음
import React from 'react';
import { SurveyData, Question } from '../services/SurveyRepository';

interface SurveyFormProps {
  survey: SurveyData | null;
  onTitleChange: (title: string) => void;
  onAddQuestion: (question: Omit<Question, 'id'>) => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onCommit: () => void;
  loading?: boolean;
  error?: string | null;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  survey,
  onTitleChange,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onCommit,
  loading = false,
  error = null
}) => {
  const [newQuestionText, setNewQuestionText] = React.useState('');
  const [newQuestionType, setNewQuestionType] = React.useState<Question['type']>('text');
  
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    
    const question: Omit<Question, 'id'> = {
      text: newQuestionText.trim(),
      type: newQuestionType
    };
    
    onAddQuestion(question);
    setNewQuestionText('');
  };
  
  const handleQuestionUpdate = (questionId: string, field: keyof Question, value: any) => {
    onUpdateQuestion(questionId, { [field]: value });
  };
  
  if (!survey) {
    return (
      <div className="survey-form">
        <h2>새 설문지 생성</h2>
        <button 
          onClick={() => onTitleChange('새 설문지')}
          disabled={loading}
          className="btn btn-primary"
        >
          설문지 시작하기
        </button>
      </div>
    );
  }
  
  return (
    <div className="survey-form">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="survey-title">설문지 제목</label>
        <input
          id="survey-title"
          type="text"
          value={survey.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="설문지 제목을 입력하세요"
          className="form-control"
        />
      </div>
      
      <div className="questions-section">
        <h3>질문 목록</h3>
        
        {survey.questions.map((question, index) => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <span className="question-number">Q{index + 1}</span>
              <button
                onClick={() => onDeleteQuestion(question.id)}
                className="btn btn-danger btn-sm"
              >
                삭제
              </button>
            </div>
            
            <input
              type="text"
              value={question.text}
              onChange={(e) => handleQuestionUpdate(question.id, 'text', e.target.value)}
              placeholder="질문을 입력하세요"
              className="form-control"
            />
            
            <select
              value={question.type}
              onChange={(e) => handleQuestionUpdate(question.id, 'type', e.target.value)}
              className="form-control"
            >
              <option value="text">텍스트</option>
              <option value="multiple-choice">객관식</option>
              <option value="rating">평점</option>
            </select>
          </div>
        ))}
        
        <div className="add-question">
          <h4>새 질문 추가</h4>
          <div className="input-group">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="질문을 입력하세요"
              className="form-control"
            />
            <select
              value={newQuestionType}
              onChange={(e) => setNewQuestionType(e.target.value as Question['type'])}
              className="form-control"
            >
              <option value="text">텍스트</option>
              <option value="multiple-choice">객관식</option>
              <option value="rating">평점</option>
            </select>
            <button
              onClick={handleAddQuestion}
              disabled={!newQuestionText.trim() || loading}
              className="btn btn-secondary"
            >
              질문 추가
            </button>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button
          onClick={onCommit}
          disabled={loading || survey.questions.length === 0}
          className="btn btn-success"
        >
          {loading ? '저장 중...' : '설문지 확정'}
        </button>
      </div>
    </div>
  );
}; 