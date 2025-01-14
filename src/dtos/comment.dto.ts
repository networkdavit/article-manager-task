export interface CommentDTO {
    id?: number; 
    article_id: number;
    author_id: number;
    content: string;
    created_at?: string;
    updated_at?: string;
  }
  