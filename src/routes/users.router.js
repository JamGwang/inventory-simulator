import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
    const { id, password } = req.body;
    const isExistUser = await prisma.users.findFirst({
        where: {
            id,
        },
    });

    if (isExistUser) {
        return res.status(409).json({ message: '이미 존재하는 ID입니다.' });
    }
    if (password.length < 6) {
        return res.status(409).json({ message: '비밀번호가 너무 짧습니다 6글자 이상부터 지정가능합니다.' });
    }

    const hashedPassword = await bcrypt.hash(password.toLowerCase(),10);

    // Users 테이블에 사용자를 추가합니다.
    const user = await prisma.users.create({
        data: { id, password : hashedPassword},
    });

    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
    const { id, password } = req.body;
    const user = await prisma.users.findFirst({ where: { id } });
  
    if (!user)
      return res.status(401).json({ message: '존재하지 않는 ID입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다. 비밀번호는 영문 소문자와 숫자로만 이루어져 있습니다.' });
  
    // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      process.env.SESSION_SECRET_KEY,
    );
  
    // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장합니다.
    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
  });

export default router;