import express from 'express';
import { ArticleController } from '../controllers/articleController';
import { authenticate } from '../middleware/authMiddleware'; 

const router = express.Router();

router.post('/articles',authenticate, ArticleController.create);
router.get('/articles/author/:author_id', ArticleController.findByAuthor);
router.get('/articles/:id', ArticleController.findById);
router.get('/articles/search', ArticleController.search);
router.put('/articles/:id', ArticleController.update);
router.delete('/articles/:id', ArticleController.delete);

export default router;
