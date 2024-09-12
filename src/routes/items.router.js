import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

/** 아이템 생성 API **/
router.post('/create-item', async (req, res, next) => {
    const { item_name, item_stat, item_price } = req.body;

    const isExistItem = await prisma.items.findFirst({
        where: {
            item_name,
        },
    });

    if (isExistItem) {
        return res.status(409).json({ message: '이미 존재하는 아이템 입니다.' });
    }
    const item = await prisma.items.create({
        data: {
            item_name,
            item_stat: item_stat,
            item_price
        },
    });

    return res.status(201).json({ data: item });
});

/**아이템 수정 API**/
router.patch('/edit-item/:item_code', async (req, res, next) => {
    try {
        const { item_code } = req.params;
        const updatedData = req.body;

        const item = await prisma.items.findFirst({
            where: { item_code: +item_code },
        });

        await prisma.$transaction(
            async (tx) => {
                // 트랜잭션 내부에서 아이템 정보를 수정합니다.
                await tx.items.update({
                    data: {
                        ...updatedData,
                    },
                    where: {
                        item_code: item.item_code,
                    },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );

        return res.status(200).json({ message: '아이템 정보 변경에 성공하였습니다.' });
    } catch (err) {
        next(err);
    }
});


//**아이템 목록 조회 API**/
router.get('/items', async (req, res, next) => {
    const items = await prisma.items.findMany({
        select: {
            item_code: true,
            item_name: true,
            item_price: true,
        },
        orderBy: {
            item_code: 'desc'
        }
    });

    return res.status(200).json({ data: items });
});

//**아이템 상세 조회 API**/
router.get('/items/:item_code', async (req, res, next) => {
    const {item_code} = req.params;
    const items = await prisma.items.findMany({
        where: {
            item_code: +item_code
        },
        select: {
            item_code: true,
            item_name: true,
            item_stat: true,
            item_price: true,
        }
    });

    return res.status(200).json({ data: items });
});

export default router;