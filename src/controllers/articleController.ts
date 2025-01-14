import { Request, Response } from 'express';
import { ArticleDTO } from '../dtos/article.dto';
import { Article } from '../models/article'; 
import pool from '../db';

export class ArticleController {
  static async create(req: Request, res: Response) {
    const { title, content, author_id }: ArticleDTO = req.body;

    if (!title || !content || !author_id) {
      return res.status(400).json({ error: 'Title, content, and author_id are required' });
    }

    const checkAuthorQuery = 'SELECT * FROM users WHERE id = $1';
    try {
      const authorResult = await pool.query(checkAuthorQuery, [author_id]);

      if (authorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
      }

      const query = 'INSERT INTO articles (title, content, author_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *';

      const result = await pool.query(query, [title, content, author_id]);
      const newArticleRow = result.rows[0];

      const newArticle = new Article(
        newArticleRow.id,
        newArticleRow.title,
        newArticleRow.content,
        newArticleRow.author_id,
        newArticleRow.created_at,
        newArticleRow.updated_at
      );

      const articleDTO: ArticleDTO = {
        id: newArticle.id,
        title: newArticle.title,
        content: newArticle.content,
        author_id: newArticle.author_id,
        created_at: newArticle.created_at,
        updated_at: newArticle.updated_at,
      };

      return res.status(201).json(articleDTO);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error creating article:', err.message);
        return res.status(500).json({ error: 'Error creating article', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, content }: ArticleDTO = req.body;

    const query = 'UPDATE articles SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *';

    try {
      const result = await pool.query(query, [title, content, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const updatedArticle = result.rows[0];

      const articleDTO: ArticleDTO = {
        id: updatedArticle.id,
        title: updatedArticle.title,
        content: updatedArticle.content,
        author_id: updatedArticle.author_id,
        created_at: updatedArticle.created_at,
        updated_at: updatedArticle.updated_at,
      };

      return res.status(200).json(articleDTO);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error updating article:', err.message);
        return res.status(500).json({ error: 'Error updating article', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }

  static async findById(req: Request, res: Response) {
    const article_id = parseInt(req.params.id, 10);

    if (isNaN(article_id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }

    const query = 'SELECT * FROM articles WHERE id = $1';

    try {
      const result = await pool.query(query, [article_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const article = result.rows[0];
      return res.status(200).json({
        id: article.id,
        title: article.title,
        content: article.content,
        author_id: article.author_id,
        author_name: article.author_name,
        created_at: article.created_at,
        updated_at: article.updated_at,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error retrieving article:', err.message);
        return res.status(500).json({ error: 'Error retrieving article', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }

  static async findByAuthor(req: Request, res: Response) {
    const author_id = parseInt(req.params.author_id, 10);
    const page = parseInt(req.query.page as string, 10) || 1; 
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10; 
  
    const offset = (page - 1) * pageSize;
  
    const query = `
      SELECT articles.*, users.name AS author_name
      FROM articles
      JOIN users ON articles.author_id = users.id
      WHERE articles.author_id = $1
      LIMIT $2 OFFSET $3`;
  
    try {
      const result = await pool.query(query, [author_id, pageSize, offset]);
  
      const articles: ArticleDTO[] = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        author_id: row.author_id,
        author_name: row.author_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
  
      return res.status(200).json(articles);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error finding articles:', err.message);
        return res.status(500).json({ error: 'Error finding articles', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
  

  static async search(req: Request, res: Response) {
    const keyword = req.query.keyword as string || '';
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // Default to 10 articles per page
  
    const offset = (page - 1) * pageSize;
  
    const query = `
      SELECT articles.*, users.name AS author_name
      FROM articles
      JOIN users ON articles.author_id = users.id
      WHERE title ILIKE $1 OR content ILIKE $2
      LIMIT $3 OFFSET $4`;
  
    try {
      const result = await pool.query(query, [`%${keyword}%`, `%${keyword}%`, pageSize, offset]);
  
      const articles: ArticleDTO[] = result.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        author_id: row.author_id,
        author_name: row.author_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
  
      return res.status(200).json(articles);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error searching articles:', err.message);
        return res.status(500).json({ error: 'Error searching articles', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
  
  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    const query = 'DELETE FROM articles WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      return res.status(204).send();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error deleting article:', err.message);
        return res.status(500).json({ error: 'Error deleting article', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
}
