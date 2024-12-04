import express from 'express';
import 'dotenv/config';
import router  from './routes/index.js';

const app = express();
app.use(express.json());
app.use(router);

app.listen(3001, () => {
  console.log('🚀 Server is running on port 3001');
});