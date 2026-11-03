// Practice table: you against five bots at No-Limit Hold'em, $1/$2 blinds, $200 stacks.
(function () {
  "use strict";
  var X = window.FLX;
  var SB = 1, BB = 2, BUY = 200, N = 6;
  var RK = "23456789TJQKA";
  var SUIT = ["♠", "♥", "♦", "♣"];
  var RNAME = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace"];
  var RPL = ["Twos", "Threes", "Fours", "Fives", "Sixes", "Sevens", "Eights", "Nines", "Tens", "Jacks", "Queens", "Kings", "Aces"];
  var POS = ["BTN", "SB", "BB", "UTG", "HJ", "CO"];
  var POSLONG = { BTN: "button", SB: "small blind", BB: "big blind", UTG: "UTG", HJ: "hijack", CO: "cutoff" };
  var NAMES = ["Mike", "Dana", "Chris", "Sam", "Alex", "Jordan", "Taylor", "Riley", "Morgan", "Casey", "Jamie", "Drew"];
  var BOT_TYPES = ["station", "maniac", "rock", "chaser", "limper", "solid"];

  // Bot personalities. Preflop thresholds use the Chen formula score.
  var P = {
    rock:    { open: 10, raise: 10, three: 14, callR: 11, value: 0.66, raiseT: 0.82, bluff: 0.03, slack: -0.05, aggr: 0.5, size: 0.66 },
    solid:   { open: 0,  raise: 0,  three: 12, callR: 9,  value: 0.60, raiseT: 0.76, bluff: 0.12, slack: 0.0,  aggr: 0.6, size: 0.6 },
    station: { open: 4,  raise: 13, three: 15, callR: 5,  value: 0.72, raiseT: 0.9,  bluff: 0.02, slack: 0.18, aggr: 0.2, size: 0.5 },
    maniac:  { open: 5,  raise: 5,  three: 9,  callR: 6,  value: 0.45, raiseT: 0.62, bluff: 0.35, slack: 0.08, aggr: 0.9, size: 0.85 },
    limper:  { open: 6,  raise: 13, three: 15, callR: 8,  value: 0.66, raiseT: 0.85, bluff: 0.05, slack: 0.05, aggr: 0.3, size: 0.5 },
    chaser:  { open: 6,  raise: 12, three: 14, callR: 7,  value: 0.60, raiseT: 0.8,  bluff: 0.08, slack: 0.12, aggr: 0.4, size: 0.6 }
  };

  // ---------- cards and evaluation ----------
  function rk(c) { return c >> 2; }
  function st(c) { return c & 3; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function newDeck() { var d = []; for (var i = 0; i < 52; i++) d.push(i); return shuffle(d); }

  function eval5(c) {
    var r = [rk(c[0]), rk(c[1]), rk(c[2]), rk(c[3]), rk(c[4])].sort(function (a, b) { return b - a; });
    var s0 = st(c[0]), flush = st(c[1]) === s0 && st(c[2]) === s0 && st(c[3]) === s0 && st(c[4]) === s0;
    var cnt = {}; r.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    var g = Object.keys(cnt).map(function (k) { return [cnt[k], +k]; }).sort(function (a, b) { return b[0] - a[0] || b[1] - a[1]; });
    var straight = -1;
    if (g.length === 5) {
      if (r[0] - r[4] === 4) straight = r[0];
      else if (r[0] === 12 && r[1] === 3 && r[4] === 0) straight = 3;
    }
    var cat, tb;
    if (straight >= 0 && flush) { cat = 8; tb = [straight]; }
    else if (g[0][0] === 4) { cat = 7; tb = [g[0][1], g[1][1]]; }
    else if (g[0][0] === 3 && g[1][0] === 2) { cat = 6; tb = [g[0][1], g[1][1]]; }
    else if (flush) { cat = 5; tb = r; }
    else if (straight >= 0) { cat = 4; tb = [straight]; }
    else if (g[0][0] === 3) { cat = 3; tb = [g[0][1], g[1][1], g[2][1]]; }
    else if (g[0][0] === 2 && g[1][0] === 2) { cat = 2; tb = [g[0][1], g[1][1], g[2][1]]; }
    else if (g[0][0] === 2) { cat = 1; tb = [g[0][1], g[1][1], g[2][1], g[3][1]]; }
    else { cat = 0; tb = r; }
    var score = cat;
    for (var i = 0; i < 5; i++) score = score * 13 + (tb[i] || 0);
    return { score: score, cat: cat, tb: tb };
  }
  var COMBOS = {};
  function combos(n) {
    if (COMBOS[n]) return COMBOS[n];
    var out = [];
    for (var a = 0; a < n; a++) for (var b = a + 1; b < n; b++) for (var c = b + 1; c < n; c++) for (var d = c + 1; d < n; d++) for (var e = d + 1; e < n; e++) out.push([a, b, c, d, e]);
    return (COMBOS[n] = out);
  }
  function best(cards) {
    var top = null;
    combos(cards.length).forEach(function (ix) {
      var v = eval5([cards[ix[0]], cards[ix[1]], cards[ix[2]], cards[ix[3]], cards[ix[4]]]);
      if (!top || v.score > top.score) top = v;
    });
    return top;
  }
  function bestScore(cards) {
    var top = -1, cs = combos(cards.length);
    for (var i = 0; i < cs.length; i++) { var ix = cs[i]; var v = eval5([cards[ix[0]], cards[ix[1]], cards[ix[2]], cards[ix[3]], cards[ix[4]]]).score; if (v > top) top = v; }
    return top;
  }
  function handName(v) {
    var t = v.tb;
    switch (v.cat) {
      case 8: return t[0] === 12 ? "a royal flush" : "a straight flush, " + RNAME[t[0]] + " high";
      case 7: return "four " + RPL[t[0]];
      case 6: return "a full house, " + RPL[t[0]] + " full of " + RPL[t[1]];
      case 5: return "a flush, " + RNAME[t[0]] + " high";
      case 4: return "a straight, " + RNAME[t[0]] + " high";
      case 3: return "three " + RPL[t[0]];
      case 2: return "two pair, " + RPL[t[0]] + " and " + RPL[t[1]];
      case 1: return "a pair of " + RPL[t[0]];
      default: return RNAME[t[0]] + " high";
    }
  }
  // Monte Carlo equity against random hands.
  function equity(hole, board, nOpp, iters) {
    nOpp = Math.max(1, Math.min(nOpp, 4));
    var known = {}; hole.concat(board).forEach(function (c) { known[c] = 1; });
    var rest = []; for (var i = 0; i < 52; i++) if (!known[i]) rest.push(i);
    var need = 5 - board.length, win = 0;
    for (var it = 0; it < iters; it++) {
      var k = 2 * nOpp + need;
      for (var j = 0; j < k; j++) { var x = j + Math.floor(Math.random() * (rest.length - j)), t = rest[j]; rest[j] = rest[x]; rest[x] = t; }
      var bd = board.concat(rest.slice(2 * nOpp, k));
      var me = bestScore(hole.concat(bd)), bestOpp = -1, ties = 0;
      for (var o = 0; o < nOpp; o++) {
        var sc = bestScore([rest[2 * o], rest[2 * o + 1]].concat(bd));
        if (sc > bestOpp) { bestOpp = sc; ties = 0; }
        if (sc === me) ties++;
      }
      if (me > bestOpp) win += 1; else if (me === bestOpp) win += 1 / (ties + 1);
    }
    return win / iters;
  }
  function chen(h) {
    var a = rk(h[0]), b = rk(h[1]), hi = Math.max(a, b), lo = Math.min(a, b);
    var pts = function (r) { return r === 12 ? 10 : r === 11 ? 8 : r === 10 ? 7 : r === 9 ? 6 : (r + 2) / 2; };
    var s = pts(hi);
    if (a === b) return Math.max(5, s * 2);
    if (st(h[0]) === st(h[1])) s += 2;
    var gap = hi - lo - 1;
    s -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
    if (gap <= 1 && hi < 10) s += 1;
    return Math.ceil(s);
  }
  function notation(h) {
    var a = rk(h[0]), b = rk(h[1]), hi = Math.max(a, b), lo = Math.min(a, b);
    return a === b ? RK[hi] + RK[lo] : RK[hi] + RK[lo] + (st(h[0]) === st(h[1]) ? "s" : "o");
  }
  function cardHTML(c, opts) {
    opts = opts || {};
    if (c == null || opts.back) return '<div class="pc back' + (opts.sm ? " sm" : "") + '"></div>';
    var red = st(c) === 1 || st(c) === 2;
    return '<div class="pc' + (red ? " red" : "") + (opts.sm ? " sm" : "") + (opts.dim ? " dim" : "") + '"><span>' + (RK[rk(c)] === "T" ? "10" : RK[rk(c)]) + "</span><span>" + SUIT[st(c)] + "</span></div>";
  }

  // ---------- game state ----------
  var G = null, timer = null, waiting = false, coachCache = {};
  function T() { return X.S.table; }
  function visible() { return (location.hash || "").indexOf("#table") === 0; }
  function newSeats() {
    var names = shuffle(NAMES.slice()), types = shuffle(BOT_TYPES.slice()).slice(0, 5);
    var seats = [{ name: "You", type: "hero", stack: BUY, hero: true }];
    for (var i = 0; i < 5; i++) seats.push({ name: names[i], type: types[i], stack: BUY });
    return seats;
  }
  function init() {
    var t = T(), saved = t.seats;
    G = { seats: (saved && saved.length === N ? saved : newSeats()).map(function (s) { return { name: s.name, type: s.type, stack: s.stack, hero: !!s.hero }; }),
      button: t.button || 0, board: [], phase: "idle", log: [], handNo: t.hands || 0 };
  }
  function persist() {
    var t = T();
    t.seats = G.seats.map(function (s) { return { name: s.name, type: s.type, stack: s.stack, hero: s.hero }; });
    t.button = G.button;
    X.save();
  }
  function pos(i) { return POS[(i - G.button + N) % N]; }
  function potTotal() { return G.seats.reduce(function (a, s) { return a + s.total; }, 0); }
  function live() { return G.seats.filter(function (s) { return !s.folded; }); }
  function actable(i) { var s = G.seats[i]; return !s.folded && !s.allin; }
  function log(msg, cls) { G.log.push({ m: msg, c: cls || "" }); }
  function money(n) { return "$" + n; }

  function startHand() {
    clearTimeout(timer);
    if (!G) init();
    G.seats.forEach(function (s) {
      if (s.stack < BB) { if (!s.hero) log(s.name + " rebuys for $" + BUY + "."); else log("You rebuy for $" + BUY + "."); s.stack = BUY; }
    });
    G.button = (G.button + 1) % N;
    G.deck = newDeck(); G.board = []; G.street = 0; G.log = []; G.result = null; G.handNo++;
    G.currentBet = 0; G.minRaise = BB; G.lastAggr = -1; G.heroVpip = false; G.heroPfr = false;
    G.seats.forEach(function (s) { s.hole = []; s.folded = false; s.allin = false; s.bet = 0; s.total = 0; s.acted = false; s.last = ""; s.shown = false; s.win = 0; });
    G.heroStart = G.seats[0].stack;
    for (var k = 0; k < 2; k++) for (var i = 1; i <= N; i++) G.seats[(G.button + i) % N].hole.push(G.deck.pop());
    log("Hand " + G.handNo + ". You are in the " + POSLONG[pos(0)] + ".", "h");
    post((G.button + 1) % N, SB, "small blind"); post((G.button + 2) % N, BB, "big blind");
    G.currentBet = BB;
    G.phase = "bet";
    G.cur = (G.button + 3) % N;
    coachCache = {};
    step();
  }
  function post(i, amt, what) {
    var s = G.seats[i], a = Math.min(amt, s.stack);
    s.stack -= a; s.bet += a; s.total += a; if (s.stack === 0) s.allin = true;
    s.last = what === "small blind" ? "SB" : "BB";
    log(s.name + " posts the " + what + " ($" + a + ").");
  }
  function nextNeeding(start) {
    for (var k = 0; k < N; k++) {
      var j = (start + k) % N, s = G.seats[j];
      if (actable(j) && (!s.acted || s.bet < G.currentBet)) return j;
    }
    return -1;
  }
  function step() {
    if (live().length === 1) return uncontested();
    var acts = G.seats.filter(function (s, i) { return actable(i); });
    if (acts.length === 0 || (acts.length === 1 && acts[0].bet >= G.currentBet)) return endStreet(true);
    var j = nextNeeding(G.cur);
    if (j < 0) return endStreet(false);
    G.cur = j;
    draw();
    if (!G.seats[j].hero) schedule(botAct, 700);
  }
  function schedule(fn, ms) {
    clearTimeout(timer);
    timer = setTimeout(function () { if (!visible()) { waiting = fn; return; } fn(); }, ms);
  }
  function act(i, type, to) {
    var s = G.seats[i], toCall = G.currentBet - s.bet, a;
    if (type === "check" && toCall > 0) type = "call";
    if (type === "raise" && (to <= G.currentBet || s.stack <= toCall)) type = toCall > 0 ? "call" : "check";
    if (type === "fold") { s.folded = true; s.last = "Fold"; log(s.name + " folds."); }
    else if (type === "check") { s.last = "Check"; log(s.name + " checks."); }
    else if (type === "call") {
      a = Math.min(toCall, s.stack); s.stack -= a; s.bet += a; s.total += a;
      if (s.stack === 0) s.allin = true;
      s.last = s.allin ? "All-in" : "Call $" + a; log(s.name + " calls $" + a + (s.allin ? " and is all-in" : "") + ".");
      if (s.hero && G.street === 0) G.heroVpip = true;
    } else {
      var minTo = G.currentBet + G.minRaise, maxTo = s.bet + s.stack;
      to = Math.round(Math.max(Math.min(to, maxTo), Math.min(minTo, maxTo)));
      a = to - s.bet; s.stack -= a; s.bet = to; s.total += a;
      if (s.stack === 0) s.allin = true;
      var inc = to - G.currentBet; if (inc >= G.minRaise) G.minRaise = inc;
      var wasBet = G.currentBet === 0;
      G.currentBet = to; G.lastAggr = i;
      G.seats.forEach(function (o, k) { if (k !== i) o.acted = false; });
      s.last = s.allin ? "All-in $" + to : (wasBet ? "Bet $" : "Raise $") + to;
      log(s.name + (wasBet ? " bets $" : " raises to $") + to + (s.allin ? ", all-in" : "") + ".", "a");
      if (s.hero && G.street === 0) { G.heroVpip = true; G.heroPfr = true; }
    }
    s.acted = true;
    G.cur = (i + 1) % N;
    step();
  }
  function endStreet(runout) {
    G.seats.forEach(function (s) { s.bet = 0; s.acted = false; if (!s.folded && !s.allin) s.last = ""; });
    G.currentBet = 0; G.minRaise = BB; G.lastAggr = -1;
    if (G.street === 3) return showdown();
    G.street++;
    if (G.street === 1) G.board.push(G.deck.pop(), G.deck.pop(), G.deck.pop()); else G.board.push(G.deck.pop());
    log(["", "Flop", "Turn", "River"][G.street] + ": " + G.board.map(txt).join(" ") + "  (pot $" + potTotal() + ")", "h");
    G.cur = (G.button + 1) % N;
    coachCache = {};
    if (runout) { G.seats.forEach(function (s) { if (!s.folded) s.shown = true; }); draw(); schedule(step, 900); }
    else step();
  }
  function txt(c) { return (RK[rk(c)] === "T" ? "10" : RK[rk(c)]) + SUIT[st(c)]; }
  function uncontested() {
    var w = G.seats.filter(function (s) { return !s.folded; })[0], pot = potTotal();
    w.stack += pot; w.win = pot;
    log(w.name + (w.hero ? " win $" : " wins $") + pot + ". Everyone else folded.", "w");
    G.result = w.hero ? "You win $" + pot + "." : w.name + " wins $" + pot + ".";
    finish();
  }
  function showdown() {
    var ls = G.seats.filter(function (s) { return !s.folded; });
    ls.forEach(function (s) { s.shown = true; s.val = best(s.hole.concat(G.board)); });
    var levels = ls.map(function (s) { return s.total; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    var prev = 0, lines = [];
    levels.forEach(function (lv) {
      var amt = 0; G.seats.forEach(function (s) { amt += Math.max(0, Math.min(s.total, lv) - Math.min(s.total, prev)); });
      var elig = ls.filter(function (s) { return s.total >= lv; });
      prev = lv;
      if (!amt) return;
      var top = Math.max.apply(null, elig.map(function (s) { return s.val.score; }));
      var ws = elig.filter(function (s) { return s.val.score === top; });
      var share = Math.floor(amt / ws.length), odd = amt - share * ws.length;
      ws.forEach(function (s, k) { var g = share + (k < odd ? 1 : 0); s.stack += g; s.win += g; });
      if (elig.length === 1) { lines.push(ws[0].name + (ws[0].hero ? " get $" : " gets $") + amt + " back (uncalled)."); return; }
      lines.push(ws.map(function (s) { return s.name; }).join(" and ") + (ws.length > 1 ? " split $" : ws[0].hero ? " win $" : " wins $") + amt + " with " + handName(ws[0].val) + ".");
    });
    ls.forEach(function (s) { log(s.name + " shows " + s.hole.map(txt).join(" ") + ": " + handName(s.val) + "."); });
    lines.forEach(function (l) { log(l, "w"); });
    G.result = lines.filter(function (l) { return l.indexOf("uncalled") < 0; }).join(" ") || lines.join(" ");
    finish();
  }
  function finish() {
    G.phase = "done";
    var t = T(), h = G.seats[0], delta = h.stack - G.heroStart;
    t.hands = G.handNo; t.net += delta; if (G.heroVpip) t.vpip++; if (G.heroPfr) t.pfr++; if (h.win > 0 && delta > 0) t.won++;
    G.heroDelta = delta;
    persist(); X.studied(); X.save();
    draw();
    if (t.auto) schedule(startHand, 3200);
  }

  // ---------- bots ----------
  function botAct() {
    var i = G.cur, s = G.seats[i];
    if (G.phase !== "bet" || s.hero) return;
    var d = decide(i);
    act(i, d[0], d[1]);
  }
  function decide(i) {
    var s = G.seats[i], p = P[s.type] || P.solid, toCall = G.currentBet - s.bet, pot = potTotal(), r = Math.random();
    var callers = G.seats.filter(function (o, k) { return k !== i && !o.folded && o.bet === G.currentBet && o.bet > 0; }).length;
    if (G.street === 0) {
      var c = chen(s.hole), ps = pos(i), facing = G.currentBet > BB, h = notation(s.hole);
      if (!facing) {
        var playable = s.type === "solid" ? (ps === "BB" ? c >= 9 : !!(X.SETS[ps] && X.SETS[ps][h])) : c >= p.open;
        if (s.type === "chaser" && st(s.hole[0]) === st(s.hole[1]) && c >= 4) playable = true;
        if (!playable) return toCall === 0 ? ["check"] : ["fold"];
        var raiseIt = s.type === "solid" ? true : (c >= p.raise || r < p.aggr * 0.25);
        if (ps === "BB" && toCall === 0 && !(c >= Math.max(p.raise, 9) || (s.type === "maniac" && r < 0.5))) return ["check"];
        if (!raiseIt) return toCall === 0 ? ["check"] : ["call"];
        var size = (s.type === "maniac" ? 4 + Math.floor(r * 3) : 3) * BB + callers * BB;
        return ["raise", size];
      }
      var big = toCall > 12 * BB, short = toCall >= s.stack * 0.5;
      if (c >= p.three && (!short || c >= 14)) return ["raise", Math.round(G.currentBet * (s.type === "maniac" ? 3.5 : 3))];
      var need = p.callR + (big ? 3 : 0) + (short ? 2 : 0);
      if (s.type === "chaser" && st(s.hole[0]) === st(s.hole[1])) need -= 2;
      if (c >= need) return ["call"];
      if (s.type === "maniac" && r < 0.08 && !big) return ["raise", G.currentBet * 3];
      return ["fold"];
    }
    var nOpp = live().length - 1;
    var eq = equity(s.hole, G.board, nOpp, 140), e1 = Math.pow(eq, 1 / Math.max(1, nOpp));
    var slack = (s.type === "chaser" && G.street === 3) ? 0 : p.slack;
    if (toCall === 0) {
      if (e1 > p.value && r < p.aggr + 0.3) return ["raise", Math.max(BB, Math.round(pot * p.size * (0.85 + Math.random() * 0.3)))];
      if (r < p.bluff * (nOpp > 1 ? 0.5 : 1)) return ["raise", Math.max(BB, Math.round(pot * 0.55))];
      return ["check"];
    }
    var po = toCall / (pot + toCall);
    if (e1 > p.raiseT && r < p.aggr) return ["raise", G.currentBet + Math.max(G.minRaise, Math.round((pot + toCall) * 0.8))];
    var ok = eq > po - slack;
    if (s.type === "rock" && toCall > pot * 0.5 && e1 < 0.6) ok = false;
    if (s.type === "station" && e1 > 0.35 && toCall < s.stack * 0.5) ok = true;
    if (ok) return ["call"];
    if (s.type === "maniac" && r < 0.1) return ["raise", G.currentBet * 2 + Math.round(pot * 0.5)];
    return ["fold"];
  }

  // ---------- coach ----------
  function coach() {
    var h = G.seats[0], toCall = G.currentBet - h.bet, ps = pos(0), key = G.street + ":" + G.currentBet + ":" + live().length;
    if (coachCache[key]) return coachCache[key];
    var lines = [], hn = notation(h.hole);
    if (G.street === 0) {
      var opened = G.seats.some(function (s, k) { return !s.hero && s.bet > BB; });
      var limped = G.seats.some(function (s, k) { return !s.hero && s.bet === BB && pos(k) !== "BB"; });
      var c = chen(h.hole);
      if (!opened) {
        if (ps === "BB" && toCall === 0) lines.push("You can check for free. Raise strong hands (" + (c >= 10 ? hn + " qualifies" : hn + " is a check") + ").");
        else {
          var inR = X.SETS[ps] && X.SETS[ps][hn];
          if (ps === "BB") inR = c >= 9;
          lines.push("Chart from the " + POSLONG[ps] + ": " + hn + " is a <b>" + (inR ? "raise" : "fold") + "</b>" + (limped ? ". Players limped, so raise bigger: 3 big blinds plus 1 per limper." : "."));
        }
      } else {
        var adv = c >= 12 ? "<b>re-raise</b> (3-bet) for value" : c >= 9 ? "calling is fine, especially in position" : c >= 7 && hn.length === 2 ? "a small pair can call to try to hit a set if the raise is small" : "<b>fold</b>";
        lines.push("Facing a raise with " + hn + ": " + adv + ".");
      }
    } else {
      var nOpp = live().length - 1, eq = equity(h.hole, G.board, nOpp, 400), v = best(h.hole.concat(G.board));
      lines.push("You have " + handName(v) + ". Equity against " + nOpp + " random hand" + (nOpp > 1 ? "s" : "") + ": <b>" + Math.round(eq * 100) + "%</b>.");
      if (toCall > 0) {
        var need = toCall / (potTotal() + toCall);
        lines.push("Calling $" + toCall + " needs <b>" + Math.round(need * 100) + "%</b>. Real hands that bet are stronger than random, so leave a margin.");
      }
    }
    var ag = G.lastAggr >= 0 ? G.seats[G.lastAggr] : null;
    if (ag && !ag.hero && T().types && FL.TYPES[ag.type]) lines.push(ag.name + " is a " + FL.TYPES[ag.type].name.toLowerCase() + ": " + FL.TYPES[ag.type].play);
    return (coachCache[key] = lines);
  }

  // ---------- view ----------
  function seatHTML(i) {
    var s = G.seats[i], t = T(), active = G.phase === "bet" && G.cur === i, isBtn = i === G.button;
    var showCards = s.hero || (s.shown && G.phase !== "bet") || (s.shown && !s.folded);
    var cards = s.hole && s.hole.length ? s.hole.map(function (c) { return cardHTML(showCards ? c : null, { sm: !s.hero, back: !showCards, dim: s.folded }); }).join("") : "";
    var status = s.folded ? "Folded" : s.last;
    return '<div class="seat' + (active ? " active" : "") + (s.folded ? " out" : "") + (s.win > 0 && G.phase === "done" ? " winner" : "") + (s.hero ? " hero" : "") + '">' +
      '<div class="seat-top"><span class="sn">' + X.esc(s.name) + (isBtn ? ' <span class="dbtn" title="Dealer button">D</span>' : "") + '</span><span class="ss mono">$' + s.stack + "</span></div>" +
      (!s.hero && t.types ? '<span class="stype">' + FL.TYPES[s.type].name + "</span>" : !s.hero ? '<span class="stype">' + pos(i) + "</span>" : "") +
      '<div class="scards">' + cards + "</div>" +
      '<div class="sact">' + (s.bet > 0 && G.phase === "bet" ? '<span class="chip mono">$' + s.bet + "</span> " : "") + '<span class="muted">' + (status || "&nbsp;") + "</span></div></div>";
  }
  function controlsHTML() {
    var h = G.seats[0];
    if (G.phase === "done") {
      var d = G.heroDelta;
      return '<div class="verdict ' + (d > 0 ? "ok" : d < 0 ? "bad" : "") + '"><b>' + X.esc(G.result) + "</b><span>Your result this hand: <b class=\"mono\">" + (d > 0 ? "+" : d < 0 ? "-" : "") + "$" + Math.abs(d) + "</b></span></div>" +
        '<button class="btn primary big block" id="t-next">Deal next hand</button>';
    }
    if (G.phase !== "bet" || G.cur !== 0) return '<div class="waiting muted">' + (G.phase === "bet" ? X.esc(G.seats[G.cur].name) + " is thinking…" : "") + "</div>";
    var toCall = G.currentBet - h.bet, call = Math.min(toCall, h.stack);
    var others = G.seats.filter(function (s, k) { return k !== 0 && actable(k); }).length;
    var canRaise = h.stack > toCall && others > 0;
    var minTo = Math.min(G.currentBet + G.minRaise, h.bet + h.stack), maxTo = h.bet + h.stack, pot = potTotal();
    var presets = [];
    if (G.street === 0) {
      if (G.currentBet <= BB) { var limpers = G.seats.filter(function (s, k) { return k !== 0 && s.bet === BB && pos(k) !== "BB"; }).length; presets = [["2.5x", Math.round(2.5 * BB) + limpers * BB], ["3x", 3 * BB + limpers * BB], ["4x", 4 * BB + limpers * BB]]; }
      else presets = [["3x", G.currentBet * 3], ["4x", G.currentBet * 4]];
    } else {
      [["½ pot", 0.5], ["¾ pot", 0.75], ["Pot", 1]].forEach(function (f) { presets.push([f[0], G.currentBet + Math.round((pot + toCall) * f[1])]); });
    }
    presets = presets.filter(function (p) { return p[1] >= minTo && p[1] < maxTo; });
    presets.push(["All-in", maxTo]);
    var verb = G.currentBet === 0 ? "Bet" : "Raise to";
    var def = presets.length > 1 ? presets[presets.length > 2 ? 1 : 0][1] : maxTo;
    return '<div class="row"><button class="btn warn big" id="t-fold"' + (toCall === 0 ? " hidden" : "") + '>Fold</button>' +
      '<button class="btn big" id="t-call">' + (toCall === 0 ? "Check" : "Call $" + call + (call >= h.stack ? " (all-in)" : "")) + "</button></div>" +
      (canRaise ? '<div class="raisebox"><div class="seg">' + presets.map(function (p) { return '<button data-to="' + p[1] + '">' + p[0] + "</button>"; }).join("") + "</div>" +
        '<div class="row"><input type="range" id="t-amt" min="' + minTo + '" max="' + maxTo + '" value="' + def + '" step="1" aria-label="Raise amount"><button class="btn primary" id="t-raise">' + verb + " $" + def + "</button></div></div>" : "");
  }
  function draw() {
    if (!visible() || !document.getElementById("t-root")) return;
    var t = T(), h = G.seats[0];
    var bb100 = t.hands ? (t.net / BB) / t.hands * 100 : 0;
    document.getElementById("t-stats").innerHTML =
      '<div class="stat"><span class="v ' + (t.net > 0 ? "pos" : t.net < 0 ? "neg" : "") + '">' + X.money(t.net) + '</span><span class="k">Net · ' + t.hands + " hands</span></div>" +
      '<div class="stat"><span class="v">' + (t.hands ? (bb100 >= 0 ? "+" : "") + bb100.toFixed(1) : "–") + '</span><span class="k">bb/100</span></div>' +
      '<div class="stat"><span class="v">' + (t.hands ? Math.round(t.vpip / t.hands * 100) + "%" : "–") + '</span><span class="k">Hands played (VPIP)</span></div>';
    var opp = ""; for (var i = 1; i < N; i++) opp += seatHTML(i);
    document.getElementById("t-opps").innerHTML = opp;
    var bd = ""; for (var k = 0; k < 5; k++) bd += G.board[k] != null ? cardHTML(G.board[k]) : '<div class="pc slot"></div>';
    document.getElementById("t-board").innerHTML = bd;
    document.getElementById("t-pot").textContent = G.phase === "idle" ? "Ready" : "Pot $" + potTotal() + " · " + (["Preflop", "Flop", "Turn", "River"][G.street] || "");
    document.getElementById("t-hero").innerHTML = G.phase === "idle" ? "" : seatHTML(0);
    var ctl = document.getElementById("t-ctl");
    ctl.innerHTML = G.phase === "idle" ? '<button class="btn primary big block" id="t-next">Deal a hand</button>' : controlsHTML();
    var cb = document.getElementById("t-coach");
    if (t.coach && G.phase === "bet" && G.cur === 0) { cb.hidden = false; cb.innerHTML = '<span class="eyebrow">Coach</span>' + coach().map(function (l) { return "<span>" + l + "</span>"; }).join(""); }
    else cb.hidden = true;
    document.getElementById("t-log").innerHTML = G.log.map(function (l) { return '<li class="' + l.c + '">' + X.esc(l.m) + "</li>"; }).join("");
    wire();
  }
  function wire() {
    var b;
    if ((b = document.getElementById("t-next"))) { b.onclick = startHand; b.focus({ preventScroll: true }); }
    if ((b = document.getElementById("t-fold"))) b.onclick = function () { act(0, "fold"); };
    if ((b = document.getElementById("t-call"))) b.onclick = function () { act(0, G.currentBet - G.seats[0].bet > 0 ? "call" : "check"); };
    var amt = document.getElementById("t-amt"), rb = document.getElementById("t-raise");
    if (amt && rb) {
      var verb = G.currentBet === 0 ? "Bet $" : "Raise to $";
      amt.oninput = function () { rb.textContent = verb + amt.value + (+amt.value === +amt.max ? " (all-in)" : ""); };
      rb.onclick = function () { act(0, "raise", +amt.value); };
      document.querySelectorAll(".raisebox .seg button").forEach(function (p) { p.onclick = function () { amt.value = p.dataset.to; amt.oninput(); }; });
      amt.oninput();
    }
  }

  window.FLTABLE_TEST = { get G() { return G; }, best: best, handName: handName, equity: equity };

  X.routes.table = function () {
    if (!G) init();
    var t = T();
    X.view.insertAdjacentHTML("beforeend",
      '<div id="t-root" class="stack">' +
      '<div class="spread"><h1>Practice table</h1><span class="eyebrow">$1/$2 · 6-max</span></div>' +
      '<div class="stats" id="t-stats"></div>' +
      '<div class="opps" id="t-opps"></div>' +
      '<div class="tfelt"><div class="board" id="t-board"></div><div class="pot mono" id="t-pot"></div></div>' +
      '<div id="t-hero"></div>' +
      '<div id="t-ctl" class="stack"></div>' +
      '<div class="callout" id="t-coach" hidden></div>' +
      '<details class="panel"><summary><b>Hand history</b></summary><ol class="hlog" id="t-log"></ol></details>' +
      '<div class="panel"><h3>Table options</h3>' +
      '<label class="row"><input type="checkbox" id="o-coach"' + (t.coach ? " checked" : "") + "> Coach tips on your turn</label>" +
      '<label class="row"><input type="checkbox" id="o-types"' + (t.types ? " checked" : "") + "> Show each bot's player type</label>" +
      '<label class="row"><input type="checkbox" id="o-auto"' + (t.auto ? " checked" : "") + "> Deal the next hand automatically</label>" +
      '<p class="muted" style="font-size:13.5px">Each bot plays like one player type from the playbook. Learn to spot them, then turn off the labels and see if you can still tell.</p>' +
      '<div class="row"><button class="btn" id="o-new">New table, new players</button><button class="btn ghost" id="o-reset">Reset table stats</button></div></div>' +
      "</div>");
    document.getElementById("o-coach").onchange = function (e) { t.coach = e.target.checked; X.save(); draw(); };
    document.getElementById("o-types").onchange = function (e) { t.types = e.target.checked; X.save(); draw(); };
    document.getElementById("o-auto").onchange = function (e) { t.auto = e.target.checked; X.save(); if (t.auto && G.phase === "done") schedule(startHand, 1200); };
    document.getElementById("o-new").onclick = function () {
      if (G.phase === "bet") { X.toast("Finish this hand first."); return; }
      clearTimeout(timer); t.seats = null; init(); G.phase = "idle"; persist(); X.toast("New players seated"); draw();
    };
    var rs = document.getElementById("o-reset");
    rs.onclick = function () {
      if (!rs.dataset.armed) { rs.dataset.armed = 1; rs.textContent = "Tap again to reset"; return; }
      t.hands = 0; t.net = 0; t.vpip = 0; t.pfr = 0; t.won = 0; G.handNo = 0; X.save(); X.toast("Table stats reset"); X.render();
    };
    draw();
    if (waiting) { var fn = waiting; waiting = false; schedule(fn, 500); }
  };
})();
