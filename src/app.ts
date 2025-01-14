import express from 'express';
import bodyParser from 'body-parser';
import articleRoutes from './routes/articleRoutes';  
import commentRoutes from './routes/commentsRoutes';  
import userRoutes from './routes/userRoutes';
import pool from './db'; 

const app = express();

app.use(bodyParser.json());

app.use('/api', articleRoutes);  
app.use('/api', commentRoutes);  
app.use('/api', userRoutes)

pool.query('SELECT 1', (err, res) => {
  if (err) {
    console.error('Error querying the database:', err.message);
  } else {
    console.log('Database connected successfully!');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});