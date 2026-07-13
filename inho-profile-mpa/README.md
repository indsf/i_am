# INHO Taste Archive

## 구조

전체 사이트는 4개의 HTML 파일로 이동하는 MPA입니다.

- `index.html`: 소개 및 전체 진행 현황
- `quiz.html`: 같은 페이지 안에서 질문 1 → 질문 2 → 질문 3 → 결과로 전환
- `curation.html`: 같은 페이지 안에서 전체·음악·유튜브·취준 탭 필터 전환
- `guestbook.html`: 같은 페이지 안에서 방명록 등록 및 목록 갱신

각 페이지 내부 상호작용은 Vanilla JavaScript로 처리하는 SPA 방식입니다.

## 실행

VS Code에서 폴더를 연 뒤 `index.html`을 Live Server로 실행합니다.

## Git 관리 예시

```bash
git init
git add .
git commit -m "feat: 4-page MPA structure"

git add quiz.html assets/quiz.js
git commit -m "feat: add SPA-style taste matcher"

git add curation.html assets/curation.js
git commit -m "feat: add curation filters and save actions"

git add guestbook.html assets/guestbook.js
git commit -m "feat: add persistent guestbook"
```

## 확인 항목

- 상단 네비게이션이 실제 HTML 파일로 이동하는가
- 현재 페이지 메뉴에 활성 표시가 적용되는가
- 퀴즈 선택 시 다음 문제로 넘어가는가
- 세 번째 문항 후 평균 점수가 표시되는가
- 큐레이션 탭 클릭 시 카드가 필터링되는가
- 저장한 콘텐츠가 페이지 이동 후에도 유지되는가
- 방명록이 새로고침 후에도 유지되는가
- 모바일에서 햄버거 메뉴와 1열 카드가 정상 동작하는가
