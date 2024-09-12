import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**캐릭터 생성 API**/
router.post('/create-character', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const { characterName } = req.body;
    const isExistCharacter = await prisma.characters.findFirst({
        where: {
            characterName,
        },
    });

    if (isExistCharacter) {
        return res.status(409).json({ message: '이미 존재하는 캐릭터명 입니다.' });
    }
    // Characters 테이블에 사용자를 추가합니다.
    const character = await prisma.characters.create({
        data: {
            userId: +userId,
            characterName
        },
    });
    // CharacterInfos 테이블에 사용자 정보를 추가합니다.
    const characterInfo = await prisma.characterInfos.create({
        data: {
            characterId: character.characterId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
        }
    });

    return res.status(201).json({ message: character });
});

/** 캐릭터 조회 API **/
router.get('/search-character/:characterId', authMiddleware, async (req, res, next) => {
    const { characterId } = req.params;
    const { userId } = req.user;

    const character = await prisma.characters.findFirst({
        where: { characterId: +characterId },
    });

    if (!character)
        return res.status(404).json({ massage: '캐릭터가 존재하지 않습니다.' });

    if (userId === character.userId) {
        const characterInfo = await prisma.characters.findFirst({
            where: { characterId: +characterId },
            select: {
                characterName: true,
                characterInfos: {
                    select: {
                        health: true,
                        power: true,
                        money: true
                    }
                }
            },
        });

        return res.status(200).json({ data: characterInfo });
    } else {
        const characterInfo = await prisma.characters.findFirst({
            where: { characterId: +characterId },
            select: {
                characterName: true,
                characterInfos: {
                    select: {
                        health: true,
                        power: true,
                    }
                }
            },
        });
        return res.status(200).json({ data: characterInfo });
    }
});

/**캐릭터 삭제 API**/
router.delete('/delete-character/:characterId', authMiddleware, async (req, res, next) => {
    const { characterId } = req.params;
    const { userId } = req.user;

    const character = await prisma.characters.findFirst({ where: { characterId: +characterId } });

    if (!character)
        return res.status(404).json({ message: '존재하지 않는 캐릭터 입니다.' });
    else if (character.userId !== userId)
        return res.status(401).json({ message: '해당 캐릭터의 삭제 권한이 없습니다.' });

    await prisma.characters.delete({ where: { characterId: +characterId } });

    return res.status(200).json({ data: `${character.characterName}(이)가 삭제되었습니다.` });
});

export default router;