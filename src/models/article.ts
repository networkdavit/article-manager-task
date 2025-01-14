export class Article {
    id: number;
    title: string;
    content: string;
    author_id: number;
    created_at: string;
    updated_at: string;
  
    constructor(id: number, title: string, content: string, author_id: number, created_at: string, updated_at: string) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.author_id = author_id;
      this.created_at = created_at;
      this.updated_at = updated_at;
    }
  }
  