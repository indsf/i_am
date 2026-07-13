(() => {
  'use strict';

  const seedEntries = [
    { name: '미니멀리스트_K', recommend: 'ASH ISLAND - 멜로디', message: '양홍원 rose를 좋아했는데 큐레이션 보법이 남다르네요. 자주 들를게요!', createdAt: '2026-07-10T10:30:00.000Z' },
    { name: '취준러', recommend: '면접왕 이형 - 경험 분해', message: '커리어 인사이트를 보고 자소서를 다시 정리하는 중입니다. 같이 취뽀해요!', createdAt: '2026-07-09T15:10:00.000Z' },
    { name: '알고리즘유목민', recommend: '피식대학', message: 'B급 감성 영상 추천이 정말 시간 순삭이네요.', createdAt: '2026-07-08T18:20:00.000Z' }
  ];

  const form = document.querySelector('[data-guestbook-form]');
  const list = document.querySelector('[data-guestbook-list]');
  const count = document.querySelector('[data-guestbook-count]');

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '방금 전';
    return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function createEntry(entry) {
    const article = document.createElement('article');
    article.className = 'guest-entry';

    const head = document.createElement('div');
    head.className = 'guest-entry-head';
    const name = document.createElement('span');
    name.className = 'guest-entry-name';
    name.textContent = entry.name;
    const time = document.createElement('time');
    time.className = 'guest-entry-time';
    time.dateTime = entry.createdAt;
    time.textContent = formatDate(entry.createdAt);
    head.append(name, time);

    const message = document.createElement('p');
    message.className = 'guest-entry-message';
    message.textContent = entry.message;
    article.append(head, message);

    if (entry.recommend) {
      const recommendation = document.createElement('div');
      recommendation.className = 'guest-entry-recommend';
      recommendation.textContent = `추천작 · ${entry.recommend}`;
      article.append(recommendation);
    }
    return article;
  }

  function renderEntries() {
    const userEntries = InhoApp.getState().guestbookEntries;
    const entries = [...userEntries, ...seedEntries];
    list.replaceChildren(...entries.map(createEntry));
    count.textContent = entries.length;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const recommend = String(formData.get('recommend') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !message) {
      InhoApp.showToast('입력 확인', '닉네임과 메시지는 반드시 입력해야 합니다.');
      return;
    }

    const entry = { name, recommend, message, createdAt: new Date().toISOString() };
    InhoApp.updateState(state => {
      state.guestbookEntries.unshift(entry);
      if (!state.rewarded.guestbook) {
        InhoApp.addPoints(20);
        state.rewarded.guestbook = true;
      }
    });
    form.reset();
    renderEntries();
    InhoApp.showToast('방명록 등록 완료', '추천작이 저장되었고 20포인트를 획득했습니다.');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderEntries();
    form?.addEventListener('submit', handleSubmit);
    window.addEventListener('inho:statechange', renderEntries);
  });
})();
