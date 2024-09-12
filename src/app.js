import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js';
import CharactersRouter from './routes/characters.router.js';
import ItemsRouter from './routes/items.router.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';

dotenv.config();

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter, CharactersRouter, ItemsRouter]);
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
  });