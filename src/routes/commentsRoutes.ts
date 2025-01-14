import express from 'express';
import { CommentController } from '../controllers/commentsController';

const router = express.Router();

router.post('/comments', CommentController.create);

router.get('/comments/article/:article_id', CommentController.getByArticle);

router.put('/comments/:id', CommentController.update);

router.delete('/comments/:id', CommentController.delete);

export default router;
