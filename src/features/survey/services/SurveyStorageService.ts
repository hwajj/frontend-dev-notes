// Facade 패턴: 복잡한 의존성을 단순한 인터페이스로 추상화
import { SurveyRepository, SurveyData } from './SurveyRepository';

export class SurveyStorageService {
  private repository: SurveyRepository;
  
  constructor() {
    this.repository = new SurveyRepository();
  }
  
  // 설문지 임시 저장
  async saveSurveyDraft(survey: Omit<SurveyData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const surveyData: SurveyData = {
      ...survey,
      id,
      createdAt: now,
      updatedAt: now,
      status: 'draft'
    };
    
    await this.repository.saveDraft(surveyData);
    return id;
  }
  
  // 설문지 임시 데이터 조회
  async getSurveyDraft(): Promise<SurveyData | null> {
    return await this.repository.getDraft();
  }
  
  // 설문지 확정 저장
  async commitSurvey(surveyId: string): Promise<void> {
    const draft = await this.repository.getDraft();
    if (!draft || draft.id !== surveyId) {
      throw new Error('Draft not found');
    }
    
    const committedSurvey: SurveyData = {
      ...draft,
      status: 'committed',
      updatedAt: new Date()
    };
    
    await this.repository.saveCommitted(committedSurvey);
    await this.repository.saveDraft(null); // 임시 데이터 삭제
  }
  
  // 확정된 설문지 목록 조회
  async getCommittedSurveys(): Promise<SurveyData[]> {
    return await this.repository.getCommitted();
  }
  
  // 설문지 업데이트
  async updateSurveyDraft(updates: Partial<SurveyData>): Promise<void> {
    const draft = await this.repository.getDraft();
    if (!draft) {
      throw new Error('No draft to update');
    }
    
    const updatedDraft: SurveyData = {
      ...draft,
      ...updates,
      updatedAt: new Date()
    };
    
    await this.repository.saveDraft(updatedDraft);
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 