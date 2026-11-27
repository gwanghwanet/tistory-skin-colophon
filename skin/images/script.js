/* Colophon — Tistory skin script (MIT) · https://github.com/gwanghwanet/tistory-skin-colophon */
/* ---------- 스킨 설정 (#colophon-cfg: 스킨 옵션 + 빌드 때 넣은 프리셋). 아래 두 블록이 함께 쓴다 ---------- */
var COLOPHON = (function () {
  var el = document.getElementById('colophon-cfg'), p = {};
  if (el) { try { p = JSON.parse(el.getAttribute('data-preset') || '{}') || {}; } catch (e) { p = {}; } }
  return {
    masthead: (el && el.getAttribute('data-masthead')) || p.mastheadText || '',
    techStack: p.techStack || '',
    esc: function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  };
})();
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var isPermalink = body.id === 'tt-body-page';

  /* ---------- 1. 테마 전환 ---------- */
  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('ghn-theme', mode); } catch (e) {}
  }
  $$('.theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  });

  /* ---------- 2. 카테고리 드로어 ---------- */
  var drawer = $('.drawer'), backdrop = $('.drawer-backdrop'), menuBtn = $('.menu-toggle');
  function openDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (backdrop) backdrop.hidden = !open;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.classList.toggle('drawer-open', open);
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { openDrawer(true); });
  if (backdrop) backdrop.addEventListener('click', function () { openDrawer(false); });
  var closeBtn = $('.drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', function () { openDrawer(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') openDrawer(false); });

  /* ---------- 3. 카테고리: 빈 카테고리 숨김 + 현재 위치 표시 ---------- */
  function countOf(a) {
    var c = a && a.querySelector('.c_cnt');
    if (!c) return -1;
    var n = parseInt(c.textContent.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? -1 : n;
  }
  var path = decodeURIComponent(location.pathname).replace(/\/$/, '');
  $$('.category-tree li').forEach(function (li) {
    var a = li.querySelector(':scope > a');
    if (!a) return;
    var own = countOf(a);
    var hasChildPosts = $$('a', li).some(function (x) { return x !== a && countOf(x) > 0; });
    if (own === 0 && !hasChildPosts) li.classList.add('is-empty');
    var href = decodeURIComponent(a.getAttribute('href') || '').replace(/\/$/, '');
    if (href && href !== '/category' && path === href) a.classList.add('is-current');
  });

  /* ---------- 4. 홈: 히어로 카테고리 칩 + 대표 글 ---------- */
  var page = parseInt(new URLSearchParams(location.search).get('page') || '1', 10);
  if (body.id === 'tt-body-index') {
    var hero = $('.hero');
    if (page > 1 && hero) hero.classList.add('is-hidden');

    var chips = $('[data-hero-cats]');
    var firstTree = $('.sidebar .category-tree') || $('.category-tree');
    if (chips && firstTree) {
      $$('.link_sub_item, .link_item', firstTree).forEach(function (a) {
        var n = countOf(a);
        if (n <= 0) return;
        var isParentWithKids = a.classList.contains('link_item') && a.parentNode.querySelector('.sub_category_list');
        if (isParentWithKids) return; // 하위 카테고리를 대신 노출
        var label = a.cloneNode(true);
        var cnt = label.querySelector('.c_cnt'); if (cnt) cnt.remove();
        $$('img', label).forEach(function (i) { i.remove(); });
        var chip = doc.createElement('a');
        chip.href = a.getAttribute('href');
        chip.innerHTML = '<span></span><b></b>';
        chip.firstChild.textContent = label.textContent.trim();
        chip.lastChild.textContent = n;
        chips.appendChild(chip);
      });
    }

    var cards = $$('.content > .post-card:not(.is-notice)');
    if (page <= 1 && cards.length > 2 && cards[0].querySelector('.pc-thumb')) {
      cards[0].classList.add('is-featured');
      var label2 = doc.createElement('p');
      label2.className = 'section-label';
      label2.textContent = 'LATEST POSTS';
      cards[1].parentNode.insertBefore(label2, cards[1]);
    }
  }

  /* ---------- 푸터 연도 (올해로 자동 갱신) ---------- */
  $$('.sb-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 4-0. 기술 스택 칩 ---------- */
  $$('.stack-chips').forEach(function (box) {
    (box.getAttribute('data-stack') || COLOPHON.techStack).split(',').forEach(function (t) {
      t = t.trim();
      if (!t) return;
      var chip = doc.createElement('span');
      chip.textContent = t;
      box.appendChild(chip);
    });
  });

  /* ---------- 4-1. 카테고리별 파스텔 톤 ---------- */
  function toneOf(name) {
    var key = (name || '').split('/').pop().replace(/\(\d+\)/, '').trim().toLowerCase();
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return (h % 5) + 1;
  }
  $$('.pc-cat, .post-cat a, .hero-cats a').forEach(function (el) {
    if (el.querySelector('.badge')) return;
    var span = el.querySelector('span');
    var name = span ? span.textContent : el.textContent;
    if (name.trim()) el.setAttribute('data-tone', toneOf(name));
  });

  /* ---------- 5. 본문 처리 ---------- */
  /* 실행은 파일 하단에서 (아래 상수 정의 이후) */

  function enhanceTables(scope) {
    $$('table', scope).forEach(function (t) {
      if (t.closest('.another_category') || t.parentNode.classList.contains('table-wrap')) return;
      var wrap = doc.createElement('div');
      wrap.className = 'table-wrap';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });
  }

  /* 티스토리 에디터의 자동 언어 감지 오류(axapta, routeros, arduino 등)를 보정 */
  var LANG_ALIAS = {
    js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', zsh: 'bash', yml: 'yaml',
    html: 'xml', kt: 'kotlin', py: 'python', text: 'plaintext', txt: 'plaintext', console: 'bash'
  };
  var TRUSTED = ['java', 'kotlin', 'javascript', 'typescript', 'python', 'bash', 'sql', 'json', 'yaml',
    'xml', 'css', 'scss', 'go', 'rust', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'ini',
    'diff', 'markdown', 'plaintext', 'dockerfile', 'gradle', 'properties', 'groovy', 'powershell'];
  var AUTO_SUBSET = ['java', 'kotlin', 'sql', 'json', 'yaml', 'xml', 'bash', 'javascript',
    'typescript', 'python', 'ini', 'css', 'go', 'plaintext'];
  var LABEL = { javascript: 'JavaScript', typescript: 'TypeScript', plaintext: 'Text', cpp: 'C++', csharp: 'C#', xml: 'HTML/XML', bash: 'Shell', ini: 'Properties', powershell: 'PowerShell' };

  function pickLang(pre, code) {
    var cands = [pre.getAttribute('data-ke-language')]
      .concat((code.className || '').split(/\s+/).map(function (c) { return c.replace(/^language-|^lang-/, ''); }))
      .concat((pre.className || '').split(/\s+/).map(function (c) { return c.replace(/^language-|^lang-/, ''); }));   // 원고는 <pre class="language-…">에 언어를 적는다
    for (var i = 0; i < cands.length; i++) {
      var c = (cands[i] || '').toLowerCase();
      c = LANG_ALIAS[c] || c;
      if (TRUSTED.indexOf(c) > -1) return c;
    }
    return null;
  }

  /* 언어 표시가 없거나 믿을 수 없을 때: 텍스트 다이어그램 → Java 단서 → 자동 감지 순서로 판단 */
  function isDiagram(raw) {
    var lines = raw.split('\n').filter(function (l) { return l.trim(); });
    if (!lines.length) return true;
    var codeLike = lines.filter(function (l) { return /[;{}]\s*(\/\/.*)?$/.test(l) || /^\s*(import|package|return|if|for|while)\b/.test(l); }).length;
    var drawing = lines.filter(function (l) {
      return /[│├└┌┐┘┬┴┼▼▲▶◀→←↓↑─═]/.test(l) || /\+[-=]{2,}|[-=]{3,}\+|-{2,}>|<-{2,}/.test(l) || /^\s*\|.*\|\s*$/.test(l) || /^\s*\[[^\]]+\]/.test(l);
    }).length;
    return drawing > 0 && codeLike / lines.length < 0.3;
  }
  function looksJava(raw) {
    return /\b(public|private|protected)\s+(static\s+)?(final\s+)?(abstract\s+)?(class|interface|enum|record|void|[A-Z]\w*)/.test(raw) ||
      /\bSystem\.(out|err)\.print/.test(raw) ||
      (/\b(String|int|long|boolean|double|List<|Map<|var)\s+\w+\s*=/.test(raw) && /;\s*(\/\/.*)?$/m.test(raw) && !/\b(function|const|let|console\.)\b|=>/.test(raw)) ||
      /@(Override|Autowired|Service|Controller|RestController|Repository|Component|Transactional|Entity|Getter|Setter)\b/.test(raw);
  }
  function guessLang(raw) {
    if (isDiagram(raw)) return 'plaintext';
    if (looksJava(raw)) return 'java';
    return 'auto';
  }
  function refineAuto(raw, detected) {
    if (!detected) return 'plaintext';
    if ((detected === 'javascript' || detected === 'typescript') && !/\b(function|const|let|console\.|import\s+.*from)\b|=>/.test(raw)) return 'java';
    if (detected === 'sql' && !/\b(select|insert|update|delete|create|alter|drop)\b/i.test(raw)) return 'plaintext';
    return detected;
  }

  function enhanceCode(scope) {
    var hljs = window.hljs;
    $$('pre', scope).forEach(function (pre) {
      if (pre.closest('.code-block')) return;
      var code = pre.querySelector('code');
      if (!code) {
        code = doc.createElement('code');
        while (pre.firstChild) code.appendChild(pre.firstChild);
        pre.appendChild(code);
      }
      pre.removeAttribute('style');
      var raw = code.textContent.replace(/\n$/, '');
      var lang = pickLang(pre, code);

      if (!lang) lang = guessLang(raw);

      if (hljs) {
        try {
          var res = null;
          if (lang === 'auto') {
            res = hljs.highlightAuto(raw, AUTO_SUBSET.filter(function (l) { return hljs.getLanguage(l); }));
            lang = refineAuto(raw, res.relevance >= 5 ? res.language : null);
            if (lang !== res.language) res = null;
          }
          if (!res && lang !== 'plaintext' && hljs.getLanguage(lang)) {
            res = hljs.highlight(raw, { language: lang, ignoreIllegals: true });
          }
          if (res) { code.innerHTML = res.value; code.classList.add('hljs'); }
        } catch (e) { /* 하이라이트 실패 시 원문 유지 */ }
      }
      if (!lang || lang === 'auto') lang = 'plaintext';

      // 티스토리가 나중에 자체 highlight.js로 다시 칠할 때도 같은 언어를 쓰도록 표시
      code.className = code.className.replace(/\blanguage-\S+|\bnohighlight\b/g, '').trim();
      code.classList.add(lang === 'plaintext' ? 'nohighlight' : 'language-' + lang);
      pre.className = '';

      var block = doc.createElement('div');
      block.className = 'code-block';
      block.innerHTML =
        '<div class="code-head"><span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="lang"></span></span>' +
        '<button type="button" class="code-copy" aria-label="코드 복사">복사</button></div>';
      block.querySelector('.lang').textContent = LABEL[lang] || lang;
      pre.parentNode.insertBefore(block, pre);
      block.appendChild(pre);

      block.querySelector('.code-copy').addEventListener('click', function () {
        var btn = this;
        var done = function () {
          btn.textContent = '복사됨 ✓'; btn.classList.add('is-done');
          setTimeout(function () { btn.textContent = '복사'; btn.classList.remove('is-done'); }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(raw).then(done);
        } else {
          var ta = doc.createElement('textarea');
          ta.value = raw; ta.style.position = 'fixed'; ta.style.opacity = '0';
          body.appendChild(ta); ta.select();
          try { doc.execCommand('copy'); done(); } catch (e) {}
          ta.remove();
        }
      });
    });
  }

  function readingTime(scope) {
    var el = $('[data-read-time]');
    if (!el) return;
    var text = scope.textContent.replace(/\s+/g, '');
    var codeLen = $$('pre', scope).reduce(function (s, p) { return s + p.textContent.length; }, 0);
    // 한글 본문 약 500자/분, 코드는 절반 가중치
    var min = Math.max(1, Math.round((text.length - codeLen * 0.5) / 500));
    el.textContent = '약 ' + min + '분';
  }

  function buildToc(scope) {
    var heads = $$('h2, h3, h4', scope).filter(function (h) {
      return !h.closest('.another_category') && !h.closest('.container_postbtn') && h.textContent.trim();
    });
    if (heads.length < 2) return;
    var top = Math.min.apply(null, heads.map(function (h) { return +h.tagName[1]; }));
    var lists = $$('.toc-list');
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'section-' + (i + 1);
      var lv = +h.tagName[1] - top + 2; // 가장 큰 제목을 lv-2로
      var anchor = doc.createElement('a');
      anchor.className = 'heading-anchor'; anchor.href = '#' + h.id; anchor.textContent = '#';
      anchor.setAttribute('aria-hidden', 'true');
      h.insertBefore(anchor, h.firstChild);
      lists.forEach(function (ol) {
        var li = doc.createElement('li');
        li.className = 'lv-' + Math.min(lv, 4);
        var a = doc.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.replace(/^#/, '').trim();
        a.setAttribute('data-target', h.id);
        li.appendChild(a); ol.appendChild(li);
      });
    });
    var layout = $('.post-layout');
    if (layout) layout.classList.add('has-toc');
    $$('.toc').forEach(function (t) { t.hidden = false; });
    $$('.toc-inline a').forEach(function (a) {
      a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
    });

    // 현재 읽는 섹션 강조
    var links = $$('.toc-list a');
    var current = null;
    function activate(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-target') === id); });
      var act = $('.toc-rail a.is-active');
      var rail = $('.toc-rail');
      if (act && rail && rail.scrollHeight > rail.clientHeight) {
        var r = act.offsetTop - rail.clientHeight / 2;
        rail.scrollTop = r;
      }
    }
    function onScroll() {
      var y = (parseInt(getComputedStyle(root).getPropertyValue('--header-h'), 10) || 60) + 40;
      var id = heads[0].id;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top - y <= 0) id = heads[i].id; else break;
      }
      activate(id);
    }
    window.addEventListener('scroll', throttle(onScroll, 80), { passive: true });
    onScroll();
  }

  /* ---------- 본문 처리 실행 ---------- */
  var content = $('.post .entry-content');
  if (content) {
    enhanceTables(content);
    enhanceCode(content);
    readingTime(content);
    buildToc(content);
  }

  /* ---------- 6. 진행 바 / 맨 위로 ---------- */
  var bar = $('.reading-progress span');
  var toTop = $('.to-top');
  function onScrollGlobal() {
    var y = window.scrollY || root.scrollTop;
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
    if (bar && isPermalink) {
      var art = $('.post .entry-content');
      if (!art) { bar.style.width = '0'; return; }
      var rect = art.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var pct = total > 0 ? Math.min(100, Math.max(0, (-rect.top + window.innerHeight * 0.2) / total * 100)) : 0;
      bar.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', throttle(onScrollGlobal, 30), { passive: true });
  onScrollGlobal();
  $$('.to-top, .toc-top').forEach(function (b) {
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  function throttle(fn, wait) {
    var t = 0, timer = null;
    return function () {
      var now = Date.now();
      if (now - t >= wait) { t = now; fn(); }
      else { clearTimeout(timer); timer = setTimeout(function () { t = Date.now(); fn(); }, wait); }
    };
  }
})();

/* ===== 에디토리얼 (2026-11-26): 워드마크, 호수 띠, 회차 숫자 ===== */
(function () {
  var CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
  var RE = /\s*—\s*(.+?)\s*([①-⑳])\s*$/;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  // 워드마크: 마지막 "." 강조
  var bt = document.querySelector('.brand-text');
  if (bt) bt.innerHTML = bt.textContent.replace(/\.(\w+)$/, '<span class="dot-a">.</span>$1');

  // 헤더 아래 호수(VOL) 띠
  var hd = document.querySelector('.site-header');
  if (hd) {
    var d = new Date(), M = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    var v = document.createElement('div');
    v.className = 'ed-vol';
    v.innerHTML = '<div class="container"><span>' + M[d.getMonth()] + ' ' + d.getFullYear() + '</span><span>' + COLOPHON.esc(COLOPHON.masthead) + '</span></div>';
    hd.after(v);
  }

  // 목록: 연재 글은 큰 회차 숫자
  Array.prototype.forEach.call(document.querySelectorAll('.post-card .pc-title'), function (t) {
    var m = t.textContent.match(RE);
    if (!m) return;
    var no = CIRC.indexOf(m[2]) + 1;
    t.textContent = t.textContent.replace(RE, '');
    var k = document.createElement('div');
    k.className = 'ed-no';
    k.innerHTML = '<b>' + pad(no) + '</b><span>' + m[1] + '</span>';
    t.before(k);
  });

  // 글 머리: 큰 숫자 + 제목 분리
  var title = document.querySelector('.post-title');
  if (title) {
    var m = title.textContent.match(RE);
    if (m) {
      var no = CIRC.indexOf(m[2]) + 1, head = title.closest('.post-head');
      title.innerHTML = title.textContent.replace(RE, '') + '<span class="ed-sub">' + m[1] + ' 연재 · ' + pad(no) + '</span>';
      head.classList.add('ed-head');
      var big = document.createElement('div');
      big.className = 'ed-big';
      big.textContent = pad(no);
      head.prepend(big);
    }
  }
})();
