(() => {
  'use strict';

  const quizData = [
    {
      question: '나의 새벽 감성을 촉촉하게 적셔줄 최애 장르는?',
      options: [
        { text: '밤안개 같은 보이스와 감성 짙은 R&B·힙합', score: 100 },
        { text: '어쿠스틱 감성이 가득한 잔잔한 인디 발라드', score: 72 },
        { text: '드라이브하며 듣기 좋은 청량한 밴드 사운드', score: 54 }
      ]
    },
    {
      question: '유튜브 알고리즘에서 가장 오래 머무는 콘텐츠는?',
      options: [
        { text: 'B급 자막 감성과 날것 그대로의 크리에이터 케미', score: 100 },
        { text: '커리어 방향을 잡아주는 현실적인 취업 인사이트', score: 86 },
        { text: '짧고 가볍게 웃을 수 있는 단순 유머 클립', score: 61 }
      ]
    },
    {
      question: '영화나 시리즈를 인생작으로 고르는 기준은?',
      options: [
        { text: '긴 여운을 남기는 섬세한 연출과 세련된 미장센', score: 100 },
        { text: '머리를 비우고 몰입할 수 있는 빠른 액션과 스릴러', score: 76 },
        { text: '친구들과 편하게 즐길 수 있는 유쾌한 팝콘 무비', score: 60 }
      ]
    }
  ];

  let currentIndex = 0;
  let totalScore = 0;
  let locked = false;

  const stepEl = document.querySelector('[data-quiz-step]');
  const percentEl = document.querySelector('[data-quiz-percent]');
  const barEl = document.querySelector('[data-quiz-bar]');
  const questionEl = document.querySelector('[data-quiz-question]');
  const optionsEl = document.querySelector('[data-quiz-options]');
  const questionView = document.querySelector('[data-question-view]');
  const resultView = document.querySelector('[data-result-view]');

  function renderQuestion() {
    const item = quizData[currentIndex];
    const progress = Math.round(((currentIndex + 1) / quizData.length) * 100);

    stepEl.textContent = `Question ${String(currentIndex + 1).padStart(2, '0')} of ${String(quizData.length).padStart(2, '0')}`;
    percentEl.textContent = `${progress}%`;
    barEl.style.width = `${progress}%`;
    questionEl.textContent = item.question;
    questionView.classList.remove('quiz-view');
    void questionView.offsetWidth;
    questionView.classList.add('quiz-view');

    optionsEl.replaceChildren(...item.options.map(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.setAttribute('aria-label', option.text);

      const text = document.createElement('span');
      text.textContent = option.text;
      const check = document.createElement('span');
      check.className = 'option-check';
      check.textContent = '✓';
      button.append(text, check);
      button.addEventListener('click', () => selectOption(button, option.score));
      return button;
    }));
  }

  function selectOption(selectedButton, score) {
    if (locked) return;
    locked = true;
    totalScore += score;
    optionsEl.querySelectorAll('button').forEach(btn => { btn.disabled = true; });
    selectedButton.classList.add('selected');

    setTimeout(() => {
      if (currentIndex < quizData.length - 1) {
        currentIndex += 1;
        locked = false;
        renderQuestion();
      } else {
        showResult();
      }
    }, 420);
  }

  function showResult() {
    const finalScore = Math.round(totalScore / quizData.length);
    questionView.classList.add('hidden');
    resultView.classList.remove('hidden');
    resultView.classList.add('quiz-view');

    const ring = document.querySelector('[data-result-ring]');
    const score = document.querySelector('[data-result-score]');
    const title = document.querySelector('[data-result-title]');
    const copy = document.querySelector('[data-result-copy]');
    ring.style.setProperty('--score', `${finalScore}%`);
    score.textContent = `${finalScore}%`;

    if (finalScore >= 90) {
      title.textContent = '영혼의 취향 쌍둥이 💥';
      copy.textContent = `싱크로율 ${finalScore}%! 새벽 감성 음악부터 B급 예능, 섬세한 연출 취향까지 거의 완벽하게 일치합니다.`;
    } else if (finalScore >= 75) {
      title.textContent = '감성 충만한 취향 동반자 🎧';
      copy.textContent = `싱크로율 ${finalScore}%! 인호의 음악과 영상 큐레이션을 자연스럽게 즐길 수 있는 높은 일치율입니다.`;
    } else {
      title.textContent = '새로운 세계를 만난 탐험가 🗺️';
      copy.textContent = `싱크로율 ${finalScore}%! 지금까지와 다른 콘텐츠를 발견하며 새로운 취향 지도를 넓혀볼 단계입니다.`;
    }

    InhoApp.updateState(state => {
      state.quizScore = finalScore;
      state.quizCompleted = true;
      if (!state.rewarded.quiz) {
        InhoApp.addPoints(30);
        state.rewarded.quiz = true;
      }
    });
    InhoApp.showToast('Taste Matcher 완료', '결과가 저장되었고 30포인트를 획득했습니다.');
  }

  function restart() {
    currentIndex = 0;
    totalScore = 0;
    locked = false;
    resultView.classList.add('hidden');
    questionView.classList.remove('hidden');
    renderQuestion();
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderQuestion();
    document.querySelector('[data-restart-quiz]')?.addEventListener('click', restart);
  });
})();
