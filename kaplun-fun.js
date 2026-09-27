/* Kaplun site fun layer: live tracker demo + easter eggs.
   Loaded on index.html and store.html. Every feature is guarded so it
   only runs if its DOM elements exist. */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var rand = function (a, b) { return Math.random() * (b - a) + a; };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- toasts ---------- */
  var toastWrap = document.querySelector('.toast-wrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }
  function toast(msg, ms) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = msg;
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity 0.4s';
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 450);
    }, ms || 4200);
  }

  /* ---------- fireworks on click (spawn 12 particles) ---------- */
  var gameActive = false;
  function burst(x, y, n, colors) {
    var fw = $('fx-canvas');
    if (!fw) {
      fw = document.createElement('canvas');
      fw.id = 'fx-canvas';
      fw.style.cssText = 'position:fixed;inset:0;z-index:9997;pointer-events:none;';
      document.body.appendChild(fw);
    }
    fw.width = window.innerWidth;
    fw.height = window.innerHeight;
    var ctx = fw.getContext('2d');
    var parts = [];
    n = n || 12;
    for (var i = 0; i < n; i++) {
      var a = rand(0, Math.PI * 2);
      var sp = rand(120, 380);
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: rand(0.5, 1.1), c: pick(colors) });
    }
    var start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, fw.width, fw.height);
      var alive = false;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        var dt = Math.min((now - start) / 1000, 1.5);
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vy += 420 * 0.016;
        if (p.life > 0) {
          alive = true;
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.c;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
          p.life -= 0.016 / 1.1;
        }
      }
      ctx.globalAlpha = 1;
      if (alive) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, fw.width, fw.height);
    })(start);
  }
  document.addEventListener('pointerdown', function (e) {
    if (gameActive) return;
    var el = e.target;
    if (el.closest && el.closest('a,button,input,select,textarea,[onclick],.t-row,#game-area')) return;
    burst(e.clientX, e.clientY, 12, ['#34D399', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444', '#fff']);
  });

  /* ---------- confetti (DOM pieces) ---------- */
  function confetti(reason) {
    var wrap = document.createElement('div');
    wrap.className = 'confetti-wrap';
    document.body.appendChild(wrap);
    var cols = ['#34D399', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444', '#fff', '#4CAF50'];
    for (var i = 0; i < 90; i++) {
      var c = document.createElement('div');
      c.className = 'con';
      var sz = rand(6, 12);
      c.style.cssText = 'left:' + rand(0, 100) + 'vw;width:' + sz + 'px;height:' + (sz * rand(0.5, 1.4)) + 'px;' +
        'background:' + pick(cols) + ';animation-duration:' + rand(1.4, 3.2) + 's;animation-delay:' + rand(0, 0.8) + 's;' +
        'transform:rotate(' + rand(0, 360) + 'deg);';
      wrap.appendChild(c);
    }
    setTimeout(function () { wrap.remove(); }, 3600);
    if (reason) toast(reason, 5200);
  }

  /* ---------- live tracker demo ---------- */
  var DB = [
    ['Chicken breast', '🍗', 165, 31, 0, 3.6], ['Chicken thigh', '🍗', 209, 26, 0, 11], ['Ground beef 80/20', '🥩', 254, 26, 0, 15],
    ['Steak (ribeye)', '🥩', 291, 27, 0, 20], ['Pork chop', '🍖', 231, 23, 0, 15], ['Bacon', '🥓', 541, 37, 1, 42],
    ['Turkey breast', '🦃', 135, 30, 0, 1], ['Ham', '🥪', 145, 21, 1, 6], ['Salami', '🍕', 348, 16, 1, 30],
    ['Sausage', '🌭', 301, 12, 2, 28], ['Salmon', '🐟', 208, 20, 0, 13], ['Tuna (canned)', '🐟', 116, 26, 0, 1],
    ['Shrimp', '🦐', 99, 24, 0, 0.3], ['Cod', '🐟', 82, 18, 0, 0.7], ['Egg', '🥚', 143, 13, 1, 10],
    ['Egg white', '🥚', 52, 11, 0, 0], ['Milk (whole)', '🥛', 61, 3.2, 4.8, 3.3], ['Greek yogurt', '🥣', 59, 10, 3.6, 0.4],
    ['Cheddar cheese', '🧀', 403, 25, 1, 33], ['Mozzarella', '🧀', 280, 28, 3, 17], ['Cottage cheese', '🥣', 98, 11, 3, 4],
    ['Butter', '🧈', 717, 0.9, 0.1, 81], ['Peanut butter', '🥜', 588, 25, 20, 50], ['Almonds', '🌰', 579, 21, 22, 50],
    ['Walnuts', '🌰', 654, 15, 14, 65], ['Cashews', '🌰', 553, 18, 30, 44], ['White rice (cooked)', '🍚', 130, 2.7, 28, 0.3],
    ['Brown rice (cooked)', '🍚', 111, 2.6, 23, 0.9], ['Oatmeal', '🥣', 68, 2.4, 12, 1.4], ['Bread (white)', '🍞', 265, 9, 49, 3.2],
    ['Whole wheat bread', '🍞', 247, 13, 41, 3.4], ['Pasta (cooked)', '🍝', 131, 5, 25, 1.1], ['Potato (baked)', '🥔', 93, 2.5, 21, 0.1],
    ['French fries', '🍟', 312, 3.4, 41, 15], ['Sweet potato', '🍠', 86, 1.6, 20, 0.1], ['Corn', '🌽', 86, 3.3, 19, 1.4],
    ['Peas', '🫛', 81, 5.4, 14, 0.4], ['Banana', '🍌', 89, 1.1, 23, 0.3], ['Apple', '🍎', 52, 0.3, 14, 0.2],
    ['Orange', '🍊', 47, 0.9, 12, 0.1], ['Strawberries', '🍓', 32, 0.7, 7.7, 0.3], ['Blueberries', '🫐', 57, 0.7, 14, 0.3],
    ['Grapes', '🍇', 69, 0.7, 18, 0.2], ['Watermelon', '🍉', 30, 0.6, 8, 0.2], ['Mango', '🥭', 60, 0.8, 15, 0.4],
    ['Pineapple', '🍍', 50, 0.5, 13, 0.1], ['Avocado', '🥑', 160, 2, 9, 15], ['Tomato', '🍅', 18, 0.9, 3.9, 0.2],
    ['Cucumber', '🥒', 15, 0.7, 3.6, 0.1], ['Carrot', '🥕', 41, 0.9, 10, 0.2], ['Broccoli', '🥦', 34, 2.8, 7, 0.4],
    ['Spinach', '🥬', 23, 2.9, 3.6, 0.4], ['Lettuce', '🥗', 15, 1.4, 2.9, 0.2], ['Bell pepper', '🫑', 31, 1, 6, 0.3],
    ['Onion', '🧅', 40, 1.1, 9, 0.1], ['Mushroom', '🍄', 22, 3.1, 3.3, 0.3], ['Broccoli soup', '🥣', 33, 1.4, 5, 0.8],
    ['Cabbage', '🥬', 25, 1.3, 6, 0.1], ['Pizza (cheese)', '🍕', 266, 11, 33, 10], ['Pizza (pepperoni)', '🍕', 298, 13, 32, 13],
    ['Hamburger', '🍔', 295, 17, 24, 14], ['Cheeseburger', '🍔', 303, 16, 24, 15], ['Hot dog', '🌭', 290, 12, 24, 17],
    ['Taco (beef)', '🌮', 226, 9, 20, 12], ['Burrito', '🌯', 230, 9, 30, 8], ['Fried chicken', '🍗', 289, 24, 10, 17],
    ['Lasagna', '🍝', 135, 7, 14, 6], ['Spaghetti bolognese', '🍝', 148, 8, 17, 5], ['Mac & cheese', '🧀', 164, 5, 24, 5],
    ['Caesar salad', '🥗', 168, 5, 10, 12], ['Grilled cheese', '🥪', 400, 12, 31, 25], ['Turkey sandwich', '🥪', 250, 12, 28, 10],
    ['Bagel', '🥯', 250, 10, 48, 1.5], ['Croissant', '🥐', 406, 8, 46, 21], ['Pancakes', '🥞', 231, 6, 33, 8],
    ['Waffle', '🧇', 291, 8, 33, 14], ['French toast', '🍞', 229, 7, 27, 10], ['Cereal (corn flakes)', '🥣', 357, 7, 84, 0.9],
    ['Granola', '🥣', 471, 10, 64, 20], ['Chocolate chip cookie', '🍪', 492, 5, 63, 23], ['Oatmeal raisin cookie', '🍪', 421, 6, 66, 15],
    ['Brownie', '🍫', 466, 5, 58, 25], ['Donut (glazed)', '🍩', 421, 5, 49, 23], ['Ice cream (vanilla)', '🍦', 207, 3.5, 24, 11],
    ['Dark chocolate', '🍫', 546, 5, 61, 31], ['Milk chocolate', '🍫', 535, 8, 59, 30], ['Candy bar (Snickers)', '🍫', 491, 8, 56, 26],
    ['Potato chips', '🍟', 536, 7, 53, 34], ['Pretzels', '🥨', 384, 10, 80, 2.9], ['Popcorn (buttered)', '🍿', 557, 10, 58, 33],
    ['Tortilla chips', '🌮', 497, 7, 64, 24], ['Guacamole', '🥑', 160, 2, 9, 15], ['Hummus', '🥙', 166, 7.9, 14, 9.6],
    ['Sushi (california roll)', '🍣', 255, 6, 38, 8], ['Noodles (instant)', '🍜', 436, 8, 61, 17], ['Ramen', '🍜', 137, 6, 19, 4],
    ['Fried rice', '🍚', 168, 4, 25, 6], ['Chicken noodle soup', '🍲', 51, 3, 7, 1.6], ['Tomato soup', '🍅', 41, 1, 8, 0.7],
    ['Coffee (black)', '☕', 2, 0.3, 0, 0], ['Latte (whole milk)', '☕', 63, 3.4, 5.6, 3], ['Cappuccino', '☕', 46, 2.5, 4, 2.1],
    ['Orange juice', '🧃', 45, 0.7, 10, 0.2], ['Cola', '🥤', 42, 0, 11, 0], ['Diet cola', '🥤', 1, 0, 0, 0],
    ['Beer', '🍺', 43, 0.5, 3.6, 0], ['Red wine', '🍷', 85, 0.1, 2.6, 0], ['Whiskey', '🥃', 250, 0, 0, 0],
    ['Energy drink', '⚡', 45, 0, 12, 0], ['Smoothie (berry)', '🫐', 55, 0.6, 13, 0.2], ['Protein shake', '🥤', 105, 22, 3, 1.6],
    ['Kombucha', '🍵', 30, 0, 8, 0], ['Trail mix', '🥜', 462, 14, 45, 29], ['Protein bar', '🍫', 380, 30, 40, 11],
    ['Dates', '🌴', 282, 2.5, 75, 0.4], ['Raisins', '🍇', 299, 3.1, 79, 0.5], ['Honey', '🍯', 304, 0.3, 82, 0],
    ['Maple syrup', '🍁', 260, 0, 67, 0.1], ['Avocado toast', '🥑', 220, 6, 20, 12], ['Kimchi', '🥬', 24, 1.1, 4, 0.1],
    ['Edamame', '🫛', 121, 12, 8.9, 5.2], ['Tofu', '🍢', 76, 8, 1.9, 4.8], ['Chickpeas (cooked)', '🫛', 164, 8.9, 27, 2.6],
    ['Lentils (cooked)', '🥄', 116, 9, 20, 0.4], ['Black beans', '🫘', 132, 8.9, 24, 0.5], ['Quinoa (cooked)', '🌾', 120, 4.4, 21, 1.9]
  ];

  var FFN = {}; /* ephemeral food name -> calorie answer to reuse for fun facts */
  DB.forEach(function (d) { FFN[d[0].toLowerCase()] = d; });

  var tInput = $('t-input');
  if (tInput) {
    var tResults = $('t-results'), tNum = $('tring-num'), tGoal = $('t-goal'),
        tPayload = $('t-payload'), tClear = $('t-clear'), tring = document.querySelector('.tring');
    var tray = []; /* {name,emoji,grams,kcal} */

    function renderResults(q) {
      var out = [];
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < DB.length; i++) {
        var d = DB[i];
        var name = d[0].toLowerCase();
        var ok = 0;
        for (var k = 0; k < terms.length; k++) { if (name.indexOf(terms[k]) !== -1) ok++; }
        if (ok > 0) {
          var score = ok * 10 + (name.indexOf(q.toLowerCase()) === 0 ? 20 : 0) - name.length / 100;
          out.push({ d: d, s: score });
        }
      }
      out.sort(function (a, b) { return b.s - a.s; });
      out = out.slice(0, 6);
      tResults.innerHTML = '';
      if (!out.length) {
        var nm = document.createElement('div');
        nm.className = 't-tip';
        nm.textContent = 'No match — way too exotic for this demo. The real app has 600K+ foods!';
        tResults.appendChild(nm);
        return;
      }
      out.forEach(function (r) {
        var d = r.d;
        var row = document.createElement('div');
        row.className = 't-row';
        row.innerHTML = '<span class="tr-emoji">' + d[1] + '</span>' +
          '<div class="tr-info"><div class="tr-name"></div><div class="tr-sub"></div></div>' +
          '<span class="tr-cal"></span>' +
          '<input class="tr-g" type="number" min="1" step="10" value="100">' +
          '<button class="tr-add">Add</button>';
        row.querySelector('.tr-name').textContent = d[0];
        row.querySelector('.tr-sub').textContent = d[2] + ' kcal / 100g  ·  P ' + d[3] + 'g  C ' + d[4] + 'g  F ' + d[5] + 'g';
        row.querySelector('.tr-cal').textContent = d[2];
        var g = row.querySelector('.tr-g');
        row.querySelector('.tr-add').addEventListener('click', function () {
          var grams = Math.max(1, parseInt(g.value, 10) || 100);
          addToTray(d, grams);
        });
        tResults.appendChild(row);
      });
    }

    function addToTray(d, grams) {
      var kcal = Math.round(d[2] * grams / 100);
      tray.push({ name: d[0], emoji: d[1], grams: grams, kcal: kcal });
      renderTray();
      if (tInput) { tInput.value = ''; tResults.innerHTML = ''; tInput.focus(); }
      var total = tray.reduce(function (s, x) { return s + x.kcal; }, 0);
      var goal = parseInt(tGoal.value, 10);
      var prev = total - kcal;
      if (prev < goal && total >= goal) {
        confetti('🎯 GOAL HIT! ' + total + ' kcal — you are basically a champion athlete now.');
      }
    }

    function renderTray() {
      tPayload.innerHTML = '';
      if (!tray.length) { tPayload.textContent = '🍽️ Your tray is empty. Feed it something. (we recommend food)'; }
      tray.forEach(function (x, i) {
        var chip = document.createElement('div');
        chip.className = 't-chip';
        chip.innerHTML = '<span class="tc-name">' + x.emoji + ' ' + x.name + ' · ' + x.grams + 'g</span>' +
          '<span class="tc-cal">' + x.kcal + ' kcal</span><button class="tc-x" aria-label="remove">✕</button>';
        chip.querySelector('.tc-x').addEventListener('click', function () {
          tray.splice(i, 1);
          renderTray();
        });
        tPayload.appendChild(chip);
      });
      var total = tray.reduce(function (s, x) { return s + x.kcal; }, 0);
      var goal = parseInt(tGoal.value, 10);
      var pct = Math.min(100, Math.round(total / goal * 100));
      tNum.textContent = total;
      if (tring) tring.style.setProperty('--p', pct);
    }

    tInput.addEventListener('input', function () { renderResults(tInput.value); });
    tInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var v = tInput.value.trim().toLowerCase();
        if (!v) return;
        if (FFN[v]) { addToTray(FFN[v], 100); }
        else {
          var funny = pick(['Not found. It has probably found you instead.', 'Too exotic even for this demo burger.', 'Really committed to that snack, huh? Try "pizza".', 'That calorie count is classified.', 'Not in the demo. The app knows, though. 600K foods. Just saying.']);
          toast(funny);
        }
      }
    });
    if (tGoal) tGoal.addEventListener('change', renderTray);
    if (tClear) tClear.addEventListener('click', function () { tray = []; renderTray(); });
    renderTray();
  }

  /* ---------- Konami code + word triggers ---------- */
  var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var buf = [];
  var trig = { bacon: '🥓 541 kcal / 100g. Always worth it. A few strips. As a treat.', pizza: '🍕 Fun fact: the demo secretly hopes "pizza" was going to win.', banana: '🍌 89 kcal, pure happiness. Potassium and peace of mind.', golden: '🍩 Now you clicked your way to a donut. Eat nothing. Meditate.' };
  document.addEventListener('keydown', function (e) {
    var inInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT');
    if (e.key === 'Escape') { closeTerminal(); togglePanic(false); return; }
    if (e.key === 'p' && !inInput && !gameActive) { togglePanic(); return; }
    buf.push(e.key.toLowerCase());
    if (buf.length > konami.length) buf.shift();
    var kk = '';
    for (var i = 0; i < konami.length; i++) {
      var want = i === konami.length - 1 ? 'a' : konami[i].toLowerCase();
      kk += want;
    }
    var typed = buf.join('');
    if (typed.lastIndexOf(kk) !== -1) {
      buf.length = 0;
      openTerminal();
      return;
    }
    if (!inInput && typed.length >= 3) {
      for (var w in trig) {
        if (typed.lastIndexOf(w) !== -1 && !new RegExp('[a-z]' + w).test(typed) && typed.indexOf(w) !== -1) {
          var start = typed.indexOf(w);
          if (start + w.length === typed.length) { toast(trig[w]); }
        }
      }
    }
  });

  /* ---------- terminal ---------- */
  function openTerminal() {
    if ($('kaplun-term')) { return; }
    var ov = document.createElement('div');
    ov.className = 'term-overlay';
    ov.id = 'kaplun-term';
    var box = document.createElement('div');
    box.className = 'term-box';
    box.innerHTML = '<div class="term-head"><span class="d" style="background:#ff5f57"></span><span class="d" style="background:#febc2e"></span><span class="d" style="background:#28c840"></span><span style="margin-left:0.6rem">kaplun@site: ~/secret-console</span></div>' +
      '<div class="term-body" id="term-body"></div>' +
      '<div class="term-input-row"><span class="pfx">visitor@site:~$</span><input id="term-input" type="text" autocomplete="off" spellcheck="false"></div>';
    ov.appendChild(box);
    document.body.appendChild(ov);
    var body = $('term-body');
    function line(html, cls) { var p = document.createElement('div'); if (cls) p.className = cls; p.innerHTML = html; body.appendChild(p); body.scrollTop = body.scrollHeight; }
    line('Welcome back, operator.', 'ok');
    line('This console is 100% decorative and 0% functional, much like my willpower.', 'in');
    line('Type <b>help</b> to see what this thing can do.', 'in');
    var input = $('term-input');
    input.focus();
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var v = input.value.trim().toLowerCase();
      input.value = '';
      line('$ ' + v, 'in');
      if (!v) return;
      var cmds = {
        help: 'Commands: help, status, matrix, secret, banana, unlock, clear, exit',
        '?': 'Commands: help, status, matrix, secret, unlock, clear, exit',
        status: 'CPU ▮▮▮▮▮▮▯▯ 72% — deep food thinking<br>CALORIES LOGGED: 0 — fix that<br>UPTIME: 2h 14m — no naps taken<br>RAM ▮▮▮▮▯▯▯▯ 41% — the donut ate the rest',
        matrix: 'Entering the Matrix. Do not try to bend the calorie counter — that is impossible. Instead, only try to realize the truth. The truth is: the spoon is a food. 🥄',
        secret: 'The real treasure was the macros you tracked along the way. Also, try clicking the hero title 5 times. 🍩',
        banana: '89 kcal. Potassium elevated. Mood: climbing.',
        unlock: 'NICE TRY. This is a website, not a payment terminal. The only thing you unlock here is... self-improvement.',
        exit: 'Exiting terminal. Stay hungry. (that one was free)'
      };
      if (v === 'clear') {
        body.innerHTML = '';
        line('Terminal flushed. Spotless. Like a clean bench press.', 'ok');
      } else if (cmds[v]) {
        line(cmds[v], v === 'unlock' ? 'warn' : 'ok');
      } else {
        line('Command not found. Try <b>help</b>. (it is always help)', 'err');
      }
      body.scrollTop = body.scrollHeight;
    });
  }
  function closeTerminal() { var t = $('kaplun-term'); if (t) t.remove(); }

  /* ---------- runaway footer link ---------- */
  var runaway = document.querySelector('footer a[href="#"]');
  if (runaway) {
    var dodges = 0;
    runaway.addEventListener('pointerenter', function () {
      if (dodges >= 3) return;
      dodges++;
      var d = runaway.style.transform ? 30 : -30;
      runaway.style.transition = 'transform 0.15s';
      runaway.style.transform = 'translateX(' + d + 'px)';
      if (dodges === 3) toast('Okay, you clearly want it. Take the link. It does nothing anyway.');
    });
    runaway.addEventListener('click', function (e) {
      if (dodges < 3) { e.preventDefault(); toast('👀 You almost clicked me. Nice reflexes.'); }
    });
  }

  /* ---------- golden donut (5 clicks on hero title) ---------- */
  var heroH = document.querySelector('.hero h1');
  if (heroH) {
    var clicks = 0, last = 0;
    heroH.addEventListener('click', function () {
      var now = Date.now();
      if (now - last > 1200) clicks = 0;
      clicks++; last = now;
      if (clicks >= 5) { clicks = 0; confetti('<b>🍩 GOLDEN DONUT UNLOCKED.</b> You rowed 0 meters. You ate 0 kg. You are, however, victorious.'); }
    });
  }

  /* ---------- panic mode (press P) ---------- */
  var panic = $('panic-overlay');
  if (!panic) {
    panic = document.createElement('div');
    panic.className = 'panic-overlay';
    panic.id = 'panic-overlay';
    panic.innerHTML = '<div class="resume-card">' +
      '<span class="rc-badge">COMPLETELY NORMAL PROFESSIONAL RESUME — nothing to see here</span>' +
      '<h1>Daniel Kaplan</h1><div class="rc-sub">Software Developer · Results-Oriented · Hydrated</div>' +
      '<h2>Experience</h2><ul><li><b>Full-Stack Developer</b> — shipped mobile apps, built websites, communicated effectively with stakeholders (screens).</li><li><b>Overcame significant challenges</b> including a 2,000 kcal daily goal and the temptation of chocolate.</li></ul>' +
      '<h2>Skills</h2><p>Flutter · Dart · Web · Photo Analysis via AI · Strategic hydration · Water tracking with unwavering dedication.</p>' +
      '<h2>Education</h2><p>Kaplun School of Applied Clicking — Honours.</p>' +
      '<button class="rc-exit" id="panic-exit">Return to your fitness journey</button>' +
      '<p style="font-size:0.75rem;color:#888;margin-top:1rem">Press ESC or P to exit panic mode. Your snacks remain safe.</p></div>';
    document.body.appendChild(panic);
  }
  function togglePanic(force) {
    var show = force === undefined ? !panic.classList.contains('show') : force;
    panic.classList.toggle('show', show);
    document.body.style.overflow = show ? 'hidden' : '';
  }
  var pe = $('panic-exit');
  if (pe) pe.addEventListener('click', function () { togglePanic(false); });

  /* ---------- daily fun fact ---------- */
  var facts = [
    '😇 Coffee with nothing in it: about 2 kcal per cup. Black holes have less gravity, honestly.',
    '🥑 Avocados are fruits AND vegetables. They are also lawyers of the fruit world.',
    '🍕 The loudest pizza in the world says nothing. It just exists and calls to you.',
    '🦕 A blue whale eats about 1,000,000 kcal a day. Respect but also please.',
    '🍩 Donuts don’t have a season. They have a calling.',
    '🧊 Ice water: 0 kcal of flavor, infinite notifications of "did you drink your water?"',
    '🥦 Broccoli is 91% water and 100% accusation.',
    'Today you will burn roughly 1,800–2,200 kcal just by breathing. Absolute main character energy.'
  ];
  var day = Math.floor(Date.now() / 86400000) % facts.length;
  if (!sessionStorage.getItem('kaplun-fact')) {
    sessionStorage.setItem('kaplun-fact', '1');
    setTimeout(function () { toast('Fun fact: ' + facts[day]); }, 7000);
  }

  /* ---------- footer hint ---------- */
  var foot = document.querySelector('footer');
  if (foot && !foot.querySelector('.hint-press')) {
    var hp = document.createElement('span');
    hp.className = 'hint-press';
    hp.textContent = 'psst — ↑ ↑ ↓ ↓ ← → ← → B A';
    foot.appendChild(hp);
  }

  /* ---------- Stay Under 2,000 minigame ---------- */
  var gCanvas = $('g-canvas');
  if (gCanvas) {
    var gArea = $('game-area'), gStart = $('g-start'), gOver = $('g-overlay'),
        gScore = $('g-score'), gTime = $('g-time'), gBest = $('g-best'),
        gFill = $('g-ring-fill'), gTxt = $('g-ring-txt'),
        gOverTitle = $('g-over-title'), gOverSub = $('g-over-sub'),
        gStScore = $('g-st-score'), gStFoods = $('g-st-foods'), gStKcal = $('g-st-kcal'),
        gAgain = $('g-play-again');
    var gctx = gCanvas.getContext('2d');
    var GOAL = 2000, DURATION = 45, CALM = 800, FONT = "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif";

    var HEALTHY = [['Broccoli', '🥦', 34], ['Carrot', '🥕', 41], ['Apple', '🍎', 52], ['Strawberry', '🍓', 32],
      ['Cucumber', '🥒', 15], ['Orange', '🍊', 47], ['Blueberry', '🫐', 57], ['Grapes', '🍇', 69], ['Tomato', '🍅', 18]];
    var JUNK = [['Donut', '🍩', 421], ['Pizza', '🍕', 298], ['Fries', '🍟', 312], ['Burger', '🍔', 303],
      ['Cookie', '🍪', 492], ['Chocolate', '🍫', 535], ['Croissant', '🥐', 406]];

    var state = null;

    function canvasSize() {
      gCanvas.width = gArea.clientWidth;
      gCanvas.height = gArea.clientHeight;
    }
    window.addEventListener('resize', function () { if (state) { canvasSize(); state.bx = Math.min(state.bx, gCanvas.width); } });

    function newGame() {
      var best = parseInt(localStorage.getItem('kaplun-best') || '0', 10);
      gBest.textContent = best;
      canvasSize();
      state = {
        score: 0, kcal: 0, foods: 0, left: DURATION, bx: gCanvas.width / 2, bw: 64,
        item: null, spawnIn: 600, lastSpawn: 0, running: true, over: false,
        raf: null, lastT: 0, shakes: 0, floats: [], healthyStreak: 0
      };
      gOver.classList.remove('show');
      gScore.textContent = '0';
      gTime.textContent = DURATION;
      gFill.style.width = '0%';
      gFill.classList.remove('danger');
      gTxt.textContent = '0 / ' + GOAL.toLocaleString() + ' kcal';
      gStart.textContent = 'Reset';
      gameActive = true;
      document.addEventListener('keydown', gKeyDown);
      document.addEventListener('keyup', gKeyUp);
      gArea.addEventListener('pointermove', gPointer);
      gArea.addEventListener('pointerdown', gPointer);
      state.lastT = performance.now();
      state.raf = requestAnimationFrame(gLoop);
    }

    var keys = {};
    function gKeyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state) e.preventDefault();
    }
    function gKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    }
    function gPointer(e) {
      if (!state || state.over) return;
      var r = gArea.getBoundingClientRect();
      state.bx = e.clientX - r.left;
    }

    function spawnItem() {
      var junk = Math.random() < 0.4;
      var pool = junk ? JUNK : HEALTHY;
      var f = pool[Math.floor(Math.random() * pool.length)];
      var speed = 90 + Math.min(150, (DURATION - state.left) * 2.6) + Math.random() * 60;
      state.item = {
        name: f[0], emoji: f[1], kcal: f[2], x: rand(30, gCanvas.width - 30),
        y: -40, v: speed, r: 24, junk: junk
      };
    }

    function gLoop(now) {
      if (!state) return;
      var dt = (now - state.lastT) / 1000;
      state.lastT = now;
      gctx.clearRect(0, 0, gCanvas.width, gCanvas.height);

      if (state.running) {
        state.left -= dt;
        if (state.left <= 0) return endGame('time');
        gTime.textContent = Math.max(0, Math.ceil(state.left));

        if (keys.left) state.bx -= 520 * dt;
        if (keys.right) state.bx += 520 * dt;
        state.bx = Math.max(state.bw / 2, Math.min(gCanvas.width - state.bw / 2, state.bx));

        if (!state.item && now - state.lastSpawn >= state.spawnIn) {
          state.lastSpawn = now;
          state.spawnIn = Math.max(380, CALM - (DURATION - state.left) * 9);
          spawnItem();
        }
        var it = state.item;
        if (it) {
          it.y += it.v * dt;
          var bx1 = state.bx - state.bw / 2, bx2 = state.bx + state.bw / 2;
          if (it.y + it.r >= gCanvas.height - 54 && it.x > bx1 - it.r && it.x < bx2 + it.r && !it.gone) {
            it.gone = true;
            state.foods++;
            if (it.junk) {
              state.kcal += it.kcal;
              state.shakes = 3;
              state.floats.push({ x: it.x, y: gCanvas.height - 60, txt: '+' + it.kcal + ' kcal 🔥', t: 0, bad: true });
              state.healthyStreak = 0;
              if (state.kcal >= GOAL) return endGame('bust');
            } else {
              state.score += it.kcal;
              state.healthyStreak++;
              state.floats.push({ x: it.x, y: gCanvas.height - 60, txt: '+', t: 0, bad: false });
              if (state.healthyStreak > 0 && state.healthyStreak % 8 === 0) { state.left = Math.min(DURATION, state.left + 2); }
            }
            state.item = null;
            state.spawnIn = 200;
          }
          if (!it.gone && it.y - it.r > gCanvas.height) state.item = null;

          gctx.font = '34px ' + FONT;
          gctx.textAlign = 'center';
          gctx.fillText(it.emoji, it.x, it.y);
          gctx.font = '13px ' + FONT;
          gctx.fillStyle = it.junk ? 'rgba(239,68,68,0.9)' : 'rgba(52,211,153,0.9)';
          gctx.fillText(it.kcal, it.x, it.y + 40);
        }

        gScore.textContent = state.score;
        var pct = Math.min(100, state.kcal / GOAL * 100);
        gFill.style.width = pct + '%';
        gFill.classList.toggle('danger', pct >= 80);
        gTxt.textContent = state.kcal.toLocaleString() + ' / ' + GOAL.toLocaleString() + ' kcal';
      }

      /* basket */
      var bx = state.bx;
      gctx.beginPath();
      gctx.arc(bx, gCanvas.height - 38, 30, 0, Math.PI * 2);
      gctx.fillStyle = 'rgba(52,211,153,0.18)';
      gctx.fill();
      gctx.strokeStyle = 'rgba(52,211,153,0.7)';
      gctx.lineWidth = 2;
      gctx.stroke();
      gctx.font = '34px ' + FONT;
      gctx.textAlign = 'center';
      gctx.fillText('🧺', bx, gCanvas.height - 30);

      /* float texts */
      for (var i = state.floats.length - 1; i >= 0; i--) {
        var f = state.floats[i];
        f.t += dt;
        if (f.t > 1) { state.floats.splice(i, 1); continue; }
        gctx.font = '14px ' + FONT;
        gctx.fillStyle = f.bad ? '#ff6b6b' : '#7dff9b';
        gctx.fillText(f.txt, f.x, f.y - f.t * 46);
      }

      if (state.shakes > 0) {
        state.shakes--;
        gArea.classList.add('shake');
        setTimeout(function () { gArea.classList.remove('shake'); }, 340);
      }

      state.raf = requestAnimationFrame(gLoop);
    }

    function endGame(reason) {
      state.running = false;
      state.over = true;
      gameActive = false;
      cancelAnimationFrame(state.raf);
      var best = parseInt(localStorage.getItem('kaplun-best') || '0', 10);
      var newBest = state.score > best;
      localStorage.setItem('kaplun-best', String(state.score));
      gBest.textContent = Math.max(best, state.score);
      gOverTitle.textContent = reason === 'bust' ? '💥 OVER-EATEN!' : '⏱ Time up!';
      gOverSub.textContent = reason === 'bust'
        ? 'You hit 2,000 kcal. The donut won. It usually does.'
        : (newBest ? 'New personal best — you beat the budget like a champ.'
                   : 'Solid run. The donut is watching, impressed.');
      gStScore.textContent = state.score;
      gStFoods.textContent = state.foods;
      gStKcal.textContent = state.kcal.toLocaleString();
      gOver.classList.add('show');
      gStart.textContent = 'Play again';
    }

    gStart.addEventListener('click', function () {
      if (state) cancelAnimationFrame(state.raf);
      newGame();
    });
    gAgain.addEventListener('click', function () {
      if (state) cancelAnimationFrame(state.raf);
      newGame();
    });
  }

  /* ---------- Soundboard: press a key to record ---------- */
  var sbGrid = $('sb-grid');
  if (sbGrid) {
    var SB_KEYS = ['1', '2', '3', '4', '5', '6'];
    var SB_TONES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    var SB_ICOS = ['🎛️', '🥁', '🔔', '🪇', '🎙️', '🕹️'];
    var SB_MAX = 8000;
    var sbPads = [], sbUrl = {}, sbRec = null, sbStatus = $('sb-status'),
        sbReset = $('sb-reset'), sbMedia = null, sbHolder = null, sbHoldT = null, sbPlaySet = [];

    function sbMap() { /* harmonic sq+sin for a nicer default blip */
      var sr = 44100, n = Math.floor(sr * 0.55), out = new Float32Array(n);
      var fA = [1, 2, 3], gA = [1, 0.6, 0.25], sA = [0.5, 0.35, 0.2];
      for (var h = 0; h < 3; h++) {
        for (var i = 0; i < n; i++) {
          var t = i / sr;
          var env = Math.min(1, t / 0.01) * Math.pow(1 - t / 0.55, 2);
          out[i] += sA[h] * (Math.sin(2 * Math.PI * fA[h] * 180 * t) > 0 ? gA[h] : -gA[h]) * env;
        }
      }
      var data = new ArrayBuffer(44 + out.length * 2); var dv = new DataView(data);
      dv.setUint32(0, 0x46464952, false); dv.setUint32(4, 36 + out.length * 2, true); dv.setUint32(8, 0x57415645, false);
      dv.setUint32(12, 0x666d7420, false); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
      dv.setUint32(36, 0x64617461, false); dv.setUint32(40, out.length * 2, true);
      for (var j = 0; j < out.length; j++) dv.setInt16(44 + j * 2, (out[j] * 22000) | 0, true);
      return new Blob([data], { type: 'audio/wav' });
    }

    /* IndexedDB persistence */
    function idb() {
      return new Promise(function (res, rej) {
        var rq = indexedDB.open('kaplun-sb', 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore('sounds'); };
        rq.onsuccess = function () { res(rq.result); };
        rq.onerror = function () { rej(rq.error); };
      });
    }
    function dbPut(key, blob) {
      return idb().then(function (db) {
        return new Promise(function (res, rej) {
          var tx = db.transaction('sounds', 'readwrite');
          tx.objectStore('sounds').put(blob, key);
          tx.oncomplete = res; tx.onerror = function () { rej(tx.error); };
        });
      });
    }
    function dbGet(key) {
      return idb().then(function (db) {
        return new Promise(function (res, rej) {
          var rq = db.transaction('sounds').objectStore('sounds').get(key);
          rq.onsuccess = function () { res(rq.result); };
          rq.onerror = function () { rej(rq.error); };
        });
      });
    }
    function dbDel(key) {
      return idb().then(function (db) {
        return new Promise(function (res, rej) {
          var tx = db.transaction('sounds', 'readwrite');
          tx.objectStore('sounds').delete(key);
          tx.oncomplete = res; tx.onerror = function () { rej(tx.error); };
        });
      });
    }

    function sbLoad(i) {
      dbGet('sb-' + i).then(function (blob) { if (blob) sbSet(i, blob); }).catch(function () {});
    }
    function sbSet(i, blob) {
      if (sbUrl[i]) URL.revokeObjectURL(sbUrl[i]);
      sbUrl[i] = URL.createObjectURL(blob);
      sbPads[i].classList.remove('rec', 'play');
      sbPads[i].querySelector('.sb-hint').textContent = '• ' + Math.round(blob.size / 1024) + ' KB · tap to play';
    }
    function sbPlay(i) {
      if (!sbUrl[i]) return;
      while (sbPlaySet.length) { sbPlaySet.pop().pause(); }
      var a = new Audio(sbUrl[i]);
      a.volume = 1;
      sbPlaySet.push(a);
      sbPads[i].classList.add('play');
      a.onended = function () { sbPads[i].classList.remove('play'); var k = sbPlaySet.indexOf(a); if (k !== -1) sbPlaySet.splice(k, 1); };
      a.play();
    }
    function sbEnsureMic() {
      if (sbMedia) return Promise.resolve();
      return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
        .then(function (s) { sbMedia = s; })
        .catch(function () {
          toast('🎙️ Mic blocked — allow microphone access for this site, then try again.');
          throw new Error('mic');
        });
    }
    function sbStartRec(i) {
      if (sbRec !== null) return;
      if (!sbMedia) {
        sbEnsureMic().then(function () { sbStartRec(i); }).catch(function () {});
        return;
      }
      var mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].filter(function (m) { return window.MediaRecorder && MediaRecorder.isTypeSupported(m); })[0] || '';
      var rec;
      try { rec = new MediaRecorder(sbMedia, mime ? { mimeType: mime } : undefined); }
      catch (err) { rec = new MediaRecorder(sbMedia); }
      var chunks = [];
      rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onerror = function () { try { rec.stop(); } catch (e2) {} };
      rec.onstop = function () {
        var blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        sbSet(i, blob);
        dbPut('sb-' + i, blob).then(function () { if (sbStatus) sbStatus.textContent = 'Saved pad ' + (i + 1) + ' — tap or key ' + SB_KEYS[i] + ' to play.'; }).catch(function () {});
        sbPads[i].classList.remove('rec');
        sbRec = null;
        sbStopHoldTimer();
      };
      rec.start();
      sbPads[i].classList.add('rec');
      sbPads[i].querySelector('.sb-hint').textContent = '🔴 REC …';
      if (sbStatus) sbStatus.textContent = 'Recording pad ' + (i + 1) + '…';
      sbRec = {
        i: i, rec: rec,
        timer: setTimeout(function () {
          if (sbRec && sbRec.i === i && sbRec.rec && sbRec.rec.state !== 'inactive') sbRec.rec.stop();
        }, SB_MAX)
      };
    }

    function sbStopRec(i) {
      if (!sbRec || sbRec.i !== i) return;
      clearTimeout(sbRec.timer);
      if (sbRec.rec && sbRec.rec.state !== 'inactive') sbRec.rec.stop();
    }

    function sbHoldStart(i) {
      if (sbHolder !== null) return;
      if (sbRec !== null) return;
      sbHolder = i;
      sbHoldT = setTimeout(function () {
        if (sbHolder !== i) return;
        sbHolder = null; sbHoldT = null;
        sbStartRec(i);
      }, 350);
    }
    function sbHoldEnd(i) {
      if (sbHoldT !== null && sbHolder === i) {
        clearTimeout(sbHoldT); sbHoldT = null; sbHolder = null;
        sbPlay(i);
        return;
      }
      if (sbRec && sbRec.i === i) {
        sbHolder = null;
        sbStopRec(i);
      }
    }
    function sbStopHoldTimer() { if (sbHoldT) { clearTimeout(sbHoldT); sbHoldT = null; sbHolder = null; } }

    for (var s = 0; s < 6; s++) {
      (function (i) {
        var pad = document.createElement('div');
        pad.className = 'sb-pad';
        pad.innerHTML = '<span class="sb-rec-dot"></span><span class="sb-key">' + SB_KEYS[i] + '</span>' +
          '<span class="sb-ico">' + SB_ICOS[i] + '</span><span class="sb-name">PAD ' + (i + 1) + '</span><span class="sb-hint">default tone</span>';
        sbGrid.appendChild(pad);
        sbPads.push(pad);
        pad.addEventListener('pointerdown', function () { sbHoldStart(i); });
        pad.addEventListener('pointerup', function () { sbHoldEnd(i); });
        pad.addEventListener('pointerleave', function () { sbHoldEnd(i); });
        sbSet(i, sbMap());
        sbLoad(i);
      })(s);
    }

    document.addEventListener('keydown', function (e) {
      var inInput2 = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT');
      if (inInput2 || e.repeat) return;
      var i2 = SB_KEYS.indexOf(e.key);
      if (i2 !== -1) sbHoldStart(i2);
    });
    document.addEventListener('keyup', function (e) {
      var i3 = SB_KEYS.indexOf(e.key);
      if (i3 !== -1) sbHoldEnd(i3);
    });

    if (sbReset) sbReset.addEventListener('click', function () {
      for (var i = 0; i < 6; i++) {
        dbDel('sb-' + i).catch(function () {});
        sbSet(i, sbMap());
      }
      if (sbStatus) sbStatus.textContent = 'All pads reset to default tones.';
    });
  }
})();