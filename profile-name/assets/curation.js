(() => {
  'use strict';

  const tabs = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-curation-card]')];
  const modal = document.querySelector('[data-curation-modal]');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalCopy = document.querySelector('[data-modal-copy]');
  const modalMedia = document.querySelector('[data-modal-media]');

  function filterCards(category) {
    tabs.forEach(tab => {
      const active = tab.dataset.filter === category;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    cards.forEach(card => {
      const visible = category === 'all' || card.dataset.category === category;
      card.classList.toggle('hidden', !visible);
    });
  }

  function syncSavedButtons() {
    const saved = InhoApp.getState().savedContent;
    document.querySelectorAll('[data-save-content]').forEach(button => {
      const isSaved = saved.includes(button.dataset.saveContent);
      button.classList.toggle('saved', isSaved);
      button.textContent = isSaved ? '✓' : '＋';
      button.setAttribute('aria-label', isSaved ? '저장 취소' : '콘텐츠 저장');
      button.title = isSaved ? '저장 취소' : '콘텐츠 저장';
    });
  }

  function toggleSave(button) {
    const id = button.dataset.saveContent;
    const wasSaved = InhoApp.getState().savedContent.includes(id);
    InhoApp.updateState(state => {
      if (wasSaved) {
        state.savedContent = state.savedContent.filter(item => item !== id);
      } else {
        state.savedContent.push(id);
        InhoApp.addPoints(10);
      }
    });
    syncSavedButtons();
    InhoApp.showToast(wasSaved ? '저장 취소' : '+10 포인트', wasSaved ? '저장 목록에서 제거했습니다.' : '취향 상자에 콘텐츠를 저장했습니다.');
  }

  function openModal(button) {
    const card = button.closest('[data-curation-card]');
    const title = card.dataset.title;
    const description = card.dataset.description;
    const youtubeId = card.dataset.youtubeId;
    modalTitle.textContent = title;
    modalCopy.textContent = description;
    modalMedia.replaceChildren();

    if (youtubeId) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`;
      iframe.title = `${title} YouTube 영상`;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      modalMedia.appendChild(iframe);
      modalMedia.classList.remove('hidden');
    } else {
      modalMedia.classList.add('hidden');
    }

    modal.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    modalMedia.replaceChildren();
  }

  document.addEventListener('DOMContentLoaded', () => {
    tabs.forEach(tab => tab.addEventListener('click', () => filterCards(tab.dataset.filter)));
    document.querySelectorAll('[data-save-content]').forEach(button => button.addEventListener('click', () => toggleSave(button)));
    document.querySelectorAll('[data-open-content]').forEach(button => button.addEventListener('click', () => openModal(button)));
    document.querySelectorAll('[data-modal-close]').forEach(button => button.addEventListener('click', closeModal));
    modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
    window.addEventListener('inho:statechange', syncSavedButtons);
    syncSavedButtons();
    filterCards('all');
  });
})();
