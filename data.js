// Content for Felt Ladder. Edit this file to change lessons, quizzes and reading.
window.FL = {};

FL.RANGES = {
  UTG: "66+ A9s+ A5s KTs+ QTs+ JTs T9s AJo+ KQo",
  HJ:  "55+ A8s+ A5s A4s K9s+ Q9s+ J9s+ T9s 98s ATo+ KJo+",
  CO:  "33+ A2s+ K8s+ Q9s+ J9s+ T8s+ 98s 87s 76s A9o+ KTo+ QTo+ JTo",
  BTN: "22+ A2s+ K5s+ Q7s+ J7s+ T7s+ 97s+ 86s+ 75s+ 65s 54s A5o+ K9o+ Q9o+ J9o+ T9o",
  SB:  "22+ A2s+ K6s+ Q8s+ J8s+ T8s+ 97s+ 87s 76s 65s A7o+ KTo+ QTo+ JTo"
};
FL.POSNAME = { UTG: "UTG (first to act)", HJ: "Hijack", CO: "Cutoff", BTN: "Button", SB: "Small blind" };

FL.STAGES = [
  {
    id: "s1", n: 1, name: "Recreational", span: "Weeks 1 to 4",
    goal: "Fold more than anyone at the table, raise instead of limping, and know in five seconds whether a call is profitable.",
    lessons: [
      { id: "s1-rules", title: "Rules and hand rankings", short: "Know them without thinking",
        body: [
          "Hand rankings from best to worst: royal flush, straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card.",
          "Before the flop, action starts with the player left of the big blind. On the flop, turn and river, action starts with the first active player left of the button.",
          "When a player is all-in for less than the bet, a side pot forms. They can only win the main pot they contributed to.",
          "If you hesitate on whether a flush beats a straight, you are spending attention you need for reading the table."
        ],
        tip: "Deal yourself 20 random five-card hands and name each one out loud before checking.",
        sources: [["PokerNews: Texas Hold'em rules", "https://www.pokernews.com/poker-rules/texas-holdem.htm"]] },
      { id: "s1-position", title: "Position", short: "Why acting last wins money",
        body: [
          "Acting last means you see what everyone else does before you decide. You get more information, you control the pot size, and you can bluff more cheaply.",
          "The button is the best seat. The first seats after the blinds are the worst, because everyone can act after you.",
          "Rule of thumb: play your widest range on the button and your tightest from early seats. The chart in Drills shows exactly how wide."
        ],
        tip: "Next game, count how many pots you win in position versus out of position.",
        sources: [["Card Player: poker tips", "https://www.cardplayer.com/rules-of-poker/how-to-play-poker/advanced-poker-tips"]] },
      { id: "s1-preflop", title: "Raise or fold preflop", short: "Never open-limp",
        body: [
          "When everyone folds to you, either raise to 2.5 to 3 big blinds or fold. Calling the big blind (limping) invites everyone in and gives up your chance to win the pot right away.",
          "When players limp ahead of you, add one big blind to your raise per limper. With three limpers, raise to about 6 big blinds.",
          "In home games where everyone limps and calls, raising to 4 or 5 big blinds plus one per limper is normal and still works."
        ],
        tip: "Run the Starting hands quiz until you hit 45 of your last 50.",
        drill: "preflop",
        sources: [["Upswing Poker: strategy blog", "https://upswingpoker.com/blog/"]] },
      { id: "s1-tight", title: "Play one hand in five", short: "The fastest win-rate gain",
        body: [
          "Most recreational players see the flop with 40% or more of their hands. Cutting that roughly in half is the biggest improvement available to you.",
          "Weak hands like K-7 offsuit or Q-5 suited look playable but lose money from most seats, because when they hit, they often hit second-best.",
          "Playing for fun and playing to win are different games. Every hand you play out of boredom costs money."
        ],
        tip: "For two sessions, fold at least 75% of your hands before the flop. Keep a tally.",
        sources: [["PokerListings: 11 tricks for your home game", "https://www.pokerlistings.com/poker-strategies/11-simple-tricks-you-can-use-to-crush-your-poker-home-game"]] },
      { id: "s1-odds", title: "Pot odds and the rule of 2 and 4", short: "Do the math in five seconds",
        body: [
          "Count your outs: the cards that make your hand. A flush draw has 9. An open-ended straight draw has 8. A gutshot has 4.",
          "With one card to come, outs × 2 is your rough equity. With two cards to come and no more betting (an all-in on the flop), outs × 4. The shortcut overstates slightly above about 10 outs.",
          "The price: divide the amount you must call by the final pot (pot + their bet + your call). A half-pot bet needs 25% equity. A pot-size bet needs 33%.",
          "If your equity beats the price, call. If not, fold, unless you expect to win a lot more on later streets (implied odds)."
        ],
        tip: "Run the Pot odds drill until you hit 18 of your last 20.",
        drill: "odds",
        sources: [["PokerSkill: rule of 2 and 4", "https://www.pokerskill.com/blog/rule-of-2-and-4-explained/"], ["The Poker Bank: 4-2 rule", "https://thepokerbank.com/strategy/mathematics/pot-odds/4-2"], ["PokerSkill: odds charts", "https://www.pokerskill.com/charts/odds/"]] },
      { id: "s1-value", title: "Value bet more, bluff less", short: "Where low-stakes profit comes from",
        body: [
          "At low stakes and in home games, most profit comes from getting paid with strong hands, not from bluffs.",
          "With top pair and a good kicker or better, bet. Do not slow-play unless the board is very dry and your opponent is aggressive.",
          "With nothing against someone who calls everything, give up. A bluff only works on someone who can fold."
        ],
        tip: "Count your bluffs at the next game. If you bluffed a calling station, write down what happened.",
        sources: [["BlackRain79: 5 ways to beat your friends", "https://www.blackrain79.com/2022/07/beat-your-friends-at-poker.html"]] }
    ],
    reading: [["The Course", "Ed Miller", "Written for live low-stakes games. Fifteen lessons, each with one habit to build."], ["Upswing Poker free articles", "upswingpoker.com/blog", "Short reads on preflop play, position and common leaks."]],
    quiz: [
      { q: "You have 9 outs on the turn. What is your rough equity?", a: ["9%", "18%", "36%", "45%"], c: 1, why: "One card to come, so 9 × 2 = 18%. The exact number is 19.6%." },
      { q: "Your opponent bets half the pot. How much equity do you need to call?", a: ["20%", "25%", "33%", "50%"], c: 1, why: "Call 0.5 to win a final pot of 2. 0.5 ÷ 2 = 25%." },
      { q: "A pot-size bet needs how much equity to call?", a: ["25%", "33%", "40%", "50%"], c: 1, why: "Call 1 into a final pot of 3. 1 ÷ 3 = 33%." },
      { q: "Everyone folds to you on the button with a playable hand. What should you do?", a: ["Limp", "Raise to 2.5 to 3 big blinds", "Go all-in", "Fold every time"], c: 1, why: "Raise or fold. Raising can win the blinds right away and gives you position after the flop." },
      { q: "Three players limp. You have A-Q in the cutoff. About how much should you raise to?", a: ["2 big blinds", "3 big blinds", "6 big blinds", "All-in"], c: 2, why: "3 big blinds plus one per limper is about 6." },
      { q: "Which seat lets you profitably play the most hands?", a: ["Under the gun", "Hijack", "Button", "Big blind, first to act after the flop"], c: 2, why: "The button acts last on every street after the flop." },
      { q: "A friend calls every bet with any pair. What do you do?", a: ["Bluff them more", "Bet your good hands bigger and stop bluffing", "Check every hand", "Only play aces"], c: 1, why: "Calling stations pay off value bets and ignore bluffs." },
      { q: "Which hand beats a straight?", a: ["Three of a kind", "Two pair", "Flush", "Ace-high"], c: 2, why: "Flush ranks above straight." }
    ]
  },
  {
    id: "s2", n: 2, name: "Amateur", span: "Months 2 to 4",
    goal: "Put opponents on a range, plan the turn and river before you bet the flop, and know your results to the dollar.",
    lessons: [
      { id: "s2-ranges", title: "Think in ranges", short: "All the hands they could have",
        body: [
          "Stop asking \"does he have the king?\" Ask \"what hands does he play this way, and how does mine do against all of them?\"",
          "Start with their preflop range. A tight player who raises from early position has something like the UTG chart. A loose friend who limps could have almost anything.",
          "Remove hands each street. If they would always raise a set on this flop and they just called, sets become less likely."
        ],
        tip: "At the next showdown you are not in, guess their range before the cards are shown.",
        sources: [["DeucesCracked: poker ranges", "https://www.deucescracked.com/learn/poker-ranges"], ["DeucesCracked: range construction", "https://www.deucescracked.com/learn/range-construction"]] },
      { id: "s2-cbet", title: "Continuation bets with a reason", short: "Which boards to bet",
        body: [
          "A continuation bet (c-bet) is a flop bet by the player who raised before the flop.",
          "Bet small (about a third of the pot) and often on high, dry boards like K-7-2 with three suits. Those boards favor your range.",
          "Check more on low, connected boards like 7-6-5. Those hit the caller's hands.",
          "Against two or more opponents, bet mostly when you have something."
        ],
        tip: "Before each c-bet, ask: whose range does this flop help more?" },
      { id: "s2-3bet", title: "Your 3-bet range", short: "Re-raising preflop",
        body: [
          "Re-raise for value with QQ+, AK, and against loose openers JJ, TT and AQ.",
          "Size it about 3 times their raise when you have position on them, 4 times when you do not.",
          "In home games, keep 3-bet bluffs rare. People call too much for them to work."
        ],
        tip: "Write down every 3-bet you make next session and whether it was for value." },
      { id: "s2-plan", title: "Plan the whole hand", short: "Turn and river before the flop bet",
        body: [
          "Before each flop bet, decide what you will do on a safe turn and on a scary turn.",
          "If you would bet the flop and then give up on most turns, a check is often better than a bet you will abandon.",
          "Strong hands want three streets of value. Plan bet sizes so the river bet is a size they will still call."
        ] },
      { id: "s2-track", title: "Track every session", short: "Results, hours, and three hands",
        body: [
          "Log buy-in, cash-out and hours after every game in the Sessions tab.",
          "Write down the three hands you were least sure about and review them within 24 hours.",
          "After 20 sessions you will see your real leaks, not the ones you remember."
        ],
        tip: "Log at least 5 sessions to finish this stage." },
      { id: "s2-notes", title: "Keep a file on every regular", short: "One line per friend per night",
        body: [
          "After each night, note what each friend overplays, whether they bluff, and what they do when they are losing.",
          "Tag each friend with a player type in the Players tab. The app shows the adjustment for that type.",
          "Update notes when someone changes. People learn too."
        ],
        tip: "Add at least 3 players to finish this stage.",
        sources: [["BlackRain79: how to beat poker home games", "https://www.blackrain79.com/2025/01/how-to-beat-poker-home-games.html"]] },
      { id: "s2-tilt", title: "A tilt plan", short: "Decide before the session",
        body: [
          "Tilt is any emotional state that makes you play worse: anger after a bad beat, chasing losses, playing scared after a big win.",
          "Pick a rule in advance. After losing two buy-ins, or if a bad beat still bothers you three hands later, take a 15 minute break or go home.",
          "Decide it before the session. You will not make a good decision about tilt while tilted."
        ] }
    ],
    reading: [["The Theory of Poker", "David Sklansky", "The foundation most modern strategy grew from."], ["The Mental Game of Poker", "Jared Tendler", "A practical system for tilt, fear and confidence."], ["Master Micro Stakes Poker", "Alton Hardin", "Clear, low-stakes strategy. Better after stage 1 than before it."]],
    quiz: [
      { q: "What does thinking in ranges mean?", a: ["Guessing their exact hand", "Considering every hand they could hold given their actions", "Only playing a fixed set of hands", "Betting the same amount every time"], c: 1, why: "A range is the full set of hands consistent with what they did." },
      { q: "You raised preflop, one player called. Flop is K-7-2 in three suits. Best default?", a: ["Check every time", "Small c-bet most of the time", "Overbet all-in", "Check-raise"], c: 1, why: "High, dry boards favor the raiser's range. A small bet works often." },
      { q: "Same spot, but the flop is 7-6-5 with two hearts. Best default?", a: ["Bet big every time", "Check more often", "Always bluff", "Fold"], c: 1, why: "Low connected boards hit the caller's range more than yours." },
      { q: "About how big should a 3-bet be when you have position on the raiser?", a: ["Same as their raise", "2 times", "3 times", "10 times"], c: 2, why: "About 3 times in position, 4 times out of position." },
      { q: "Which hands are standard 3-bets for value in a home game?", a: ["Any two suited cards", "QQ+, AK", "Small pairs", "Any ace"], c: 1, why: "Strong hands that do well when called. Add JJ, TT and AQ against loose openers." },
      { q: "You lost two buy-ins and feel angry. What does a good tilt plan say?", a: ["Rebuy and win it back", "Follow the break rule you set before the session", "Play every hand", "Move up in stakes"], c: 1, why: "Decide the rule before the session and follow it." },
      { q: "Before betting the flop you should:", a: ["Know what you will do on the turn", "Look at your chips", "Wait for a tell", "Ask what they have"], c: 0, why: "Plan the hand across streets so bets work together." },
      { q: "Which hands should you review after a session?", a: ["Only the big wins", "The ones you were unsure about", "None", "Every hand"], c: 1, why: "Uncertain hands show where your understanding has gaps." }
    ]
  },
  {
    id: "s3", n: 3, name: "Pro track", span: "Month 5 onward",
    goal: "Know what game theory optimal play looks like, deviate from it on purpose, and measure yourself over thousands of hands.",
    lessons: [
      { id: "s3-gto", title: "The GTO baseline", short: "Unexploitable play",
        body: [
          "A game theory optimal (GTO) strategy is one that cannot be exploited. If you play it, no opponent strategy beats you in the long run.",
          "You will not play it perfectly. Knowing it tells you when an opponent is off and by how much.",
          "Study one spot at a time with a solver or trainer: single-raised pots, button versus big blind, is a good first spot."
        ],
        sources: [["GTO Wizard", "https://gtowizard.com/"], ["NTPoker: learning roadmap", "https://ntpoker.jp/en/blog/poker_roadmap/"]] },
      { id: "s3-exploit", title: "Exploit on purpose", short: "Deviate with a reason",
        body: [
          "Against a friend who never folds, the GTO bluff frequency is wrong. Cut bluffs to zero and bet bigger for value.",
          "Against a player who folds too much, bluff more, especially on turns and rivers.",
          "Each deviation needs a named reason based on a pattern you have seen more than once."
        ] },
      { id: "s3-bankroll", title: "Bankroll rules", short: "Survive variance",
        body: [
          "Keep poker money separate from life money.",
          "Common guidance: 30 to 40 buy-ins for cash games, 100 or more for multi-table tournaments. Sources range wider, from 20 to 100 for cash.",
          "Write a move-down rule before you move up. For example, drop a level if your roll falls below 25 buy-ins.",
          "Bankroll rules protect a winning player from variance. They cannot save a losing one."
        ],
        sources: [["The Poker Bank: bankroll management", "https://www.thepokerbank.com/bankroll-management.html"], ["Pokerfuse: bankroll management", "https://pokerfuse.com/learn-poker/basics/bankroll-management/"], ["PokerTrainer: bankroll management", "https://pokertrainer.se/poker-bankroll-management/"]] },
      { id: "s3-sample", title: "Judge on samples", short: "One night means almost nothing",
        body: [
          "Measure win rate in big blinds per 100 hands (bb/100).",
          "A single night tells you almost nothing. Even 10,000 hands leaves a wide margin of error.",
          "Judge decisions by whether they were right given what you knew, not by whether you won the pot."
        ] },
      { id: "s3-study", title: "Study as much as you play", short: "A routine that compounds",
        body: [
          "Aim for one hour of study for every two to three hours of play.",
          "Join or start a study group with one or two serious players. Review hands together each week.",
          "Take ten hands, run each through a solver, and mark each deviation as a deliberate exploit or a mistake. When most are deliberate, you are playing like a pro."
        ] }
    ],
    reading: [["Modern Poker Theory", "Michael Acevedo", "The standard introduction to solver-era strategy."], ["Play Optimal Poker", "Andrew Brokos", "Game theory through toy games. Volume 2 covers range construction."], ["Poker's 1%", "Ed Miller", "Frequencies and why the best players are hard to read."]],
    quiz: [
      { q: "A GTO strategy is one that:", a: ["Wins the most against every player", "Cannot be exploited", "Never bluffs", "Always bets big"], c: 1, why: "It is unexploitable, which is different from maximally profitable against a specific player." },
      { q: "Against a player who never folds, you should:", a: ["Bluff at GTO frequency", "Cut bluffs and bet bigger for value", "Play more hands", "Check down every hand"], c: 1, why: "Bluffs have no fold equity against them. Value bets get paid." },
      { q: "A common bankroll guideline for cash games is:", a: ["5 buy-ins", "10 buy-ins", "30 to 40 buy-ins", "500 buy-ins"], c: 2, why: "30 to 40 buy-ins is typical. Tournaments need 100 or more." },
      { q: "For multi-table tournaments, most sources suggest:", a: ["10 buy-ins", "20 buy-ins", "100 or more buy-ins", "No bankroll needed"], c: 2, why: "Tournament variance is much higher than cash games." },
      { q: "Win rate is usually measured in:", a: ["Dollars per night", "Big blinds per 100 hands", "Pots won", "Hours played"], c: 1, why: "bb/100 lets you compare across stakes." },
      { q: "You won your last three home games. What does that prove?", a: ["You are a winning player", "Almost nothing yet", "You should move up", "Your friends are bad"], c: 1, why: "Three sessions is far too small a sample." },
      { q: "What can bankroll management do?", a: ["Make a losing player win", "Protect a winning player from variance", "Remove variance", "Replace study"], c: 1, why: "It keeps you in the game through downswings. It cannot fix a losing strategy." },
      { q: "A good study to play ratio is about:", a: ["No study", "1 hour per 2 to 3 hours played", "10 hours per hour played", "Only study after losses"], c: 1, why: "Regular study keeps your play improving between sessions." }
    ]
  }
];

FL.TYPES = {
  station: { name: "Calling station", tell: "Calls flop and turn with any pair or draw. Rarely raises.", play: "Never bluff. Bet good hands bigger, two-thirds pot to full pot, and bet thinner. Top pair with a weak kicker can be a three-street value bet." },
  maniac: { name: "Maniac", tell: "Raises often, bets every street, shows bluffs proudly.", play: "Tighten up and let them bet into you. Call down lighter with medium hands. Check strong hands to them instead of betting." },
  rock: { name: "Rock", tell: "Plays few hands. When they bet big, they have it.", play: "Steal their blinds often. Fold to their big turn and river bets unless you have a very strong hand." },
  chaser: { name: "Chaser", tell: "Calls with any draw regardless of price.", play: "Bet more than pot odds allow, around pot size on draw-heavy boards. Every bad-price call is your profit." },
  limper: { name: "Limper", tell: "Calls the big blind with lots of hands, then folds to a raise.", play: "Raise to 4 or 5 big blinds plus one per limper with good hands and suited hands in position. Bet the flop when they check." },
  newbie: { name: "New player", tell: "Still learning the rules.", play: "Be friendly and help with rules. Play straightforward value poker. A fun game keeps running." },
  solid: { name: "Solid player", tell: "Folds a lot, raises with purpose, hard to read.", play: "Avoid big pots without a strong hand. Pick on the weaker players instead. Study what they do: you can learn from them." },
  unknown: { name: "Not sure yet", tell: "Not enough hands seen.", play: "Play solid, chart-based poker and watch how they play their showdown hands." }
};

FL.HOME_RULES = [
  ["Drink less than the table", "Home games get looser as the night goes on. Being the clearest head after 11pm is an edge by itself."],
  ["Play your best poker late", "Losing players chase their losses near the end of the night. Value bet them harder and bluff them less."],
  ["Show little, say less", "Do not explain your plays or show bluffs. Every hand you show teaches your friends how you play."],
  ["Keep the game fun", "Don't slow-roll, don't criticize how friends play a hand, and keep stakes at a level where nobody feels sick about losing."]
];

FL.SOURCES = [
  ["PokerNews: Texas Hold'em rules", "https://www.pokernews.com/poker-rules/texas-holdem.htm"],
  ["Card Player: poker tips", "https://www.cardplayer.com/rules-of-poker/how-to-play-poker/advanced-poker-tips"],
  ["PokerSkill: rule of 2 and 4", "https://www.pokerskill.com/blog/rule-of-2-and-4-explained/"],
  ["PokerSkill: odds charts", "https://www.pokerskill.com/charts/odds/"],
  ["The Poker Bank: 4-2 rule", "https://thepokerbank.com/strategy/mathematics/pot-odds/4-2"],
  ["DeucesCracked: poker ranges", "https://www.deucescracked.com/learn/poker-ranges"],
  ["DeucesCracked: range construction", "https://www.deucescracked.com/learn/range-construction"],
  ["PokerNews: solver preflop ranges", "https://www.pokernews.com/strategy/master-preflop-play-with-the-new-advanced-solver-ranges-37112.htm"],
  ["NTPoker: learning roadmap", "https://ntpoker.jp/en/blog/poker_roadmap/"],
  ["NTPoker: GTO book picks", "https://ntpoker.jp/en/blog/gto_book/"],
  ["HowToPlayPokerInfo: best poker books", "https://howtoplaypokerinfo.com/best-poker-books"],
  ["The Poker Bank: bankroll management", "https://www.thepokerbank.com/bankroll-management.html"],
  ["Pokerfuse: bankroll management", "https://pokerfuse.com/learn-poker/basics/bankroll-management/"],
  ["PokerTrainer: bankroll management", "https://pokertrainer.se/poker-bankroll-management/"],
  ["VIP-Grinders: bankroll management", "https://www.vip-grinders.com/bankroll-management/"],
  ["PokerListings: how to beat your friends", "https://www.pokerlistings.com/poker-strategies/how-to-beat-your-friends-at-poker"],
  ["PokerListings: 11 home game tricks", "https://www.pokerlistings.com/poker-strategies/11-simple-tricks-you-can-use-to-crush-your-poker-home-game"],
  ["BlackRain79: how to beat home games", "https://www.blackrain79.com/2025/01/how-to-beat-poker-home-games.html"],
  ["BlackRain79: 5 ways to beat your friends", "https://www.blackrain79.com/2022/07/beat-your-friends-at-poker.html"],
  ["PokerSkill: crushing home games", "https://pokerskill.com/c/strategy-guides/how-to-consistently-crush-poker-home-games-with-these-tips"],
  ["Upswing Poker: strategy blog", "https://upswingpoker.com/blog/"],
  ["GTO Wizard", "https://gtowizard.com/"]
];
