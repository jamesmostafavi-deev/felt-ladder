(function () {
  "use strict";
  var KEY = "felt-ladder-v1";
  var R = "AKQJT98765432";
  var view = document.getElementById("view");

  // ---------- state ----------
  function blank() {
    return { v: 1, lessons: {}, pre: [], preTotal: { n: 0, ok: 0 }, odds: [], oddsTotal: { n: 0, ok: 0 },
      quiz: {}, sessions: [], players: [], days: [], unlockAll: false, celebrated: {}, created: today() };
  }
  var S;
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = blank(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Could not save. Storage may be full or blocked."); } }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function studied() { var t = today(); if (S.days.indexOf(t) < 0) { S.days.push(t); if (S.days.length > 400) S.days.shift(); } }
  function streak() {
    var set = {}; S.days.forEach(function (d) { set[d] = 1; });
    var d = new Date(), n = 0;
    if (!set[fmt(d)]) d.setDate(d.getDate() - 1);
    while (set[fmt(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function fmt(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function money(n) { var s = Math.abs(n) >= 1000 ? Math.round(Math.abs(n)).toLocaleString() : (Math.round(Math.abs(n) * 100) / 100).toString(); return (n < 0 ? "-$" : "$") + s; }
  function sum(a) { return a.reduce(function (x, y) { return x + (y ? 1 : 0); }, 0); }

  var tt;
  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 2600); }

  // ---------- ranges ----------
  function parse(str) {
    var set = {};
    str.split(/\s+/).forEach(function (tok) {
      var m = tok.match(/^([AKQJT2-9])\1(\+)?$/);
      if (m) { var i = R.indexOf(m[1]); for (var k = m[2] ? 0 : i; k <= i; k++) set[R[k] + R[k]] = 1; return; }
      m = tok.match(/^([AKQJT2-9])([AKQJT2-9])([so])(\+)?$/);
      if (m) { var x = R.indexOf(m[1]), y = R.indexOf(m[2]); for (var j = m[4] ? x + 1 : y; j <= y; j++) set[m[1] + R[j] + m[3]] = 1; }
    });
    return set;
  }
  var SETS = {}; Object.keys(FL.RANGES).forEach(function (p) { SETS[p] = parse(FL.RANGES[p]); });
  function label(i, j) { return i === j ? R[i] + R[j] : i < j ? R[i] + R[j] + "s" : R[j] + R[i] + "o"; }
  function combos(h) { return h.length === 2 ? 6 : h[2] === "s" ? 4 : 12; }

  // ---------- progress ----------
  function stage(id) { return FL.STAGES.filter(function (s) { return s.id === id; })[0]; }
  function allLessons() { var a = []; FL.STAGES.forEach(function (s) { s.lessons.forEach(function (l) { a.push({ l: l, s: s }); }); }); return a; }
  function reqs(s) {
    var done = s.lessons.filter(function (l) { return S.lessons[l.id]; }).length;
    var out = [{ label: "Finish all " + s.lessons.length + " lessons", detail: done + " of " + s.lessons.length, done: done === s.lessons.length, href: "#learn" }];
    if (s.id === "s1") {
      var p = sum(S.pre.slice(-50)), pn = Math.min(S.pre.length, 50);
      var o = sum(S.odds.slice(-20)), on = Math.min(S.odds.length, 20);
      out.push({ label: "Starting hands: 45 of your last 50", detail: p + " of last " + pn, done: pn >= 50 && p >= 45, href: "#drill-preflop" });
      out.push({ label: "Pot odds: 18 of your last 20", detail: o + " of last " + on, done: on >= 20 && o >= 18, href: "#drill-odds" });
    }
    if (s.id === "s2") {
      out.push({ label: "Log 5 sessions", detail: Math.min(S.sessions.length, 5) + " of 5", done: S.sessions.length >= 5, href: "#sessions" });
      out.push({ label: "Add 3 players", detail: Math.min(S.players.length, 3) + " of 3", done: S.players.length >= 3, href: "#players" });
    }
    var best = S.quiz[s.id] || 0;
    out.push({ label: "Stage test: 7 of 8", detail: "Best " + best + " of 8", done: best >= 7, href: "#quiz-" + s.id });
    return out;
  }
  function complete(s) { return reqs(s).every(function (r) { return r.done; }); }
  function unlocked(s) { return s.n === 1 || S.unlockAll || complete(FL.STAGES[s.n - 2]); }
  function current() { for (var i = 0; i < FL.STAGES.length; i++) if (!complete(FL.STAGES[i])) return FL.STAGES[i]; return null; }
  function rankName() { var c = current(); return c ? c.name : "Pro"; }
  function checkCelebrate() {
    FL.STAGES.forEach(function (s) {
      if (complete(s) && !S.celebrated[s.id]) { S.celebrated[s.id] = 1; save(); toast("Stage " + s.n + " complete. " + (FL.STAGES[s.n] ? FL.STAGES[s.n].name + " unlocked." : "You finished the ladder.")); }
    });
  }

  // ---------- views ----------
  var routes = {};
  function render() {
    var h = (location.hash || "#home").slice(1), parts = h.split("-"), name = parts[0], arg = parts.slice(1).join("-");
    var fn = routes[name] || routes.home;
    view.innerHTML = "";
    fn(arg);
    var tab = { home: "home", learn: "learn", lesson: "learn", playbook: "learn", sources: "learn", drills: "drills", chart: "drills", drill: "drills", quiz: "drills", sessions: "sessions", players: "players" }[name] || "";
    document.querySelectorAll(".tabs a").forEach(function (a) { if (a.dataset.tab === tab) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo(0, 0);
  }
  function html(s) { view.insertAdjacentHTML("beforeend", s); }
  function back(href, text) { return '<a href="' + href + '" class="muted" style="text-decoration:none;font-size:14px">‹ ' + text + "</a>"; }

  routes.home = function () {
    var c = current(), total = 0, done = 0;
    FL.STAGES.forEach(function (s) { reqs(s).forEach(function (r) { total++; if (r.done) done++; }); });
    var net = S.sessions.reduce(function (a, x) { return a + (x.cashout - x.buyin); }, 0);
    var preN = Math.min(S.pre.length, 50), oddsN = Math.min(S.odds.length, 20);
    html('<div class="panel felt"><span class="eyebrow">Your level</span><div class="spread"><h1>' + rankName() + '</h1><span class="mono">' + streak() + " day streak</span></div>" +
      '<div class="bar"><span style="width:' + Math.round(done / total * 100) + '%"></span></div><span class="muted" style="font-size:14px">' + done + " of " + total + " milestones on the ladder</span>" +
      (deferredInstall ? '<button class="btn" id="install">Install app</button>' : "") + "</div>");
    if (c) {
      var next = c.lessons.filter(function (l) { return !S.lessons[l.id] && unlocked(c); })[0];
      var nr = reqs(c).filter(function (r) { return !r.done; })[0];
      var href = next ? "#lesson-" + next.id : nr.href, title = next ? next.title : nr.label, sub = next ? "Lesson · " + next.short : nr.detail;
      html('<a class="panel" href="' + href + '"><span class="eyebrow">Next up</span><div class="spread nowrap"><h2>' + esc(title) + '</h2><span class="chev muted">›</span></div><span class="muted">' + esc(sub) + "</span></a>");
      html('<div class="stack"><div class="spread"><h3>Stage ' + c.n + ": " + c.name + '</h3><span class="eyebrow">' + c.span + '</span></div><p class="muted" style="font-size:14.5px">' + c.goal + '</p><div class="list">' +
        reqs(c).map(function (r) { return '<a class="item" href="' + r.href + '"><span class="dot' + (r.done ? " done" : "") + '">' + (r.done ? "✓" : "") + '</span><span><div class="it">' + r.label + '</div><div class="is">' + r.detail + '</div></span><span class="chev">›</span></a>'; }).join("") + "</div></div>");
    } else {
      html('<div class="panel"><h2>Ladder complete</h2><p>You finished every stage. Keep logging sessions, keep your player notes current, and keep a study routine going.</p></div>');
    }
    html('<div class="stats">' +
      '<div class="stat"><span class="v">' + (preN ? Math.round(sum(S.pre.slice(-50)) / preN * 100) + "%" : "–") + '</span><span class="k">Starting hands, last ' + (preN || 50) + "</span></div>" +
      '<div class="stat"><span class="v">' + (oddsN ? Math.round(sum(S.odds.slice(-20)) / oddsN * 100) + "%" : "–") + '</span><span class="k">Pot odds, last ' + (oddsN || 20) + "</span></div>" +
      '<div class="stat"><span class="v ' + (net > 0 ? "pos" : net < 0 ? "neg" : "") + '">' + (S.sessions.length ? money(net) : "–") + '</span><span class="k">Net from ' + S.sessions.length + " sessions</span></div></div>");
    html('<div class="row"><a class="btn primary big" href="#drill-preflop">Quick drill: hands</a><a class="btn big" href="#drill-odds">Quick drill: odds</a></div>');
    var ib = document.getElementById("install");
    if (ib) ib.onclick = function () { deferredInstall.prompt(); deferredInstall.userChoice.finally(function () { deferredInstall = null; render(); }); };
  };

  routes.learn = function () {
    html("<h1>Learn</h1>");
    FL.STAGES.forEach(function (s) {
      var open = unlocked(s), d = s.lessons.filter(function (l) { return S.lessons[l.id]; }).length;
      html('<div class="stack"><div class="spread"><h2>' + s.n + ". " + s.name + '</h2><span class="pill ' + (complete(s) ? "" : open ? "gold" : "grey") + '">' + (complete(s) ? "Complete" : open ? d + " of " + s.lessons.length : "Locked") + "</span></div>" +
        '<p class="muted" style="font-size:14.5px">' + s.span + ". " + s.goal + "</p>" +
        (open ? "" : '<p style="font-size:14px">Finish stage ' + (s.n - 1) + " to unlock. You can unlock all stages in Settings.</p>") +
        '<div class="list">' + s.lessons.map(function (l) {
          var dn = !!S.lessons[l.id];
          return open ? '<a class="item" href="#lesson-' + l.id + '"><span class="dot' + (dn ? " done" : "") + '">' + (dn ? "✓" : "") + '</span><span><div class="it">' + l.title + '</div><div class="is">' + l.short + '</div></span><span class="chev">›</span></a>'
            : '<div class="item"><span class="dot lock">🔒</span><span><div class="it muted">' + l.title + '</div><div class="is">' + l.short + "</div></span><span></span></div>";
        }).join("") +
        (open ? '<a class="item" href="#quiz-' + s.id + '"><span class="dot' + ((S.quiz[s.id] || 0) >= 7 ? " done" : "") + '">' + ((S.quiz[s.id] || 0) >= 7 ? "✓" : "?") + '</span><span><div class="it">Stage test</div><div class="is">8 questions · best ' + (S.quiz[s.id] || 0) + ' of 8</div></span><span class="chev">›</span></a>' : "") +
        "</div>" +
        (open ? '<details class="panel"><summary><b>Reading for this stage</b></summary>' + s.reading.map(function (b) { return "<div><b>" + b[0] + '</b> <span class="muted mono" style="font-size:12px">' + b[1] + '</span><p class="muted" style="font-size:14.5px">' + b[2] + "</p></div>"; }).join("") + "</details>" : "") +
        "</div>");
    });
    html('<div class="list"><a class="item" href="#playbook"><span class="dot">♠</span><span><div class="it">Home game playbook</div><div class="is">Player types and house rules for beating friends</div></span><span class="chev">›</span></a>' +
      '<a class="item" href="#sources"><span class="dot">i</span><span><div class="it">Sources</div><div class="is">Where this program comes from</div></span><span class="chev">›</span></a></div>');
  };

  routes.lesson = function (id) {
    var found = allLessons().filter(function (x) { return x.l.id === id; })[0];
    if (!found) { location.hash = "#learn"; return; }
    var l = found.l, s = found.s;
    if (!unlocked(s)) { html(back("#learn", "Learn") + "<h1>Locked</h1><p>Finish stage " + (s.n - 1) + " first, or unlock all stages in Settings.</p>"); return; }
    var idx = s.lessons.indexOf(l), nxt = s.lessons[idx + 1], dn = !!S.lessons[l.id];
    html(back("#learn", "Stage " + s.n + ": " + s.name) +
      '<div class="stack"><span class="eyebrow">Lesson ' + (idx + 1) + " of " + s.lessons.length + "</span><h1>" + l.title + "</h1></div>" +
      '<div class="lesson">' + l.body.map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>" +
      (l.tip ? '<div class="callout"><span class="eyebrow">Try it</span><span>' + l.tip + "</span>" + (l.drill ? '<a href="#drill-' + l.drill + '">Open the drill ›</a>' : "") + "</div>" : "") +
      (l.sources ? '<div class="srcs"><span class="eyebrow">Sources</span>' + l.sources.map(function (x) { return '<a href="' + x[1] + '" target="_blank" rel="noopener">' + x[0] + "</a>"; }).join("") + "</div>" : "") +
      '<div class="row"><button class="btn ' + (dn ? "" : "primary") + ' big" id="mark">' + (dn ? "Completed ✓ (tap to undo)" : "Mark complete") + "</button></div>" +
      (nxt ? '<a class="panel" href="#lesson-' + nxt.id + '"><span class="eyebrow">Next lesson</span><div class="spread nowrap"><b>' + nxt.title + '</b><span class="chev muted">›</span></div></a>'
        : '<a class="panel" href="#quiz-' + s.id + '"><span class="eyebrow">Last lesson in this stage</span><div class="spread nowrap"><b>Take the stage test</b><span class="chev muted">›</span></div></a>'));
    document.getElementById("mark").onclick = function () {
      if (S.lessons[l.id]) delete S.lessons[l.id]; else { S.lessons[l.id] = today(); studied(); }
      save(); checkCelebrate();
      if (S.lessons[l.id] && nxt) location.hash = "#lesson-" + nxt.id; else render();
    };
  };

  routes.drills = function () {
    var preN = Math.min(S.pre.length, 50), oddsN = Math.min(S.odds.length, 20);
    html("<h1>Drills</h1>");
    html('<div class="list">' +
      '<a class="item" href="#drill-preflop"><span class="dot">A</span><span><div class="it">Starting hands quiz</div><div class="is">Raise or fold from each seat · last ' + preN + ": " + sum(S.pre.slice(-50)) + " correct · " + S.preTotal.n + ' all time</div></span><span class="chev">›</span></a>' +
      '<a class="item" href="#drill-odds"><span class="dot">%</span><span><div class="it">Pot odds drill</div><div class="is">Call or fold with a draw · last ' + oddsN + ": " + sum(S.odds.slice(-20)) + " correct · " + S.oddsTotal.n + ' all time</div></span><span class="chev">›</span></a>' +
      '<a class="item" href="#chart"><span class="dot">▦</span><span><div class="it">Starting hands chart</div><div class="is">Reference for every seat</div></span><span class="chev">›</span></a></div>');
    html('<h2>Stage tests</h2><div class="list">' + FL.STAGES.map(function (s) {
      var open = unlocked(s), b = S.quiz[s.id] || 0;
      return open ? '<a class="item" href="#quiz-' + s.id + '"><span class="dot' + (b >= 7 ? " done" : "") + '">' + (b >= 7 ? "✓" : s.n) + '</span><span><div class="it">' + s.name + '</div><div class="is">Best ' + b + ' of 8</div></span><span class="chev">›</span></a>'
        : '<div class="item"><span class="dot lock">🔒</span><span><div class="it muted">' + s.name + '</div><div class="is">Locked</div></span><span></span></div>';
    }).join("") + "</div>");
  };

  routes.chart = function () {
    var cur = "BTN"; try { cur = localStorage.getItem("fl-pos") || "BTN"; } catch (e) {}
    if (!SETS[cur]) cur = "BTN";
    html(back("#drills", "Drills") + "<h1>Starting hands</h1><p class=\"muted\" style=\"font-size:14.5px\">Hands to raise when everyone folds to you, 6-handed, about 100 big blinds. Suited hands sit above the gold pairs, offsuit below. At a 9-handed table, use UTG for the first three seats. Simplified from common solver-based charts.</p>" +
      '<div class="panel"><div class="seg" id="seg"></div><div class="gridbox"><div class="grid" id="grid"></div></div><span class="mono muted" id="pct" style="font-size:13px"></span></div>');
    var seg = document.getElementById("seg");
    Object.keys(FL.RANGES).forEach(function (p) {
      var b = document.createElement("button"); b.textContent = p; b.dataset.p = p;
      b.onclick = function () { cur = p; try { localStorage.setItem("fl-pos", p); } catch (e) {} draw(); };
      seg.appendChild(b);
    });
    function draw() {
      Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", b.dataset.p === cur ? "true" : "false"); });
      var g = document.getElementById("grid"), c = 0, out = "";
      for (var i = 0; i < 13; i++) for (var j = 0; j < 13; j++) {
        var h = label(i, j), inR = !!SETS[cur][h]; if (inR) c += combos(h);
        out += '<div class="cell' + (inR ? " in" : "") + (i === j ? " pair" : "") + '">' + h + "</div>";
      }
      g.innerHTML = out;
      document.getElementById("pct").textContent = FL.POSNAME[cur] + ": raise " + (c / 1326 * 100).toFixed(1) + "% of hands";
    }
    draw();
  };

  var SUITS = [["♠", 0], ["♥", 1], ["♣", 0], ["♦", 1]];
  function cardHTML(r, s, sm) { return '<div class="card' + (s[1] ? " red" : "") + (sm ? " sm" : "") + '">' + (r === "T" ? "10" : r) + s[0] + "</div>"; }

  routes.drill = function (which) {
    if (which === "odds") return oddsDrill();
    var q, sess = { n: 0, ok: 0 };
    html(back("#drills", "Drills") + '<div class="spread"><h1>Raise or fold?</h1><span class="mono muted" id="sc"></span></div>' +
      '<div class="table"><div class="cards" id="cards"></div><dl class="facts"><dt>Seat</dt><dd id="pos"></dd><dt>Action</dt><dd>Everyone before you folded.</dd><dt>Hand</dt><dd class="mono" id="hand"></dd></dl></div>' +
      '<div class="row" id="btns"><button class="btn primary big" id="r">Raise</button><button class="btn warn big" id="f">Fold</button></div><div id="res"></div>');
    function score() { var n = Math.min(S.pre.length, 50); document.getElementById("sc").textContent = "This run " + sess.ok + "/" + sess.n + " · last " + n + ": " + sum(S.pre.slice(-50)); }
    function next() {
      var a = Math.floor(Math.random() * 52), b; do { b = Math.floor(Math.random() * 52); } while (b === a);
      var ra = Math.floor(a / 4), rb = Math.floor(b / 4), sa = a % 4, sb = b % 4, hi = Math.min(ra, rb), lo = Math.max(ra, rb);
      var h = ra === rb ? R[hi] + R[lo] : R[hi] + R[lo] + (sa === sb ? "s" : "o");
      var ps = Object.keys(FL.RANGES), p = ps[Math.floor(Math.random() * ps.length)];
      q = { h: h, p: p, raise: !!SETS[p][h] };
      document.getElementById("cards").innerHTML = cardHTML(R[ra], SUITS[sa]) + cardHTML(R[rb], SUITS[sb]);
      document.getElementById("pos").textContent = FL.POSNAME[p];
      document.getElementById("hand").textContent = h;
      document.getElementById("res").innerHTML = "";
      document.getElementById("r").disabled = false; document.getElementById("f").disabled = false;
      score();
    }
    function answer(raise) {
      var good = raise === q.raise; sess.n++; if (good) sess.ok++;
      S.pre.push(good); if (S.pre.length > 50) S.pre.shift(); S.preTotal.n++; if (good) S.preTotal.ok++; studied(); save(); checkCelebrate();
      document.getElementById("r").disabled = true; document.getElementById("f").disabled = true;
      document.getElementById("res").innerHTML = '<div class="verdict ' + (good ? "ok" : "bad") + '"><b>' + (good ? "Correct." : "Not quite.") + "</b><span>" + q.h + " is a " + (q.raise ? "raise" : "fold") + " from the " + FL.POSNAME[q.p].toLowerCase() + "." + "</span></div>" +
        '<button class="btn block" id="nx" style="margin-top:10px">Next hand</button>';
      document.getElementById("nx").onclick = next; document.getElementById("nx").focus();
      score();
    }
    document.getElementById("r").onclick = function () { answer(true); };
    document.getElementById("f").onclick = function () { answer(false); };
    next();
  };

  function oddsDrill() {
    var DRAWS = [["a gutshot straight draw", 4], ["two overcards", 6], ["an open-ended straight draw", 8], ["a flush draw", 9], ["a flush draw plus a gutshot", 12], ["a flush draw plus an open-ender", 15]];
    var FR = [0.33, 0.5, 0.75, 1, 1.5], o, sess = { n: 0, ok: 0 };
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function pct(x) { return (x * 100).toFixed(1) + "%"; }
    html(back("#drills", "Drills") + '<div class="spread"><h1>Call or fold?</h1><span class="mono muted" id="sc"></span></div>' +
      '<p class="muted" style="font-size:14.5px">Use only the cards to come. Implied odds are left out so you learn the base math.</p>' +
      '<div class="table"><dl class="facts" id="facts"></dl></div>' +
      '<div class="row"><button class="btn primary big" id="c">Call</button><button class="btn warn big" id="f">Fold</button></div><div id="res"></div>');
    function score() { var n = Math.min(S.odds.length, 20); document.getElementById("sc").textContent = "This run " + sess.ok + "/" + sess.n + " · last " + n + ": " + sum(S.odds.slice(-20)); }
    function next() {
      var d = pick(DRAWS), turn = Math.random() < 0.55, pot = (Math.floor(Math.random() * 17) + 4) * 10, bet;
      if (turn) bet = Math.round(pot * pick(FR)); else bet = Math.round(pot * pick([0.75, 1, 1.5, 2]) / 5) * 5;
      var eq = turn ? d[1] / 46 : 1 - ((47 - d[1]) / 47) * ((46 - d[1]) / 46);
      o = { d: d, turn: turn, pot: pot, bet: bet, eq: eq, need: bet / (pot + 2 * bet) };
      document.getElementById("facts").innerHTML = "<dt>Street</dt><dd>" + (turn ? "Turn. One card to come." : "Flop. They are all-in, so you see both cards.") + "</dd>" +
        "<dt>Your hand</dt><dd>" + d[0] + " (" + d[1] + " outs)</dd><dt>Pot</dt><dd class=\"mono\">$" + pot + " before the bet</dd><dt>Bet</dt><dd class=\"mono\">$" + bet + (turn ? "" : " all-in") + "</dd>";
      document.getElementById("res").innerHTML = "";
      document.getElementById("c").disabled = false; document.getElementById("f").disabled = false;
      score();
    }
    function answer(call) {
      var right = o.eq > o.need, good = call === right; sess.n++; if (good) sess.ok++;
      S.odds.push(good); if (S.odds.length > 20) S.odds.shift(); S.oddsTotal.n++; if (good) S.oddsTotal.ok++; studied(); save(); checkCelebrate();
      document.getElementById("c").disabled = true; document.getElementById("f").disabled = true;
      document.getElementById("res").innerHTML = '<div class="verdict ' + (good ? "ok" : "bad") + '"><b>' + (good ? "Correct." : "Not quite.") + " " + (right ? "Call" : "Fold") + " is right.</b>" +
        "<span>Price: $" + o.bet + " to win a final pot of $" + (o.pot + 2 * o.bet) + ". You need <b class=\"mono\">" + pct(o.need) + "</b>.</span>" +
        "<span>Equity: " + o.d[1] + " × " + (o.turn ? 2 : 4) + " ≈ <b class=\"mono\">" + o.d[1] * (o.turn ? 2 : 4) + "%</b> (exact " + pct(o.eq) + ").</span></div>" +
        '<button class="btn block" id="nx" style="margin-top:10px">Next spot</button>';
      document.getElementById("nx").onclick = next; document.getElementById("nx").focus();
      score();
    }
    document.getElementById("c").onclick = function () { answer(true); };
    document.getElementById("f").onclick = function () { answer(false); };
    next();
  }

  routes.quiz = function (sid) {
    var s = stage(sid); if (!s) { location.hash = "#drills"; return; }
    if (!unlocked(s)) { html(back("#drills", "Drills") + "<h1>Locked</h1><p>Finish stage " + (s.n - 1) + " first.</p>"); return; }
    var qs = s.quiz.slice().sort(function () { return Math.random() - 0.5; }), i = 0, ok = 0;
    html(back("#learn", "Learn") + '<div class="spread"><h1>Stage ' + s.n + ' test</h1><span class="mono muted" id="qn"></span></div><div id="qbox" class="stack"></div>');
    function show() {
      var box = document.getElementById("qbox");
      if (i >= qs.length) {
        var prev = S.quiz[sid] || 0; if (ok > prev) S.quiz[sid] = ok; studied(); save();
        box.innerHTML = '<div class="panel ' + (ok >= 7 ? "felt" : "") + '"><span class="eyebrow">Result</span><h1>' + ok + ' of 8</h1><p>' + (ok >= 7 ? "Passed." : "You need 7 to pass. Review the lessons and try again.") + "</p></div>" +
          '<div class="row"><button class="btn big" id="again">Try again</button><a class="btn primary big" href="#home">Home</a></div>';
        document.getElementById("qn").textContent = "";
        document.getElementById("again").onclick = render;
        checkCelebrate();
        return;
      }
      var q = qs[i];
      document.getElementById("qn").textContent = (i + 1) + " / " + qs.length;
      box.innerHTML = '<p style="font-size:18px;font-family:var(--f-body)">' + q.q + '</p><div class="choices">' + q.a.map(function (a, k) { return '<button class="choice" data-k="' + k + '">' + a + "</button>"; }).join("") + '</div><div id="why"></div>';
      box.querySelectorAll(".choice").forEach(function (b) {
        b.onclick = function () {
          var k = +b.dataset.k, good = k === q.c; if (good) ok++;
          box.querySelectorAll(".choice").forEach(function (x) { x.disabled = true; if (+x.dataset.k === q.c) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
          document.getElementById("why").innerHTML = '<div class="verdict ' + (good ? "ok" : "bad") + '"><b>' + (good ? "Correct." : "Not quite.") + "</b><span>" + q.why + '</span></div><button class="btn primary block" id="nq" style="margin-top:10px">' + (i + 1 < qs.length ? "Next question" : "See result") + "</button>";
          document.getElementById("nq").onclick = function () { i++; show(); };
          document.getElementById("nq").focus();
        };
      });
    }
    show();
  };

  routes.sessions = function () {
    var list = S.sessions.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var net = 0, hrs = 0; list.forEach(function (x) { net += x.cashout - x.buyin; hrs += +x.hours || 0; });
    html('<h1>Sessions</h1><div class="stats"><div class="stat"><span class="v ' + (net > 0 ? "pos" : net < 0 ? "neg" : "") + '">' + money(net) + '</span><span class="k">Net result</span></div>' +
      '<div class="stat"><span class="v">' + (hrs ? money(net / hrs) : "–") + '</span><span class="k">Per hour</span></div><div class="stat"><span class="v">' + list.length + '</span><span class="k">Sessions · ' + Math.round(hrs * 10) / 10 + " hrs</span></div></div>");
    if (list.length >= 2) {
      var W = 640, H = 180, P = 28, cum = [0]; list.forEach(function (x) { cum.push(cum[cum.length - 1] + x.cashout - x.buyin); });
      var mn = Math.min.apply(null, cum), mx = Math.max.apply(null, cum); if (mx === mn) { mx += 1; mn -= 1; }
      var X = function (i) { return P + i * (W - 2 * P) / (cum.length - 1); }, Y = function (v) { return P / 2 + (mx - v) * (H - P) / (mx - mn); };
      var pts = cum.map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ");
      var last = cum[cum.length - 1];
      html('<div class="panel"><span class="eyebrow">Cumulative result</span><svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Cumulative result chart">' +
        '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--line)" stroke-dasharray="4 4"/>' +
        '<polygon points="' + X(0) + "," + Y(0) + " " + pts + " " + X(cum.length - 1) + "," + Y(0) + '" fill="var(--felt-soft)" opacity="0.8"/>' +
        '<polyline points="' + pts + '" fill="none" stroke="var(--felt)" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle cx="' + X(cum.length - 1) + '" cy="' + Y(last) + '" r="4.5" fill="' + (last >= 0 ? "var(--felt)" : "var(--suit)") + '"/>' +
        '<text x="' + P + '" y="' + (H - 4) + '" font-size="12" fill="var(--muted)" font-family="ui-monospace,monospace">' + esc(list[0].date) + "</text>" +
        '<text x="' + (W - P) + '" y="' + (H - 4) + '" font-size="12" fill="var(--muted)" text-anchor="end" font-family="ui-monospace,monospace">' + esc(list[list.length - 1].date) + "</text></svg>" +
        '<span class="muted" style="font-size:13px">Results swing a lot. Judge yourself over dozens of sessions, not a few.</span></div>');
    }
    html('<form class="panel" id="sf"><h3>Log a session</h3><div class="form">' +
      '<div class="field"><label for="s-date">Date</label><input id="s-date" type="date" required value="' + today() + '"></div>' +
      '<div class="field"><label for="s-hours">Hours played</label><input id="s-hours" type="number" step="0.25" min="0" inputmode="decimal" placeholder="3"></div>' +
      '<div class="field"><label for="s-in">Total buy-in ($)</label><input id="s-in" type="number" step="0.01" min="0" inputmode="decimal" required placeholder="40"></div>' +
      '<div class="field"><label for="s-out">Cash-out ($)</label><input id="s-out" type="number" step="0.01" min="0" inputmode="decimal" required placeholder="65"></div>' +
      '<div class="field full"><label for="s-note">Hands to review, notes</label><textarea id="s-note" placeholder="Called Mike\'s river shove with top pair. Was that right?"></textarea></div>' +
      '</div><button class="btn primary" type="submit">Save session</button></form>');
    if (list.length) {
      html('<div class="list">' + list.slice().reverse().map(function (x) {
        var r = x.cashout - x.buyin;
        return '<div class="item" style="grid-template-columns:minmax(0,1fr) auto"><span><div class="it mono">' + esc(x.date) + ' · <span class="' + (r > 0 ? "pos" : r < 0 ? "neg" : "") + '">' + money(r) + '</span></div><div class="is">' + (x.hours ? x.hours + " hrs · " : "") + "in " + money(x.buyin) + ", out " + money(x.cashout) + (x.note ? "<br>" + esc(x.note) : "") + '</div></span><button class="btn ghost" data-del="' + x.id + '">Delete</button></div>';
      }).join("") + "</div>");
    } else {
      html('<p class="muted">No sessions yet. Log your next home game above. Stage 2 asks for 5.</p>');
    }
    document.getElementById("sf").onsubmit = function (e) {
      e.preventDefault();
      var bi = parseFloat(document.getElementById("s-in").value), co = parseFloat(document.getElementById("s-out").value);
      if (isNaN(bi) || isNaN(co)) { toast("Enter both buy-in and cash-out."); return; }
      S.sessions.push({ id: uid(), date: document.getElementById("s-date").value || today(), buyin: bi, cashout: co, hours: parseFloat(document.getElementById("s-hours").value) || 0, note: document.getElementById("s-note").value.trim() });
      studied(); save(); checkCelebrate(); toast("Session saved"); render();
    };
    confirmDeletes("del", function (id) { S.sessions = S.sessions.filter(function (x) { return x.id !== id; }); save(); toast("Session deleted"); render(); });
  };

  function confirmDeletes(attr, fn) {
    view.querySelectorAll("[data-" + attr + "]").forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.armed) { fn(b.getAttribute("data-" + attr)); return; }
        b.dataset.armed = "1"; b.textContent = "Confirm"; b.classList.add("warn"); b.classList.remove("ghost");
        setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = "Delete"; b.classList.remove("warn"); b.classList.add("ghost"); } }, 3500);
      };
    });
  }

  routes.players = function () {
    html('<h1>Players</h1><p class="muted" style="font-size:14.5px">One entry per regular. Tag a type and the app shows how to play against them. Notes save as you type.</p>');
    var opts = Object.keys(FL.TYPES).map(function (k) { return '<option value="' + k + '">' + FL.TYPES[k].name + "</option>"; }).join("");
    html('<form class="panel" id="pf"><h3>Add a player</h3><div class="form">' +
      '<div class="field"><label for="p-name">Name</label><input id="p-name" required placeholder="Mike"></div>' +
      '<div class="field"><label for="p-type">Type</label><select id="p-type">' + opts + "</select></div>" +
      '<div class="field full"><label for="p-note">What you have seen</label><textarea id="p-note" placeholder="Limps a lot. Shows bluffs after two beers."></textarea></div>' +
      '</div><button class="btn primary" type="submit">Add player</button></form>');
    S.players.forEach(function (p) {
      var t = FL.TYPES[p.type] || FL.TYPES.unknown;
      html('<div class="panel"><div class="spread"><h2>' + esc(p.name) + '</h2><select class="pill" data-type="' + p.id + '" aria-label="Type for ' + esc(p.name) + '" style="border:0">' +
        Object.keys(FL.TYPES).map(function (k) { return '<option value="' + k + '"' + (k === p.type ? " selected" : "") + ">" + FL.TYPES[k].name + "</option>"; }).join("") + "</select></div>" +
        '<p class="muted" style="font-size:14px">' + t.tell + '</p><div class="callout"><span class="eyebrow">How to beat them</span><span>' + t.play + "</span></div>" +
        '<div class="field"><label for="n-' + p.id + '">Notes</label><textarea id="n-' + p.id + '" data-note="' + p.id + '">' + esc(p.note) + "</textarea></div>" +
        '<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-pdel="' + p.id + '">Delete</button></div></div>');
    });
    if (!S.players.length) html('<p class="muted">No players yet. Stage 2 asks for 3.</p>');
    html('<a class="panel" href="#playbook"><span class="eyebrow">Reference</span><div class="spread"><b>Home game playbook</b><span class="chev muted">›</span></div></a>');
    document.getElementById("pf").onsubmit = function (e) {
      e.preventDefault();
      var n = document.getElementById("p-name").value.trim(); if (!n) return;
      S.players.push({ id: uid(), name: n, type: document.getElementById("p-type").value, note: document.getElementById("p-note").value.trim() });
      save(); checkCelebrate(); toast(n + " added"); render();
    };
    view.querySelectorAll("[data-note]").forEach(function (ta) { ta.oninput = function () { var p = S.players.filter(function (x) { return x.id === ta.dataset.note; })[0]; if (p) { p.note = ta.value; save(); } }; });
    view.querySelectorAll("[data-type]").forEach(function (sel) { sel.onchange = function () { var p = S.players.filter(function (x) { return x.id === sel.dataset.type; })[0]; if (p) { p.type = sel.value; save(); render(); } }; });
    confirmDeletes("pdel", function (id) { S.players = S.players.filter(function (x) { return x.id !== id; }); save(); toast("Player deleted"); render(); });
  };

  routes.playbook = function () {
    html(back("#learn", "Learn") + '<h1>Home game playbook</h1><p class="lesson" style="font-size:17px">Your friends are not solvers. Play straightforward, solid poker and make one adjustment per player. Fancy plays are wasted on people who are not paying attention to what you represent.</p>');
    Object.keys(FL.TYPES).filter(function (k) { return k !== "unknown"; }).forEach(function (k) {
      var t = FL.TYPES[k];
      html('<div class="panel"><h3>' + t.name + '</h3><p class="muted" style="font-size:14.5px">' + t.tell + '</p><p style="font-size:15px">' + t.play + "</p></div>");
    });
    html("<h2>House rules for you</h2>" + '<div class="list">' + FL.HOME_RULES.map(function (r) { return '<div class="item" style="grid-template-columns:minmax(0,1fr)"><span><div class="it">' + r[0] + '</div><div class="is">' + r[1] + "</div></span></div>"; }).join("") + "</div>");
    html('<div class="srcs"><span class="eyebrow">Sources</span><a href="https://www.pokerlistings.com/poker-strategies/how-to-beat-your-friends-at-poker" target="_blank" rel="noopener">PokerListings: how to beat your friends</a><a href="https://pokerskill.com/c/strategy-guides/how-to-consistently-crush-poker-home-games-with-these-tips" target="_blank" rel="noopener">PokerSkill: crushing home games</a><a href="https://www.blackrain79.com/2025/01/how-to-beat-poker-home-games.html" target="_blank" rel="noopener">BlackRain79: how to beat home games</a></div>');
  };

  routes.sources = function () {
    html(back("#learn", "Learn") + '<h1>Sources</h1><p class="muted" style="font-size:14.5px">Most are strategy sites run by training companies or affiliates. Their numbers are rules of thumb and sometimes disagree. Where they did, this program uses the middle of the range.</p>' +
      '<div class="list">' + FL.SOURCES.map(function (s) { return '<a class="item" style="grid-template-columns:minmax(0,1fr) auto" href="' + s[1] + '" target="_blank" rel="noopener"><span class="it">' + s[0] + '</span><span class="chev">↗</span></a>'; }).join("") + "</div>");
  };

  routes.settings = function () {
    html(back("#home", "Home") + "<h1>Settings</h1>");
    html('<div class="panel"><h3>Install on your phone</h3><p style="font-size:15px"><b>iPhone:</b> open this page in Safari, tap Share, then Add to Home Screen.<br><b>Android:</b> open in Chrome, tap the menu, then Install app.<br><b>Computer:</b> in Chrome or Edge, click the install icon in the address bar.</p></div>');
    html('<div class="panel"><h3>Backup</h3><p style="font-size:15px" class="muted">Progress lives on this device. Export a backup file to move it to another device or keep it safe.</p><div class="row"><button class="btn primary" id="exp">Export backup</button><label class="btn" for="imp">Import backup</label><input id="imp" type="file" accept="application/json,.json" hidden></div></div>');
    html('<div class="panel"><h3>Stages</h3><label class="row" style="font-size:15px"><input type="checkbox" id="ua"' + (S.unlockAll ? " checked" : "") + '> Unlock all stages without passing tests</label></div>');
    html('<div class="panel"><h3>Reset</h3><p style="font-size:15px" class="muted">Erase all progress, sessions and players on this device.</p><div class="row"><button class="btn warn" id="rst">Erase everything</button></div></div>');
    html('<p class="muted" style="font-size:13px">If poker stops being fun or costs more than you can afford, the National Problem Gambling Helpline is 1-800-522-4700 (US).</p>');
    document.getElementById("ua").onchange = function (e) { S.unlockAll = e.target.checked; save(); toast(S.unlockAll ? "All stages unlocked" : "Stages lock until passed"); };
    document.getElementById("exp").onclick = function () {
      var blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "felt-ladder-backup-" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); toast("Backup exported");
    };
    document.getElementById("imp").onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { var d = JSON.parse(rd.result); if (!d || d.v !== 1) throw 0; S = Object.assign(blank(), d); save(); toast("Backup imported"); location.hash = "#home"; render(); }
        catch (err) { toast("That file is not a Felt Ladder backup."); }
      };
      rd.readAsText(f);
    };
    var rst = document.getElementById("rst");
    rst.onclick = function () {
      if (!rst.dataset.armed) { rst.dataset.armed = "1"; rst.textContent = "Tap again to erase"; setTimeout(function () { if (rst.isConnected) { delete rst.dataset.armed; rst.textContent = "Erase everything"; } }, 4000); return; }
      S = blank(); save(); toast("Everything erased"); location.hash = "#home";
    };
  };

  // ---------- boot ----------
  var deferredInstall = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredInstall = e; if ((location.hash || "#home") === "#home") render(); });
  window.addEventListener("hashchange", render);
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function () {});
  render();
})();
