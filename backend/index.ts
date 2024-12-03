import express from 'express';
import { config } from 'dotenv';
import router  from './routes/index.js';

config();
const app = express();
app.use(express.json());
app.use(router);

app.listen(3001, () => {
  console.log('🚀 Server is running on port 3001');
});