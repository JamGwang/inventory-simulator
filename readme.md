1. 데이터베이스 모델링
2. 프로잭트 초기화 및 개발환경 설정
3. API, 미들웨어 작성


1) 데이터 베이스 모델링
https://drawsql.app/teams/sparta-28/diagrams/inventory-simulator

계정 테이블 Users
사용자는 여러개의 캐릭터를 보유할 수 있음 ( Users : Characters = 1:N )

캐릭터 테이블 Charaters
하나의 캐릭터에 1개의 캐릭터 정보 (Characters : ChracterInfos = 1:1)

캐릭터 정보 테이블 CharacterInfos

--필수 기능 먼저 구현하기 위해 보류
아이템 테이블 Items

캐릭터-인벤토리 테이블 CharacterInventory
캐릭터의 인벤토리에는 여러개의 아이템이 있을 수 있음 
아이템은 여러 캐릭터의 인벤토리에 있을 수 있음 ( CharacterInventory : Items = N:M )

캐릭터-아이템 테이블 CharacterItem 
캐릭터의 장착아이템은 여러개일 수 있음
아이템은 여러 캐릭터가 장착하고 있을 수 있음 (CharacterItem : Items = N:M)

2) 개발환경
라이브러리 - express, prisma, @prisma/client, cookie-parser, jsonwebtoken, bcrypt, dotenv

3) API, 미들웨어 구현
 /routes/user.router.js
회원가입 API /api/sign-up
- id, password 를 body 로 전달받습니다.
- 동일한 id를 가진 사용자가 있는지 확인합니다. (동일한 id가 존재하거나, password의 길이가 6미만일 경우 status401 반환 후 메시지 출력)
- Users테이블에 id, password를 이용해 사용자를 생성합니다. (password.toLowerCase()로 소문자로 변환 후 bcrypt 암호화)

로그인 API /api/sign-in
- id, password 를 body 로 전달받습니다.
- 전달 받은 id에 해당하는 사용자가 있는지 확인합니다.
- 전달 받은 password와 데이터베이스의 저장된 password를 bcrypt를 이용하여 검증합니다.
- 로그인에 성공한다면, 사용자에게 JWT를 발급합니다.

사용자 인증 미들웨어 /middlewares/auth.middleware.js
- 클라이언트로 부터 쿠키를 전달받습니다.
- 쿠키가 Bearer 토큰 형식인지 확인합니다.
- 서버에서 발급한JWT가 맞는지 검증합니다.
- JWT의 userId를 이용해 사용자를 조회합니다.
- req.user에 조회된 사용자 정보를 할당합니다.
- 다음 미들웨어를 실행합니다.

에러 처리 미들웨어 /middlewares/error-handling.middleware.js
- 서버내부에서 에러발생 시 에러 메시지 전달

/routes/characters.router.js
캐릭터 생성 API /api/create-character
- 캐릭터를 생성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
- characterName 을 body로 전달받습니다.
- 동일한 케릭터 이름이 존재하는지 확인합니다.
- Characters 테이블에 characterName을 이용해서 캐릭터를 생성합니다.
- health, power, money 에 각 default값이 주어지고 이를 이용해
CharacterInfos 테이블에 캐릭터 정보를 생성합니다.

캐릭터 상세 조회 API /api/search-character/:characterId
- 사용자의 캐릭터인지 아닌지 구분하여 money 데이터 표시유무를 결정하고,
CharacterInfos테이블의 데이터를 반환합니다.

캐릭터 삭제 API /api/delete-character/:characterId
- 캐릭터를 삭제하려는 클라이언트가 로그인된 사용자인지 검증합니다.
- characterId를 기준으로 검색하고, 캐릭터가 존재하는지 확인합니다.
- 사용자의 캐릭터인지 확인하고, 맞다면 캐릭터를 삭제합니다.

/routes/items.router.js

아이템 생성API /api/create-item
- item_name, item_stat, item_price 를 body로 전달 받습니다.
- 동일한 item_name이 존재하는지 확인합니다
- items 테이블에 아이템을 생성합니다.

아이템 수정API /api/edit-item/:item_code
- 수정할 아이템의 item_code를 url파라미터로 받고 수정할 정보들을 body로 전달 받습니다.
- 해당 아이템의 내용을 수정합니다.

아이템 목록조회 API /api/items
- 모든 아이템의 내용을 출력하되, item_stat을 제외하고 출력합니다

아이템 상세조회 API /api/items/:item_code
- item_code를 파라미터로 받아 해당 item_code의 아이템 내용을 출력합니다.

EC2배포
도메인: spartatest7570.shop



