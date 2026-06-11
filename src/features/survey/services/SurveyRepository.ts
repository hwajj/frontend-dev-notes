// Repository 패턴: 데이터 접근 계층
export interface SurveyData {
  id: string;
  title: string;
  questions: Question[];
  status: 'draft' | 'committed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'rating';
  options?: string[];
}

export class SurveyRepository {
  private storageKey = 'survey_data';
  
  // 임시 저장 데이터 조회
  async getDraft(): Promise<SurveyData | null> {
    try {
      const data = localStorage.getItem(`${this.storageKey}_draft`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get draft:', error);
      return null;
    }
  }
  
  // 임시 저장 데이터 저장
  async saveDraft(data: SurveyData): Promise<void> {
    try {
      localStorage.setItem(`${this.storageKey}_draft`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }
  
  // 확정된 데이터 조회
  async getCommitted(): Promise<SurveyData[]> {
    try {
      const data = localStorage.getItem(`${this.storageKey}_committed`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get committed:', error);
      return [];
    }
  }
  
  // 확정된 데이터 저장
  async saveCommitted(data: SurveyData): Promise<void> {
    try {
      const committed = await this.getCommitted();
      committed.push(data);
      localStorage.setItem(`${this.storageKey}_committed`, JSON.stringify(committed));
    } catch (error) {
      console.error('Failed to save committed:', error);
      throw error;
    }
  }
} 