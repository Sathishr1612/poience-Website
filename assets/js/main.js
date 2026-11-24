/* Poience — site behaviour. Plain JavaScript, no dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state + mobile menu ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  function onScrollHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal, .frame--reveal, [data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Accordions ---------- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true'));
    });
  });
  document.querySelectorAll('[data-faq-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('data-faq-all') === 'open';
      document.querySelectorAll('.faq__q').forEach(function (q) { q.setAttribute('aria-expanded', String(open)); });
    });
  });

  /* ---------- Tabs (portfolio segments) ---------- */
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (n) { e.preventDefault(); var next = tabs[(i + n + tabs.length) % tabs.length]; select(next); next.focus(); }
      });
    });
  }

  /* ---------- Enquiry form ---------- */
  var form = document.querySelector('[data-enquiry]');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var svc = params.get('service');
    if (svc && form.service) {
      Array.prototype.forEach.call(form.service.options, function (o) { if (o.value === svc) form.service.value = svc; });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      /* TODO (launch): send to email + Google Sheets, e.g. via a form endpoint or Apps Script web app. */
      var status = form.querySelector('.form__status');
      status.hidden = false;
      status.focus();
      form.querySelector('button[type="submit"]').disabled = true;
    });
  }

  /* ---------- Services: horizontal scroll gallery (home) ---------- */
  var hs = document.querySelector('.hs');
  if (hs) {
    var pin = hs.querySelector('.hs__pin'), track = hs.querySelector('.hs__track'), cards = Array.prototype.slice.call(hs.querySelectorAll('.hs__card'));
    var count = hs.querySelector('.hs__count b'), bar = hs.querySelector('.hs__bar span');
    var hsTarget = 0, hsCur = 0, hsRaf = null, lastActive = -1;
    var desktop = function () { return !reduceMotion; };
    var hsMeasure = function () {
      if (!desktop()) { track.style.transform = ''; return; }
      var r = hs.getBoundingClientRect(), span = r.height - pin.offsetHeight;
      hsTarget = Math.max(0, Math.min(1, span > 0 ? -r.top / span : 0));
      if (!hsRaf) hsRaf = requestAnimationFrame(hsTick);
    };
    var hsTick = function () {
      hsRaf = null;
      var d = hsTarget - hsCur;
      hsCur = Math.abs(d) < 0.0004 ? hsTarget : hsCur + d * 0.1;
      var max = track.scrollWidth - pin.clientWidth, base = cards[0].offsetLeft;
      var tg = cards.map(function (c) { return c.offsetLeft - base; }), k = tg.findIndex(function (t) { return t > max; });
      if (k > 0) { var from = tg[k - 1], n = tg.length - k; for (var j = k; j < tg.length; j++) tg[j] = from + (max - from) * (j - k + 1) / n; }
      var shift = hsCur * max;
      if (window.innerWidth <= 860) {
        /* phones: settle on each card, then glide to the next */
        var stops = tg.slice(); if (stops[stops.length - 1] < max - 1) stops.push(max);
        var u = hsCur * (stops.length - 1), si = Math.min(stops.length - 2, Math.floor(u)), f = u - si;
        var g = Math.max(0, Math.min(1, (f - 0.3) / 0.4)); g = g < 0.5 ? 4 * g * g * g : 1 - Math.pow(-2 * g + 2, 3) / 2;
        shift = stops[si] + (stops[si + 1] - stops[si]) * g;
      }
      track.style.transform = 'translate3d(' + (-shift).toFixed(1) + 'px,0,0)';
      bar.style.transform = 'scaleX(' + hsCur.toFixed(4) + ')';
      var centre = pin.clientWidth * 0.42, best = 0, bestD = 1e9;
      tg.forEach(function (t, i) { var dd = Math.abs(shift - t); if (dd < bestD) { bestD = dd; best = i; } });
      cards.forEach(function (c, i) {
        var b = c.getBoundingClientRect(), mid = b.left + b.width / 2, dist = mid - centre;
        c.querySelector('img').style.setProperty('--px', (-dist * 0.06).toFixed(1) + 'px');
      });
      if (best !== lastActive) {
        cards.forEach(function (c, i) { c.classList.toggle('is-active', i === best); });
        count.textContent = ('0' + (best + 1)).slice(-2);
        lastActive = best;
      }
      if (hsCur !== hsTarget) hsRaf = requestAnimationFrame(hsTick);
    };
    var vp = hs.querySelector('.hs__viewport'), dots = Array.prototype.slice.call(hs.querySelectorAll('.hs__dots button'));
    var dotSync = function () {
      if (desktop()) return;
      var best = 0, bestD = 1e9, vl = vp.getBoundingClientRect().left;
      cards.forEach(function (c, i) { var d = Math.abs(c.getBoundingClientRect().left - vl - 20); if (d < bestD) { bestD = d; best = i; } });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === best ? 'true' : 'false'); });
    };
    dots.forEach(function (d, i) { d.addEventListener('click', function () { vp.scrollTo({ left: cards[i].offsetLeft - 20, behavior: reduceMotion ? 'auto' : 'smooth' }); }); });
    vp.addEventListener('scroll', dotSync, { passive: true });
    dotSync();
    window.addEventListener('scroll', hsMeasure, { passive: true });
    window.addEventListener('resize', hsMeasure);
    hsMeasure();
  }

  /* ---------- How it works: self-drawing line (home) ---------- */
  var how = document.querySelector('.how2__wrap');
  if (how) {
    var fill = how.querySelector('.how2__fill'), hSteps = Array.prototype.slice.call(how.querySelectorAll('.how2__step')), line = how.querySelector('.how2__line');
    var howUpdate = function () {
      var lr = line.getBoundingClientRect(), mark = window.innerHeight * 0.62;
      var p = Math.max(0, Math.min(1, (mark - lr.top) / lr.height));
      if (reduceMotion) p = 1;
      fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      hSteps.forEach(function (s) {
        var n = s.querySelector('.how2__node').getBoundingClientRect();
        s.classList.toggle('is-on', n.top + n.height / 2 <= lr.top + lr.height * p + 2);
      });
      how.classList.toggle('is-done', p > 0.98);
    };
    window.addEventListener('scroll', howUpdate, { passive: true });
    window.addEventListener('resize', howUpdate);
    howUpdate();
  }

  /* ---------- Gentle parallax for layered artwork ---------- */
  var para = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  if (para.length && !reduceMotion) {
    var paraTick = null;
    var paraUpdate = function () {
      paraTick = null;
      var vh = window.innerHeight;
      para.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect(), off = (r.top + r.height / 2) - vh / 2;
        el.style.transform = 'translate3d(0,' + (off * parseFloat(el.getAttribute('data-speed'))).toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () { if (!paraTick) paraTick = requestAnimationFrame(paraUpdate); }, { passive: true });
    paraUpdate();
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Home: key intro ---------- */
  var intro = document.querySelector('.intro');
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem('poience-intro') === '1'; } catch (err) {}
    if (seen || reduceMotion) {
      intro.remove();
    } else {
      try { sessionStorage.setItem('poience-intro', '1'); } catch (err) {}
      document.body.classList.add('menu-open');
      setTimeout(function () { intro.classList.add('is-turning'); }, 1500);
      setTimeout(function () { intro.classList.add('is-leaving'); document.body.classList.remove('menu-open'); }, 2200);
      setTimeout(function () { intro.remove(); }, 3300);
    }
  }

  /* ---------- Home: scroll story — one house, changing in place ---------- */
  var story = document.querySelector('.story');
  if (!story) return;
  var stage = story.querySelector('.story__stage');
  var $ = function (s) { return story.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(story.querySelectorAll(s)); };
  var el = {
    grid: $('.story__grid'), halo: $('.story__halo'), house: $('.story__house'),
    bp: $('#bp'), fills: $('#fills'), solid: $('#solid'),
    wins: $$('.win'), board: $('#board'), forRent: $('#forRent'), rentedTxt: $('#rentedTxt'),
    seal1: $('#seal1'), seal2: $('#seal2'), marks: $$('.mk'), scan: $('#scan'), scanLine: $('#scanLine'),
    checks: $$('.ck'), sparks: $$('.sp'), vacLbl: $('#vacLbl'),
    stages: $$('.stage'), keyFill: $('#keyFill'), keyBit: $('#keyBit'), stageName: $('#stageName')
  };
  var names = el.stages.map(function (s) { return s.getAttribute('data-name'); });
  var cuts = [0, 0.13, 0.27, 0.41, 0.55, 0.70, 0.84];
  var order = [5, 1, 7, 2, 4, 0, 6, 3, 8];
  var target = 0, cur = 0, raf = null, lastIdx = -1;

  var cl = function (x) { return Math.max(0, Math.min(1, x)); };
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  function measure() {
    var r = story.getBoundingClientRect();
    var span = r.height - stage.offsetHeight;
    target = cl(span > 0 ? -r.top / span : 0);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    raf = null;
    var d = target - cur;
    cur = (Math.abs(d) < 0.0003 || reduceMotion) ? target : cur + d * 0.085;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(tick);
  }
  function render(p) {
    var win = function (a, b) { return cl((p - a) / (b - a)); };
    var bump = function (a, b, f) { return Math.min(cl((p - a) / f), cl((b - p) / f)); };

    var t1 = ease(win(0.05, 0.15));
    el.bp.style.opacity = 1 - t1;
    el.grid.style.opacity = 1 - 0.6 * t1;
    el.fills.style.opacity = t1;
    el.solid.style.strokeDashoffset = 1 - t1;

    var bIn = ease(win(0.12, 0.17)), bOut = win(0.54, 0.58), rented = win(0.42, 0.45);
    el.board.style.transform = 'rotate(' + (-100 * (1 - bIn)) + 'deg)';
    el.board.style.opacity = bIn * (1 - bOut);
    el.forRent.style.opacity = 1 - rented;
    el.rentedTxt.style.opacity = rented;

    var sealOut = 1 - win(0.53, 0.56);
    [[el.seal1, ease(win(0.29, 0.32))], [el.seal2, ease(win(0.33, 0.36))]].forEach(function (s) {
      s[0].style.transform = 'rotate(-8deg) scale(' + (1.7 - 0.7 * s[1]) + ')';
      s[0].style.opacity = s[1] * sealOut;
    });

    var dim = win(0.85, 0.88), relight = win(0.95, 0.98);
    el.wins.forEach(function (w, i) {
      var lit = win(0.43 + order[i] * 0.011, 0.45 + order[i] * 0.011);
      var g = lit * (1 - dim * (1 - relight));
      w.style.fill = g > 0.01 ? 'rgba(242,196,110,' + (0.2 + 0.8 * g).toFixed(3) + ')' : 'rgba(14,22,38,' + (0.9 * t1).toFixed(3) + ')';
      w.style.filter = g > 0.01 ? 'drop-shadow(0 0 ' + (14 * g).toFixed(1) + 'px rgba(242,196,110,.85))' : 'none';
      w.style.strokeOpacity = t1;
    });
    el.halo.style.opacity = win(0.43, 0.50) * (1 - dim * (1 - relight));

    var mOut = 1 - win(0.68, 0.70);
    el.marks.forEach(function (m, k) {
      var a = ease(win(0.56 + k * 0.022, 0.58 + k * 0.022)), c = win(0.61 + k * 0.018, 0.63 + k * 0.018);
      m.style.opacity = a * mOut;
      m.querySelector('circle').setAttribute('r', (6 + 10 * a).toFixed(2));
      m.querySelector('.tick').style.opacity = c;
    });

    var sx = win(0.71, 0.82);
    el.scan.style.opacity = bump(0.70, 0.84, 0.02);
    el.scanLine.setAttribute('x', (150 + 640 * sx).toFixed(1));
    el.checks.forEach(function (c, k) { c.style.opacity = sx > 0.15 + k * 0.22 ? 1 : 0; });

    var vac = bump(0.84, 0.97, 0.025);
    el.sparks.forEach(function (s, i) { s.style.opacity = Math.max(0, vac * (0.55 + 0.45 * Math.sin(p * 260 + i * 1.7))); });
    el.vacLbl.style.opacity = vac;

    var cam = ease(p);
    el.house.style.transform = 'translateY(' + (-12 * cam).toFixed(1) + 'px) scale(' + (0.94 + 0.08 * cam).toFixed(4) + ')';

    el.keyFill.style.strokeDashoffset = 1 - p;
    el.keyBit.setAttribute('stroke', p > 0.985 ? '#EDB795' : 'rgba(242,236,227,.3)');

    var idx = 0;
    for (var i = 0; i < cuts.length; i++) if (p >= cuts[i]) idx = i;
    if (idx !== lastIdx) {
      el.stages.forEach(function (s, j) {
        s.classList.toggle('is-active', j === idx);
        s.classList.toggle('is-past', j < idx);
        s.classList.toggle('is-near', Math.abs(j - idx) === 1);
        s.setAttribute('aria-hidden', j === idx ? 'false' : 'true');
        s.querySelectorAll('a').forEach(function (a) { a.tabIndex = j === idx ? 0 : -1; });
      });
      el.stageName.textContent = names[idx];
      story.classList.toggle('at-start', idx === 0);
      lastIdx = idx;
    }
  }
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  measure();
  render(0);
})();
