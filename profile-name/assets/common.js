(() => {
  'use strict';

  const STORAGE_KEY = 'inhoTasteArchiveStateV3';
  const defaultState = {
    points: 0,
    visitedPages: [],
    quizCompleted: false,
    quizScore: null,
    savedContent: [],
    guestbookEntries: [],
    cinemaMode: false,
    rewarded: {
      quiz: false,
      guestbook: false
    }
  };

  const badgeDefinitions = [
    { id: 'first-step', icon: '🚪', title: '첫 방문', desc: '취향 상자에 처음 입장했습니다.', check: s => s.visitedPages.length >= 1 },
    { id: 'matcher', icon: '🎯', title: 'Taste Matcher', desc: '취향 싱크로율 테스트를 완료했습니다.', check: s => s.quizCompleted },
    { id: 'collector', icon: '📌', title: '취향 수집가', desc: '큐레이션 콘텐츠를 1개 이상 저장했습니다.', check: s => s.savedContent.length >= 1 },
    { id: 'curator', icon: '🏆', title: '큐레이션 마스터', desc: '큐레이션 콘텐츠를 3개 이상 저장했습니다.', check: s => s.savedContent.length >= 3 },
    { id: 'communicator', icon: '💬', title: '취향 공유자', desc: '방명록에 추천작을 남겼습니다.', check: s => s.guestbookEntries.length >= 1 }
  ];

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        ...defaultState,
        ...(parsed && typeof parsed === 'object' ? parsed : {}),
        rewarded: { ...defaultState.rewarded, ...(parsed?.rewarded || {}) },
        visitedPages: Array.isArray(parsed?.visitedPages) ? parsed.visitedPages : [],
        savedContent: Array.isArray(parsed?.savedContent) ? parsed.savedContent : [],
        guestbookEntries: Array.isArray(parsed?.guestbookEntries) ? parsed.guestbookEntries : []
      };
    } catch {
      return structuredClone(defaultState);
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateGlobalUI();
  }

  function updateState(mutator) {
    mutator(state);
    saveState();
    window.dispatchEvent(new CustomEvent('inho:statechange', { detail: getState() }));
  }

  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  function addPoints(amount) {
    state.points = Math.max(0, Number(state.points || 0) + Number(amount || 0));
  }

  function getCompletion() {
    const milestones = [
      state.visitedPages.includes('quiz'),
      state.quizCompleted,
      state.savedContent.length >= 1,
      state.guestbookEntries.length >= 1
    ];
    return Math.round((milestones.filter(Boolean).length / milestones.length) * 100);
  }

  function getLevel() {
    const p = state.points || 0;
    if (p >= 80) return 'Lv.4 취향 큐레이터';
    if (p >= 45) return 'Lv.3 감성 수집가';
    if (p >= 20) return 'Lv.2 취향 탐험가';
    return 'Lv.1 새로운 방문자';
  }

  function unlockedBadges() {
    return badgeDefinitions.filter(badge => badge.check(state));
  }

  function updateGlobalUI() {
    const completion = getCompletion();
    document.querySelectorAll('[data-points]').forEach(el => { el.textContent = state.points; });
    document.querySelectorAll('[data-level]').forEach(el => { el.textContent = getLevel(); });
    document.querySelectorAll('[data-completion]').forEach(el => { el.textContent = `${completion}%`; });
    document.querySelectorAll('[data-completion-bar]').forEach(el => { el.style.width = `${completion}%`; });
    document.querySelectorAll('[data-score-ring]').forEach(el => { el.style.setProperty('--progress', `${completion}%`); });
    document.querySelectorAll('[data-badge-count]').forEach(el => { el.textContent = unlockedBadges().length; });
    document.querySelectorAll('[data-saved-count]').forEach(el => { el.textContent = state.savedContent.length; });
    renderBadges();
  }

  function renderBadges() {
    document.querySelectorAll('[data-badge-grid]').forEach(grid => {
      grid.replaceChildren(...badgeDefinitions.map(badge => {
        const unlocked = badge.check(state);
        const card = document.createElement('article');
        card.className = `badge-card${unlocked ? ' unlocked' : ''}`;

        const icon = document.createElement('div');
        icon.className = 'badge-icon';
        icon.textContent = badge.icon;

        const body = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = badge.title;
        const desc = document.createElement('p');
        desc.textContent = unlocked ? badge.desc : '아직 잠겨 있습니다.';
        body.append(title, desc);
        card.append(icon, body);
        return card;
      }));
    });
  }

  let toastTimer;
  function showToast(title, message) {
    const toast = document.querySelector('[data-toast]');
    if (!toast) return;
    const strong = toast.querySelector('strong');
    const span = toast.querySelector('span');
    if (strong) strong.textContent = title;
    if (span) span.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2700);
  }

  function setupNavigation() {
    const currentPage = document.body.dataset.page;
    document.querySelectorAll(`[data-nav="${currentPage}"]`).forEach(link => {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });

    const button = document.querySelector('[data-mobile-menu-button]');
    const menu = document.querySelector('[data-mobile-nav]');
    if (button && menu) {
      button.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
        button.textContent = open ? '✕' : '☰';
      });
      menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        menu.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = '☰';
      }));
    }
  }

  function setupCinemaMode() {
    const button = document.querySelector('[data-cinema-toggle]');
    const icon = document.querySelector('[data-cinema-icon]');
    const apply = () => {
      document.body.classList.toggle('cinema-mode', state.cinemaMode);
      if (icon) icon.textContent = state.cinemaMode ? '☾' : '☀';
      if (button) button.setAttribute('aria-label', state.cinemaMode ? '기본 모드로 전환' : '시네마 모드로 전환');
    };
    apply();
    button?.addEventListener('click', () => {
      updateState(s => { s.cinemaMode = !s.cinemaMode; });
      apply();
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(el => observer.observe(el));
  }

  function registerVisit() {
    const page = document.body.dataset.page;
    if (!page || state.visitedPages.includes(page)) return;
    updateState(s => {
      s.visitedPages.push(page);
      addPoints(5);
    });
    showToast('+5 포인트', `${page === 'home' ? 'Intro' : page} 페이지를 처음 방문했습니다.`);
  }

  function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(defaultState);
    saveState();
    showToast('기록 초기화', '포인트와 활동 기록을 모두 초기화했습니다.');
    setTimeout(() => location.reload(), 500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupCinemaMode();
    setupReveal();
    updateGlobalUI();
    setTimeout(registerVisit, 250);
    document.querySelectorAll('[data-reset-progress]').forEach(btn => btn.addEventListener('click', resetProgress));
  });

  window.InhoApp = {
    getState,
    updateState,
    addPoints,
    saveState,
    showToast,
    getCompletion,
    getLevel,
    badgeDefinitions
  };
})();
