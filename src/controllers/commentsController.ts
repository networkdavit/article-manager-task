import { Request, Response } from 'express';
import { CommentDTO } from '../dtos/comment.dto';
import { Comment } from '../models/comment';
import pool from '../db';  

export class CommentController {
  static async create(req: Request, res: Response) {
    const { article_id, author_id, content }: CommentDTO = req.body;

    if (!article_id || !author_id || !content) {
      return res.status(400).json({ error: 'Article ID, Author ID, and Content are required' });
    }

    const checkArticleQuery = 'SELECT * FROM articles WHERE id = $1';
    try {
      const articleResult = await pool.query(checkArticleQuery, [article_id]);
      if (articleResult.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const query = 'INSERT INTO comments (article_id, author_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *';
      const result = await pool.query(query, [article_id, author_id, content]);
      const newCommentRow = result.rows[0];

      const newComment = new Comment(
        newCommentRow.id,
        newCommentRow.article_id,
        newCommentRow.author_id,
        newCommentRow.content,
        newCommentRow.created_at
      );

      const commentDTO: CommentDTO = {
        id: newComment.id,
        article_id: newComment.article_id,
        author_id: newComment.author_id,
        content: newComment.content,
        created_at: newComment.created_at
      };

      return res.status(201).json(commentDTO);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error creating comment:', err.message);
        return res.status(500).json({ error: 'Error creating comment', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }

  static async getByArticle(req: Request, res: Response) {
    const article_id = parseInt(req.params.article_id, 10);
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const offset = (page - 1) * pageSize;
  
    if (isNaN(article_id)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
  
    const query = `
      SELECT * FROM comments 
      WHERE article_id = $1 
      LIMIT $2 OFFSET $3
    `;
  
    try {
      const result = await pool.query(query, [article_id, pageSize, offset]);
  
      const comments: CommentDTO[] = result.rows.map((row: { id: number, article_id: number, author_id: number, content: string, created_at: string }) => ({
        id: row.id,
        article_id: row.article_id,
        author_id: row.author_id,
        content: row.content,
        created_at: row.created_at,
      }));
  
      return res.status(200).json(comments);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error retrieving comments:', err.message);
        return res.status(500).json({ error: 'Error retrieving comments', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
  

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { content }: CommentDTO = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required to update comment' });
    }

    const query = 'UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *';

    try {
      const result = await pool.query(query, [content, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const updatedComment = result.rows[0];

      const commentDTO: CommentDTO = {
        id: updatedComment.id,
        article_id: updatedComment.article_id,
        author_id: updatedComment.author_id,
        content: updatedComment.content,
        created_at: updatedComment.created_at,
        updated_at: updatedComment.updated_at,
      };

      return res.status(200).json(commentDTO);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error updating comment:', err.message);
        return res.status(500).json({ error: 'Error updating comment', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      return res.status(204).send();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error deleting comment:', err.message);
        return res.status(500).json({ error: 'Error deleting comment', details: err.message });
      } else {
        console.error('Unknown error occurred');
        return res.status(500).json({ error: 'Unknown error occurred' });
      }
    }
  }
}
