export class Comment {
    id: number;
    article_id: number;
    author_id: number;
    content: string;
    created_at: string;
    updated_at?: string;  
  
    constructor(
      id: number, 
      article_id: number, 
      author_id: number, 
      content: string, 
      created_at: string,
      updated_at?: string 
    ) {
      this.id = id;
      this.article_id = article_id;
      this.author_id = author_id;
      this.content = content;
      this.created_at = created_at;
      this.updated_at = updated_at;  
    }
  }
  