// ═══════════════════════════════════════════
// ACADEMY
// ═══════════════════════════════════════════

// Stage content populated in Stages 7 through 9. Keys: 1 through 7.
// Each entry: { title, learn, tools, challenge, criteria, quizzes }
var ACADEMY_STAGES = {
  1: {
    title: 'Stage 1: The Language of Markets',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">The Language of Markets</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Before you can trade, you must learn to read. Every market speaks a language. Pips, lots, spreads, sessions, and candlesticks are the vocabulary. Understanding these terms is not optional — it is the foundation upon which every trade is built.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.1 What Is a Financial Market?</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">A financial market is simply a place where buyers and sellers agree on a price for an asset. When more people want to buy than sell, price rises. When more want to sell than buy, price falls. Everything in trading flows from this one truth.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Markets you will encounter in Wingman are:</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">Forex</strong> (foreign exchange): Currency pairs. EUR/USD means the price of one Euro in US Dollars. The forex market trades 7.5 trillion dollars per day — the largest and most liquid market on Earth.</li>
        <li><strong style="color:var(--text);">Commodities</strong>: Physical goods. Gold (XAUUSD), Silver (XAGUSD), Oil (USOIL). Prices move on supply, demand, and geopolitics.</li>
        <li><strong style="color:var(--text);">Indices</strong>: Baskets of stocks. US30 (Dow Jones), SPX500 (S&P 500), NAS100 (Nasdaq). They represent the health of an economy.</li>
        <li><strong style="color:var(--text);">Crypto</strong>: Digital assets. Bitcoin (BTCUSD), Ethereum (ETHUSD). Highly volatile, 24/7 trading, no central authority.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.2 Reading a Price: Bid, Ask, and Spread</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Every market has two prices at all times.</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">BID</strong>: The price a buyer will pay (you sell at this price)</li>
        <li><strong style="color:var(--text);">ASK</strong>: The price a seller wants (you buy at this price)</li>
        <li><strong style="color:var(--text);">SPREAD</strong>: The difference between them. This is the broker's fee.</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Example: EUR/USD Bid 1.08450 | Ask 1.08465. The spread is 1.5 pips. If you buy, you immediately start 1.5 pips in the negative. The market must move 1.5 pips in your favour before you break even. This is why small spreads matter.</p>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">Rule:</strong> Always check the spread before trading. Spreads widen during low liquidity (weekends, news events).</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.3 Pips, Points, and Lot Sizes</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">PIP</strong> (Price Interest Point): The smallest standard price movement.</p>
      <pre style="font-family:var(--font-mono);background:var(--bg2);padding:12px;border-radius:8px;margin-bottom:12px;color:var(--text2);line-height:1.6;font-size:12px;">EUR/USD: 0.0001 = 1 pip
USD/JPY: 0.01 = 1 pip
XAUUSD (Gold): 0.01 = 1 pip (often called a point)</pre>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">LOT SIZE</strong>: How much you are trading.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;margin-bottom:6px;letter-spacing:0.5px;">STANDARD LOT</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">100,000 units. 1 pip = $10 profit/loss.</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;margin-bottom:6px;letter-spacing:0.5px;">MINI LOT</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">10,000 units. 1 pip = $1 profit/loss.</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;margin-bottom:6px;letter-spacing:0.5px;">MICRO LOT</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">1,000 units. 1 pip = $0.10 profit/loss.</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;margin-bottom:6px;letter-spacing:0.5px;">NANO LOT</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">100 units. Practice and minimal risk.</div>
        </div>
      </div>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">In the Wingman Sim Trader, you always trade micro lots unless you specifically increase size. This protects your sim balance while you learn.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.4 Long vs Short</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">GOING LONG</strong> = Buying. You believe price will rise. You buy EUR/USD at 1.0845. Price rises to 1.0865. You made 20 pips profit.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">GOING SHORT</strong> = Selling. You believe price will fall. You sell (short) XAUUSD at 2350.00. Price falls to 2340.00. You made 10 points profit.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Critical insight:</strong> In forex and CFDs, you can profit from falling prices just as easily as rising prices. Direction does not matter. Being right about direction does.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.5 What Is a CFD?</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">CFD</strong> means Contract for Difference. You do not own the underlying asset. You speculate on whether the price will rise or fall. Profits and losses are settled in cash. This is what Wingman Sim Trader uses. You never own the currency or commodity. You hold a position on its price movement.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.6 Market Hours and Sessions</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Unlike stocks, forex trades 24 hours a day, 5 days a week. It is divided into four main sessions.</p>
      <div style="background:var(--bg2);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-mono);color:var(--text2);font-size:12px;line-height:1.8;">Sydney Session:    10pm – 7am UTC (low volatility)<br>Tokyo Session:     midnight – 9am UTC (JPY pairs active)<br>London Session:    8am – 5pm UTC (highest volume)<br>New York Session:  1pm – 10pm UTC (USD pairs active)</div>
      </div>
      <blockquote style="background:rgba(0,201,177,0.08);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">London to New York Overlap:</strong> 1pm to 5pm UTC is the golden window. This 4 hour overlap has the highest liquidity and tightest spreads. Most professional traders focus here.</div>
      </blockquote>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Rule:</strong> Know which session you are in. Trading EURUSD at 3am UTC when Tokyo is the only active session means wide spreads and choppy, unpredictable moves.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.7 Reading a Candlestick Chart</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">The candlestick is the most important visual tool in trading. Each candle represents one time period (1 minute, 1 hour, 1 day).</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">A single candle contains four prices:</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">OPEN</strong>: Where price was at the start of the period</li>
        <li><strong style="color:var(--text);">HIGH</strong>: The highest price reached during the period</li>
        <li><strong style="color:var(--text);">LOW</strong>: The lowest price reached during the period</li>
        <li><strong style="color:var(--text);">CLOSE</strong>: Where price was at the end of the period</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">BULLISH candle:</strong> Close is higher than Open. Price rose. Usually shown in green.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">BEARISH candle:</strong> Close is lower than Open. Price fell. Usually shown in red.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">The <strong style="color:var(--text);">BODY</strong> is the rectangle between open and close. The <strong style="color:var(--text);">WICKS</strong> (shadows) are the thin lines above and below.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.8 What Wicks Tell You</h3>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">Long upper wick:</strong> Price tried to go higher but was rejected. Sellers pushed back.</li>
        <li><strong style="color:var(--text);">Long lower wick:</strong> Price tried to go lower but was rejected. Buyers pushed back.</li>
        <li><strong style="color:var(--text);">Small wicks:</strong> Strong directional move. Little resistance.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">1.9 Key Candlestick Patterns</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">DOJI:</strong> Open and Close are approximately equal. Tiny body, long wicks. Signals indecision. Often signals a reversal when it appears at a high or low after a strong move.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">HAMMER:</strong> Small body at top, long lower wick. Found at lows. Buyers rejected a move down. Potential reversal up.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SHOOTING STAR:</strong> Small body at bottom, long upper wick. Found at highs. Sellers rejected a move up. Potential reversal down.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">ENGULFING:</strong> One candle's body completely contains the previous candle's body. Strong reversal signal. Bullish engulfing (green swallows red) is a buy signal. Bearish engulfing (red swallows green) is a sell signal.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">MARUBOZU:</strong> No wicks. Pure body. Extreme directional conviction.</p>
    `,
    tools: [
      { name: 'Wingman Chart', desc: 'Candlestick view with timeframe selector (1M, 5M, 15M, 1H, 4H, 1D)', id: 'chart-basic', demo: false },
      { name: 'Crosshair Tool', desc: 'Hover over candles to read OHLCV values precisely', id: 'crosshair', demo: false },
      { name: 'Zoom and Pan', desc: 'Navigate the chart to see price history and structure', id: 'zoom-pan', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 1 CHALLENGE</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Submit a sim trade that meets ALL of the following:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Trade is in the correct direction of the current session.</li>
          <li>Trade is held for at least 5 minutes (no instant close).</li>
          <li>Trade has a Stop Loss set (any value must be set).</li>
          <li>Trade has a Take Profit set (any value must be set).</li>
        </ol>
      </div>
    `,
    criteria: [
      'Both Stop Loss and Take Profit are set before entry.',
      'Entry is during a reasonable session for the instrument.',
      'Entry avoids spread spikes.',
      'Trade is held long enough to show patience (minimum 5 minutes).'
    ]
  },

  2: {
    title: 'Stage 2: Support, Resistance, and Structure',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">Support, Resistance, and Structure</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">The market has a memory. Learn to read it. Professional traders do not trade randomly. They trade at levels where the market has shown institutional strength before. This section teaches you to identify those levels and build trades around them.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.1 Why Price Respects Levels</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Markets are driven by human decisions. Humans remember prices. When EUR/USD bounced off 1.0800 three times in the last year, traders remember that level. They place orders there again. That collective memory creates what we call Support and Resistance.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SUPPORT:</strong> A price level where buying pressure has historically been strong enough to stop price falling further. Think of it as a floor.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">RESISTANCE:</strong> A price level where selling pressure has historically been strong enough to stop price rising further. Think of it as a ceiling.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.2 How to Draw Support and Resistance</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Rules for valid Support and Resistance levels:</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>Price must have touched the level at least twice.</li>
        <li>The more touches, the stronger the level.</li>
        <li>Levels from higher timeframes (4H, Daily) are more significant than levels from lower timeframes (1M, 5M).</li>
        <li>Round numbers (1.0800, 2000.00, 50000) often act as Support and Resistance because traders naturally cluster orders around them.</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">The process to find these levels:</p>
      <ol style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li>Open the 1D or 4H chart.</li>
        <li>Look for obvious turning points where price clearly reversed direction.</li>
        <li>Draw a horizontal line through the wicks of those turns.</li>
        <li>Switch to the 1H chart and refine.</li>
        <li>Note levels that appear on multiple timeframes. Those are the most important.</li>
      </ol>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.3 Role Reversal</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">One of the most powerful concepts in technical analysis: When price breaks through a resistance level and closes above it, that old resistance often becomes the new support. When price breaks through a support level and closes below it, that old support often becomes the new resistance.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Why it happens:</strong> Traders who were wrong at the old level now want to exit at breakeven when price returns to that level. Their orders create the reversal that confirms role reversal.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.4 Trend Structure: Higher Highs and Lower Lows</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">A trend is not just price going up. A trend has structure.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">UPTREND:</strong> Higher Highs (HH) plus Higher Lows (HL). Each rally exceeds the last. Each pullback holds above the last pullback low.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">DOWNTREND:</strong> Lower Highs (LH) plus Lower Lows (LL). Each selloff goes lower. Each bounce fails to reach the previous high.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">RANGING:</strong> No clear HH/HL or LH/LL sequence. Price oscillates between a support and resistance. Many beginners lose money trading ranges as trends.</p>
      <blockquote style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">Warning:</strong> The most dangerous mistake is entering a trend trade when the structure has already broken. Always check the last 3 swing highs and lows before calling a direction.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.5 Zones vs Lines</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">In practice, support and resistance are not precise lines. They are zones — areas where price tends to react. Drawing them as narrow rectangles (zones) rather than single lines gives you more realistic expectations.</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li>A price entering a zone should make you alert.</li>
        <li>A price closing clearly through a zone is a breakout signal.</li>
        <li>A price touching a zone and reversing is a bounce signal.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.6 Key Market Structures</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SWING HIGH:</strong> A candle with a lower high on both sides of it. The highest point of a recent move.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SWING LOW:</strong> A candle with a higher low on both sides of it. The lowest point of a recent move.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">BREAK OF STRUCTURE (BOS):</strong> Price closes beyond a previous swing high (bullish BOS) or swing low (bearish BOS). This is the earliest signal that a trend may be changing.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">CHANGE OF CHARACTER (CHoCH):</strong> After a series of HH/HL in an uptrend, price makes a lower low for the first time. This is a stronger signal. The trend may be reversing, not just pausing.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">2.7 Trading With the Trend</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">The trend is your friend until it bends.</strong></p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">In an <strong style="color:var(--text);">uptrend:</strong> Look to buy pullbacks to support or previous resistance that has flipped to support. Do not sell just because price looks high.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">In a <strong style="color:var(--text);">downtrend:</strong> Look to sell bounces to resistance or previous support that has flipped to resistance. Do not buy just because price looks cheap.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">In a <strong style="color:var(--text);">range:</strong> Buy the support zone, sell the resistance zone. Use tighter stops and smaller targets. Ranges break. When they do, they move fast.</p>
    `,
    tools: [
      { name: 'Horizontal Line Tool', desc: 'Draw support and resistance levels on the chart', id: 'line-tool', demo: false },
      { name: 'Zone (Rectangle) Tool', desc: 'Define support and resistance as zones, not single lines', id: 'zone-tool', demo: false },
      { name: 'Multi-Timeframe Toggle', desc: 'View 4H structure, then drop to 1H for entry timing', id: 'mtf-toggle', demo: false },
      { name: 'Swing Markers', desc: 'Automatically identify and mark swing highs and lows', id: 'swing-markers', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 2 CHALLENGE</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Submit a sim trade that meets ALL of the following:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Before entering, draw at least one support or resistance level on the chart (drawing must be saved).</li>
          <li>Entry is within 10 pips/points of a drawn Support or Resistance level.</li>
          <li>Stop Loss is placed on the other side of the Support or Resistance level (not between price and the level).</li>
          <li>Risk/Reward ratio is at least 1:1.5 (if risking 20 pips, target must be at least 30 pips).</li>
        </ol>
      </div>
    `,
    criteria: [
      'A support or resistance level is drawn before entry.',
      'Entry is logically near the drawn level (within 10 pips/points).',
      'Stop Loss placement is logical (beyond the level, not random).',
      'Risk/Reward ratio meets the 1:1.5 minimum.',
      'Trade is in the direction of the higher-timeframe trend (counter-trend trades are penalised).'
    ]
  },

  3: {
    title: 'Stage 3: Technical Indicators',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">Technical Indicators</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Indicators do not predict. They describe. Know the difference. This stage teaches you to use indicators as confirmation tools, not decision makers. A single indicator is noise. Multiple indicators in confluence create a high probability trade.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.1 What Indicators Actually Are</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Every indicator is a mathematical formula applied to historical price data. They do not predict the future. They describe the past in a way that helps you assess the present.</p>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">Common mistake:</strong> Using indicators as entry signals in isolation. <strong style="color:var(--text);">Correct use:</strong> Using indicators to confirm what price structure and Support/Resistance levels already suggest.</div>
      </blockquote>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Indicators are divided into two categories:</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">LAGGING</strong> (trend following): Based on past data. Confirm trend. Examples: Moving Averages, MACD, Bollinger Bands.</li>
        <li><strong style="color:var(--text);">LEADING</strong> (momentum): Try to anticipate reversals. Often oscillate. Examples: RSI, Stochastic, CCI.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.2 Moving Averages (MA)</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">The most widely used indicator in existence. A moving average smooths price by averaging the last N candles.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SIMPLE MOVING AVERAGE (SMA):</strong> Sums the last 20 closing prices and divides by 20. All periods are weighted equally. Slower to react. Cleaner on higher timeframes.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">EXPONENTIAL MOVING AVERAGE (EMA):</strong> Gives more weight to recent prices. Faster to react to new moves. EMA(9) and EMA(21) are popular for short term traders. EMA(50) and EMA(200) are popular for trend identification.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">KEY USES:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">Trend direction:</strong> Price above MA equals uptrend bias. Price below MA equals downtrend bias.</li>
        <li><strong style="color:var(--text);">Dynamic Support and Resistance:</strong> Price often bounces off the 20 EMA or 50 EMA in trending markets.</li>
        <li><strong style="color:var(--text);">MA crossover:</strong> When fast MA crosses above slow MA, bullish signal (Golden Cross at 50/200). When fast crosses below slow, bearish signal (Death Cross at 50/200).</li>
      </ul>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">Important limitation:</strong> Moving averages lag. By the time the crossover happens, the move has often already started. Use them for confirmation, not prediction.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.3 RSI — Relative Strength Index</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Measures the speed and magnitude of recent price changes. Oscillates between 0 and 100. Default period is 14.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Traditional interpretation:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>RSI above 70: Overbought (price may be due for a pullback)</li>
        <li>RSI below 30: Oversold (price may be due for a bounce)</li>
        <li>RSI at 50: Neutral, transition zone</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Professional use (this is what actually works):</strong> Overbought/oversold signals alone are not enough. Price can stay overbought for weeks in a strong trend.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">RSI DIVERGENCE is the real power:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">Regular Bullish Divergence:</strong> Price makes a lower low, RSI makes a higher low. Downside momentum is weakening. Potential reversal up.</li>
        <li><strong style="color:var(--text);">Regular Bearish Divergence:</strong> Price makes a higher high, RSI makes a lower high. Upside momentum is weakening. Potential reversal down.</li>
        <li><strong style="color:var(--text);">Hidden Bullish Divergence:</strong> Price makes a higher low, RSI makes a lower low. Trend continuation signal in an uptrend.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.4 MACD — Moving Average Convergence Divergence</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Consists of three components:</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">MACD Line:</strong> EMA(12) minus EMA(26)</li>
        <li><strong style="color:var(--text);">Signal Line:</strong> EMA(9) of the MACD Line</li>
        <li><strong style="color:var(--text);">Histogram:</strong> MACD Line minus Signal Line (visualises distance)</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">KEY USES:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">Crossover signal:</strong> MACD Line crosses above Signal Line indicates bullish momentum. MACD Line crosses below Signal Line indicates bearish momentum.</li>
        <li><strong style="color:var(--text);">Zero line cross:</strong> MACD crossing above zero is uptrend confirmation. MACD crossing below zero is downtrend confirmation.</li>
        <li><strong style="color:var(--text);">Histogram shrinking:</strong> Momentum is fading. Possible reversal.</li>
        <li><strong style="color:var(--text);">Divergence:</strong> Same principle as RSI divergence. Very powerful when MACD histogram diverges from price.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.5 Bollinger Bands</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Consists of three lines: Middle Band (20 period SMA), Upper Band (Middle plus 2 standard deviations), Lower Band (Middle minus 2 standard deviations).</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Statistical principle: approximately 95 percent of price action falls within the bands. When price touches or exceeds a band, it is statistically unusual.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">KEY USES:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">SQUEEZE:</strong> When bands narrow, volatility is low. A breakout often follows. Direction is unknown — wait for candle close to confirm which way.</li>
        <li><strong style="color:var(--text);">WALK THE BAND:</strong> In strong trend, price can walk along upper or lower band for extended periods. Do not fade it.</li>
        <li><strong style="color:var(--text);">MEAN REVERSION:</strong> In ranging markets, price touching upper band and returning to middle is reliable pattern. Same for lower band.</li>
        <li><strong style="color:var(--text);">WIDTH:</strong> Expanding bands equal increasing volatility. Contracting bands equal decreasing volatility.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.6 Stochastic Oscillator</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Compares closing price to its price range over N periods. Outputs two lines: percent K (fast) and percent D (slow). Range is 0 to 100.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Traditional zones: above 80 equals overbought, below 20 equals oversold. The crossover of percent K and percent D within these zones is the signal:</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>Percent K crosses above percent D below 20: buy signal</li>
        <li>Percent K crosses below percent D above 80: sell signal</li>
      </ul>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">Critical rule:</strong> Stochastic works best in ranging/sideways markets. In strong trends, it gives false signals constantly. Always check the trend before using it.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.7 ATR — Average True Range</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Measures market volatility. Not a directional indicator. ATR tells you how much price typically moves in one period.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">KEY USES:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">Stop Loss sizing:</strong> If XAUUSD ATR(14) on 1H chart is 8 points, a stop of 8 to 12 points gives price room to breathe. A stop of 2 points will almost certainly be hit by noise.</li>
        <li><strong style="color:var(--text);">Position sizing:</strong> Wider ATR equals smaller position size. Narrow ATR equals larger position size.</li>
        <li><strong style="color:var(--text);">Trend assessment:</strong> Rising ATR equals volatility increasing, could be breakout. Falling ATR equals volatility decreasing, could be squeeze.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.8 Volume</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Volume represents the number of trades executed in a period. Higher volume equals more conviction behind the move. Lower volume equals less conviction. Move may not sustain.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">KEY RULES:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>Breakout on high volume: More likely to sustain.</li>
        <li>Breakout on low volume: More likely to fail (fake breakout).</li>
        <li>Price rising but volume falling: Trend weakening.</li>
        <li>Price falling but volume falling: Sellers losing conviction.</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Note:</strong> In forex, true volume data is not available because it is a decentralised market. Tick volume (number of price changes) is used as a proxy and is generally reliable.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.9 Combining Indicators: The Confluence Approach</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">No single indicator is reliable alone. Professional traders look for <strong style="color:var(--text);">CONFLUENCE</strong> — multiple independent signals agreeing.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Example of a high confluence long setup:</p>
      <ol style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li>Price is above the 50 EMA (trend filter: bullish)</li>
        <li>Price has pulled back to a key support zone</li>
        <li>RSI is at 35 and showing bullish divergence</li>
        <li>MACD histogram is starting to rise from negative territory</li>
        <li>A bullish engulfing candle forms at the support zone</li>
        <li>ATR shows normal volatility (not an extreme spike)</li>
      </ol>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Six independent signals all pointing the same way. That is a high confidence trade. One signal alone is noise.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">3.10 What Indicators Cannot Do</h3>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li>They cannot predict the future.</li>
        <li>They cannot account for sudden news events.</li>
        <li>They cannot tell you position size.</li>
        <li>They lag behind the market (especially lagging indicators).</li>
        <li>They are all derived from the same thing: price.</li>
      </ul>
      <blockquote style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;">The trader who relies only on indicators will eventually be destroyed by a strong trend that makes every oscillator overbought for months. Price structure always comes first. Indicators confirm. They do not lead.</div>
      </blockquote>
    `,
    tools: [
      { name: 'EMA 9, 21, 50, 200', desc: 'Coloured moving average lines on main chart, toggle individually', id: 'ema-lines', demo: false },
      { name: 'Bollinger Bands', desc: 'Upper, middle, lower bands overlay on main chart', id: 'bb-bands', demo: false },
      { name: 'RSI Panel', desc: 'Relative Strength Index below main chart with 70/30 lines', id: 'rsi-panel', demo: false },
      { name: 'MACD Panel', desc: 'Moving Average Convergence Divergence with histogram and zero line', id: 'macd-panel', demo: false },
      { name: 'Stochastic Panel', desc: 'Stochastic oscillator with 80/20 lines', id: 'stoch-panel', demo: false },
      { name: 'ATR Panel', desc: 'Average True Range volatility indicator', id: 'atr-panel', demo: false },
      { name: 'Volume Histogram', desc: 'Volume analysis at bottom of chart', id: 'volume-hist', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 3 CHALLENGE</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Submit a sim trade that meets ALL of the following:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Select and apply at least two indicators (selection must be logged before entry).</li>
          <li>Entry is supported by at least 2 indicator signals (write brief justification before entry).</li>
          <li>Risk/Reward ratio is at least 1:2.</li>
          <li>Stop Loss is ATR based (SL distance must be at least 1 times ATR value).</li>
          <li>Trade is in the direction of the 50 EMA.</li>
        </ol>
      </div>
    `,
    criteria: [
      'Indicators are selected before entry.',
      'Written justification is logically consistent with indicators chosen.',
      'Risk/Reward ratio meets the 1:2 minimum.',
      'Stop Loss is at least 1 times ATR from entry.',
      'Trade is in the direction of the 50 EMA.'
    ]
  },

  4: {
    title: 'Stage 4: Risk Management and Psychology',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">Risk Management and Psychology</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Every professional trader's actual edge is here. This stage teaches you that the edge is not better entries. The edge is how you manage loss and control your emotions. A trader who wins 40 percent with 1:3 ratios outperforms a trader who wins 70 percent with 1:0.5 ratios.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.1 Why Risk Management Is the Actual Edge</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Most beginners believe their edge comes from finding better entries. Professional traders know the real edge is in how you manage loss.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Mathematical reality:</strong></p>
      <pre style="font-family:var(--font-mono);background:var(--bg2);padding:12px;border-radius:8px;margin-bottom:12px;color:var(--text2);line-height:1.6;font-size:12px;">Trader A: 40% win rate, 1:3 R/R
40% × 3R gain = 1.2R average
60% × 1R loss = 0.6R average
Net: plus 0.6R per trade. Profitable.

Trader B: 70% win rate, 1:0.5 R/R
70% × 0.5R gain = 0.35R average
30% × 1R loss = 0.3R average
Net: plus 0.05R per trade. Barely profitable.</pre>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">The implication:</strong> You do not need to be right most of the time. You need to lose small when wrong and win big when right.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.2 The 1 Percent Rule</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Never risk more than 1 to 2 percent of your trading account on a single trade.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Why:</strong> If you risk 1 percent per trade and have 10 consecutive losses (unlikely but possible), you have lost 10 percent of your account. That is recoverable. If you risk 10 percent per trade and lose 10 in a row, you have lost your entire account.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">How to calculate:</strong></p>
      <pre style="font-family:var(--font-mono);background:var(--bg2);padding:12px;border-radius:8px;margin-bottom:12px;color:var(--text2);line-height:1.6;font-size:12px;">Account: $10,000
Risk per trade: 1% = $100
Stop Loss: 20 pips on EUR/USD
Pip value (micro lot): $0.10
Position size: $100 ÷ (20 × $0.10) = 50 micro lots = 0.05 lots</pre>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">This calculation is built into the Wingman Risk Calculator. Use it on every trade, not guessing the size.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.3 Risk and Reward Ratios Explained</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">R/R equals (Take Profit distance) divided by (Stop Loss distance).</p>
      <div style="background:var(--bg2);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-mono);color:var(--text2);font-size:12px;line-height:1.8;">R/R of 1:1 — For every $1 risked, you gain $1. You need over 50% win rate to be profitable.<br>R/R of 1:2 — For every $1 risked, you gain $2. You need over 33% win rate to be profitable.<br>R/R of 1:3 — For every $1 risked, you gain $3. You need over 25% win rate to be profitable.</div>
      </div>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Minimum acceptable R/R in Wingman Academy:</strong> 1:1.5</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Recommended for consistent profitability:</strong> 1:2 or above. Note: Higher R/R ratios are harder to achieve. A 1:5 R/R trade often means the target is so far away it is never reached. Find the balance between realistic targets and good ratios.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.4 Drawdown and Recovery</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">DRAWDOWN:</strong> The decline from a peak in your account balance. <strong style="color:var(--text);">MAXIMUM DRAWDOWN:</strong> The largest peak to trough decline ever.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">The brutal mathematics of recovery:</strong></p>
      <pre style="font-family:var(--font-mono);background:var(--bg2);padding:12px;border-radius:8px;margin-bottom:12px;color:var(--text2);line-height:1.6;font-size:12px;">10% loss requires 11% gain to recover
20% loss requires 25% gain to recover
30% loss requires 43% gain to recover
50% loss requires 100% gain to recover
80% loss requires 400% gain to recover</pre>
      <blockquote style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;">This is why preserving capital is everything in trading. It is easier to not lose money than to make it back.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.5 The Six Trading Psychology Traps</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">These are the Wingman Behaviour Detectors. Know them by name. Each costs you money through emotional decision making.</p>

      <div style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:14px;margin-bottom:6px;">1. REVENGE TRADING</div>
        <p style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:13px;margin-bottom:8px;">After a losing trade, immediately entering another trade to make the money back. The new trade is driven by emotion, not analysis. It almost always loses too.</p>
        <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;font-style:italic;">Rule: After any loss, take a 15 minute break. Minimum.</div>
      </div>

      <div style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:14px;margin-bottom:6px;">2. FOMO — Fear of Missing Out</div>
        <p style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:13px;margin-bottom:8px;">Entering a trade because price has already moved strongly and you don't want to miss the rest. You are entering late, into an extended move, with a poor entry, a wide Stop Loss, and a small target remaining.</p>
        <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;font-style:italic;">Rule: If you missed the setup, you missed it. The market will give you another opportunity.</div>
      </div>

      <div style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:14px;margin-bottom:6px;">3. EARLY EXIT</div>
        <p style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:13px;margin-bottom:8px;">Closing a winning trade before it reaches Take Profit because you are afraid it will turn around. This systematically destroys your R/R ratio. A 1:2 R/R trade exited at 1:0.8 is a losing strategy long term even if the trade was profitable.</p>
        <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;font-style:italic;">Rule: If your analysis was correct for entry, trust it for exit. Move your Stop Loss to breakeven instead.</div>
      </div>

      <div style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:14px;margin-bottom:6px;">4. STOP WIDENING</div>
        <p style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:13px;margin-bottom:8px;">Moving your Stop Loss further away when price approaches it, hoping the trade will recover.</p>
        <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;font-style:italic;">Rule: Never move a Stop Loss against your position. You can move it in your favour (trailing). Never away.</div>
      </div>

      <div style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:14px;margin-bottom:6px;">5. OVERTRADING</div>
        <p style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:13px;margin-bottom:8px;">Taking too many trades in a single session. Each trade without a clear setup reduces your edge. Decision fatigue sets in. Quality drops.</p>
        <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;font-style:italic;">Rule: Set a maximum trade limit per session. Two or three quality setups are better than ten mediocre ones.</div>
      </div>

      <div style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--text);font-size:14px;margin-bottom:6px;">6. TILT PATTERN</div>
        <p style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:13px;margin-bottom:8px;">A cascade of emotional decisions following a losing period. Increasing position sizes, abandoning your strategy, trading instruments you don't understand. The spiral before the account blowup.</p>
        <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;font-style:italic;">Rule: If you catch yourself in tilt, close the platform. Return tomorrow. The market will always be there.</div>
      </div>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.6 Building a Trading Plan</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">The most successful traders are boring. They do the same thing, the same way, every session. Your plan must answer:</p>
      <ol style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>Which instruments will I trade?</li>
        <li>Which timeframe is my primary analysis chart?</li>
        <li>Which timeframe is my entry chart?</li>
        <li>What is my maximum risk per trade?</li>
        <li>What is my maximum daily loss before I stop?</li>
        <li>What constitutes a valid entry signal for me?</li>
        <li>What constitutes a valid exit signal (other than Stop Loss/Take Profit)?</li>
        <li>What sessions will I trade?</li>
      </ol>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;">Without a plan, you are gambling. With a plan, you are testing a systematic approach that can be refined over time.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">4.7 Journalling — The Professional Habit</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Every professional trader keeps a trading journal. Not to track wins and losses, but to identify patterns in their own behaviour.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">After every trade, record:</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>Entry price, direction, instrument, session</li>
        <li>Why you entered (setup description)</li>
        <li>Stop Loss and Take Profit levels and reasoning</li>
        <li>Result (profit/loss in R, not dollars — dollars mislead)</li>
        <li>Emotion before entry (calm, excited, anxious, frustrated)</li>
        <li>What you would do differently</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">After 50 trades, patterns emerge. You will see which setups work for you, which sessions you trade best, and which emotional states lead to poor decisions. The journal is your feedback loop. Wingman's Sim Trader auto populates the journal. Your job is to add the emotional state and post trade reflection.</p>
    `,
    tools: [
      { name: 'Risk Calculator', desc: 'Calculate position size based on account risk and Stop Loss distance', id: 'risk-calc', demo: false },
      { name: 'Position Size Calculator', desc: 'Integrated into order entry panel for quick sizing', id: 'pos-size-calc', demo: false },
      { name: 'Trade Journal', desc: 'Log emotional state before trade (Calm, Anxious, Frustrated, Excited, Neutral)', id: 'trade-journal', demo: false },
      { name: 'Daily Max Loss Tracker', desc: 'Set daily loss limit in Settings, receive warnings when approached', id: 'daily-loss', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 4 CHALLENGE</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Submit three sim trades across at least two different sessions. All three trades must meet:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Position size calculated using the Risk Calculator (logged).</li>
          <li>Risk per trade is at most 2 percent of current sim balance.</li>
          <li>Risk/Reward ratio is at least 1:2 on all three trades.</li>
          <li>Emotional state is logged before each trade.</li>
          <li>No trades are opened within 15 minutes of a previous losing trade (Wingman enforces this lockout).</li>
          <li>Post trade reflection is written for each trade (minimum 20 words).</li>
        </ol>
      </div>
    `,
    criteria: [
      'All position sizes are calculated correctly using the Risk Calculator.',
      'All Risk/Reward ratios are at least 1:2.',
      'Emotional state is logged before each trade.',
      'Post trade reflections are substantive (minimum 20 words).',
      'No revenge trades, FOMO entries, or early exits are detected.'
    ]
  },

  5: {
    title: 'Stage 5: Advanced Tools and Market Context',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">Advanced Tools and Market Context</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">See what the majority cannot. Professional traders look beyond the chart. They use Fibonacci geometry, understand institutional order flow, read economic calendars, and interpret the positions of smart money. This stage teaches you to see the market through the lens of larger players.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">5.1 Fibonacci Retracements and Extensions</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Based on the Fibonacci sequence (each number is the sum of the previous two: 1, 1, 2, 3, 5, 8, 13, 21). The key ratios are: 23.6 percent, 38.2 percent, 50 percent, 61.8 percent, 78.6 percent, 100 percent.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">RETRACEMENTS:</strong> Used to find potential reversal areas within a move. When price makes a strong move (swing low to swing high), it often retraces to a Fibonacci level before continuing.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">How to draw in an uptrend:</strong> Click from the swing LOW to the swing HIGH. The Fibonacci levels draw between those points. Price often retraces to the 38.2 percent, 50 percent, or 61.8 percent level before continuing upward. In a downtrend: Click from swing HIGH to swing LOW.</p>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">The Golden Ratio:</strong> The 61.8 percent level is the most powerful. When it coincides with a key Support and Resistance zone, it is a very high confidence reversal area.</div>
      </blockquote>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">EXTENSIONS:</strong> Project where price may go after the retracement. Common targets: 127.2 percent, 161.8 percent, 261.8 percent of the initial move. These are used to set Take Profit targets.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">5.2 Trendlines and Channels</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">A trendline connects successive swing lows (in an uptrend) or successive swing highs (in a downtrend).</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li>Minimum two touch points to draw it</li>
        <li>Three touch points makes it significant</li>
        <li>Four or more touch points makes it very significant</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">CHANNELS:</strong> Draw a parallel line to the trendline on the other side. Price often oscillates between the two lines. Ascending channel (both lines up, bullish). Descending channel (both lines down, bearish). Horizontal channel (both flat, ranging).</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Trendline breaks:</strong> Among the most reliable signals. When price closes clearly through a major trendline with momentum and high volume, the structure has changed.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">5.3 Chart Patterns</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Patterns that repeat across all markets and timeframes because human psychology is consistent. These are high probability setups when combined with confluence.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">CONTINUATION PATTERNS (trend continues after):</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">Flag:</strong> A sharp move (the pole) followed by tight consolidation (the flag). Entry on break of flag in direction of pole.</li>
        <li><strong style="color:var(--text);">Pennant:</strong> Similar to flag but consolidation forms symmetrical triangle shape.</li>
        <li><strong style="color:var(--text);">Wedge:</strong> Price moves in converging lines same direction. Falling wedge in downtrend often resolves bullishly. Rising wedge in uptrend often resolves bearishly.</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">REVERSAL PATTERNS (trend changes after):</strong></p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">Head and Shoulders:</strong> Three peaks (left shoulder, higher head, right shoulder) with neckline below. Break of neckline equals bearish reversal. Target: measure head height above neckline, project downward from break.</li>
        <li><strong style="color:var(--text);">Inverse H&S:</strong> Same pattern upside down. Bullish reversal.</li>
        <li><strong style="color:var(--text);">Double Top/Bottom:</strong> Two similar highs/lows. Break of pullback level is trade signal.</li>
        <li><strong style="color:var(--text);">Cup and Handle:</strong> Rounded bottom (cup) followed by small consolidation (handle). Breakout above cup rim is strong bullish signal.</li>
      </ul>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">5.4 Market Context: The Tools Beyond Price</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Individual candles and indicators tell you about price. Broader context tells you about the forces driving price.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">ECONOMIC CALENDAR:</strong> Scheduled news events that move markets. High impact (red): Central bank decisions, NFP, CPI, GDP. Can move pairs 50 to 200+ pips in minutes. Medium impact (orange): PMI, retail sales, employment data. Low impact (yellow): Minor releases, usually ignored.</p>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">Professional rule:</strong> Do not hold trades through high impact news unless you understand exactly what the release means and have widened your Stop Loss. Most professionals either close positions before news or sit out.</div>
      </blockquote>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">COMMITMENT OF TRADERS (COT) REPORT:</strong> Published weekly by CFTC. Shows net positions of Commercials (hedgers), Non commercials (large specs, smart money), and Retail (small specs, often wrong at extremes). When large specs are at multi year highs in long positions, trend is likely well established. Do not use as short term entry signal — it is 3 day delayed.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">RETAIL SENTIMENT:</strong> Shows percentage of retail traders long vs short. Contrarian principle: retail traders are often wrong at extremes. If 80 percent are long, consider whether smart money is on other side. Used as context, not trigger.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">FEAR AND GREED INDEX:</strong> Composite index for crypto/risk sentiment. Extreme Fear (selling opportunity). Extreme Greed (correction risk). Used as background filter, not precise entry signal.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">5.5 Expert Advisors and Algorithmic Trading</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">An Expert Advisor (EA) is an automated trading program that executes trades based on programmed rules.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">What EAs can do:</strong> Execute entries and exits without intervention. Manage multiple trades simultaneously. Never experience fear or fatigue. Backtest on historical data.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">What EAs cannot do:</strong> Adapt to changing market regimes without reprogramming. Understand context (news, sentiment). Know when market has fundamentally changed. Replace human judgment.</p>
      <blockquote style="background:rgba(255,61,90,0.08);border-left:4px solid var(--red);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;"><strong style="color:var(--text);">EA scams:</strong> Retail market is full of EAs sold for $200 to $2,000 claiming guaranteed returns. They nearly all fail. Any EA claiming consistent high returns without drawdown is fraudulent. Real professional algorithmic systems are not sold to retail traders.</div>
      </blockquote>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">5.6 Order Types Beyond Market Orders</h3>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:16px;">
        <li><strong style="color:var(--text);">Market Order:</strong> Execute immediately at current price. Subject to slippage in fast markets.</li>
        <li><strong style="color:var(--text);">Limit Order:</strong> Execute only at specific price or better. Buy Limit executes at or below price. Sell Limit executes at or above price. Risk: price may never reach your level.</li>
        <li><strong style="color:var(--text);">Stop Order:</strong> Execute when price reaches specified level. Buy Stop (breakout up). Sell Stop (breakout down).</li>
        <li><strong style="color:var(--text);">Stop Limit:</strong> Stop order becomes limit order once triggered. Protects against excessive slippage on breakouts.</li>
        <li><strong style="color:var(--text);">Trailing Stop:</strong> Stop loss that moves with price as trade profits. If price rises 50 pips and trailing stop is 20 pips, stop rises with it, locking in 30 pips while leaving room for more.</li>
      </ul>
    `,
    tools: [
      { name: 'Fibonacci Tool', desc: 'Draw Fibonacci retracements and extensions on the chart', id: 'fib-tool', demo: false },
      { name: 'Trendline Tool', desc: 'Draw trendlines with angle display', id: 'trendline-tool', demo: false },
      { name: 'Channel Tool', desc: 'Draw parallel channel lines', id: 'channel-tool', demo: false },
      { name: 'Pattern Labels', desc: 'Manually mark and label chart patterns', id: 'pattern-labels', demo: false },
      { name: 'COT Data Panel', desc: 'View Commitment of Traders positioning data', id: 'cot-panel', demo: false },
      { name: 'Retail Sentiment Panel', desc: 'See percentage of retail traders long vs short', id: 'sentiment-panel', demo: false },
      { name: 'Order Type Selector', desc: 'Choose between market, limit, stop, and trailing stop orders', id: 'order-types', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 5 CHALLENGE</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Submit a sim trade that meets ALL of the following:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Entry must use a LIMIT ORDER (not a market order).</li>
          <li>Entry level must be at a Fibonacci retracement level (38.2%, 50%, or 61.8%) with drawing saved.</li>
          <li>Take Profit must be at a Fibonacci extension level (127.2% or 161.8%).</li>
          <li>A trendline must be drawn and saved showing the trend direction.</li>
          <li>Write a pre trade plan (minimum 40 words) covering trend direction, Fibonacci rationale, and one broader context factor (session, COT, sentiment, or news avoidance).</li>
          <li>Risk/Reward must be at least 1:2.</li>
        </ol>
      </div>
    `,
    criteria: [
      'A limit order is used.',
      'Fibonacci levels are drawn correctly.',
      'Entry is logically at the Fibonacci level.',
      'Take Profit is at logical extension level.',
      'Pre-trade plan is substantive and consistent with setup.',
      'A broader context factor is genuinely incorporated.'
    ]
  },

  6: {
    title: 'Stage 6: Trading Strategies and Systems',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">Trading Strategies and Systems</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Find your edge. Test it. Repeat it. This stage teaches you to build a repeatable, rule based strategy and stick to it. Amateur traders have no strategy. Professionals have one, document it, and refine it based on evidence.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">6.1 What Makes a Strategy a Strategy</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">A strategy is a repeatable, rule based approach to entering and exiting the market. It must be specific enough that two different traders following it would take the same trade.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Not a strategy:</strong> "I buy when price looks good."</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Is a strategy:</strong> "I buy when price breaks above a 20 period high on the 4H chart, with RSI above 50, and 50 EMA pointing up, risking 1 percent of my account with 1:2 R/R."</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">A strategy has six components:</strong> Market/instrument (what you trade). Timeframe (where you analyse and enter). Entry criteria (exactly what triggers entry). Stop Loss rule (exactly how you calculate it). Take Profit rule (exactly how you calculate it). Trade management (what you do while in trade).</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">6.2 The Main Strategy Categories</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">TREND FOLLOWING:</strong> Buy in uptrends, sell in downtrends. Enter on pullbacks, not peaks. Hold until trend structure breaks. Best instruments: Forex majors, Gold, indices. Best timeframes: 4H, Daily. Tools: EMAs, MACD, Fibonacci retracements. Risk: Ranging markets destroy trend systems.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">BREAKOUT TRADING:</strong> Enter when price breaks through key level with momentum. Anticipate level, wait for close, enter on confirmation. Set Stop Loss just below broken level (now support). Target: projection of range. Risk: False breakouts. Always wait for candle close.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">MEAN REVERSION:</strong> Bet price returns to average after extreme move. Buy far below moving average in range. Sell far above in range. Tools: Bollinger Bands, RSI overbought/oversold, stochastic. Risk: In trending market, extreme can become more extreme. Highest failure rate for beginners without trend context.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SCALPING:</strong> Very short term. Seconds to minutes. Target: 5 to 15 pips. Stop Loss: 5 to 10 pips. Requires: Fast execution, low spreads, high concentration. Best in: London/NY overlap. Risk: Spread as percentage of target is very high.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">SWING TRADING:</strong> Holds hours to days. Catches swings. Less time intensive than scalping. Works around full time job. Best for: Retail traders who cannot watch all day. Tools: 4H and Daily chart, Fibonacci, Support/Resistance, trendlines.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">POSITION TRADING:</strong> Weeks to months. Based on fundamental analysis and major trend. Best for: Highly capitalised accounts. Least suitable for: Small accounts with low drawdown tolerance.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">6.3 ICT and Smart Money Concepts</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Increasingly popular methodology based on idea that institutional traders create liquidity by manipulating retail stop levels.</p>
      <ul style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">ORDER BLOCKS:</strong> Areas where institutional orders were placed. Often last bullish candle before strong bearish move, or last bearish before strong bullish. Price returns to these zones.</li>
        <li><strong style="color:var(--text);">FAIR VALUE GAPS:</strong> When price moves so fast it leaves a gap (high of candle before does not touch low after). Price tends to fill gap before continuing.</li>
        <li><strong style="color:var(--text);">LIQUIDITY SWEEPS:</strong> Price moves just beyond previous high/low (where stops clustered), then reverses. Sweep collects stops to fill institutional positions.</li>
        <li><strong style="color:var(--text);">DISPLACEMENT:</strong> Strong, impulsive move away from level. Usually indicates institutional participation.</li>
      </ul>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">This framework is powerful but complex. Requires significant screen time and practice to apply reliably.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">6.4 Backtesting — Testing Your Strategy on History</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Before trading any strategy live, test it on historical data first.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">Manual backtesting process:</strong> Open chart on intended timeframe. Cover right side (the future). Reveal one candle at a time. Apply strategy rules exactly. Record every trade. After 50 to 100 trades, calculate: Win rate, Average R, Maximum drawdown, Longest losing streak, Profit factor.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">What backtesting tells you:</strong> Whether strategy has positive expectancy. How it performs in trending vs ranging. Maximum drawdown.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">What backtesting does not tell you:</strong> Whether it will work in future. How you will emotionally handle losing streaks. The psychological challenge of real time trading. Forward testing (paper trading in real time) bridges this gap.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">6.5 Building Your Personal Trading Plan</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">By Stage 6, you have the knowledge to build a proper plan. This is the deliverable for Stage 6. The plan must cover:</p>
      <pre style="font-family:var(--font-mono);background:var(--bg2);padding:12px;border-radius:8px;margin-bottom:16px;color:var(--text2);line-height:1.6;font-size:12px;">Instruments: List 1-3 instruments you will specialise in
Sessions: Which session(s) you will trade
Primary timeframe: Your analysis chart
Entry timeframe: Your execution chart (usually 1-2 steps lower)
Entry criteria: Specific rules. What must be true to enter?
Invalid setups: What conditions make you NOT enter?
Stop Loss method: ATR-based? Behind structure? Fixed?
Take Profit method: Fixed target? Fibonacci extension? Trailing?
Max risk per trade: As percent of account
Daily stop: Maximum loss before you stop for the day
Weekly review: When you will review your journal</pre>
    `,
    tools: [
      { name: 'Strategy Template', desc: 'Fillable form for creating your trading plan (saved to localStorage)', id: 'strat-template', demo: false },
      { name: 'Backtesting Mode', desc: 'Hide candles to right of selected date, reveal one at a time', id: 'backtest-mode', demo: false },
      { name: 'Performance Calculator', desc: 'Input trade log, get statistics (win rate, profit factor, etc)', id: 'perf-calc', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 6 CHALLENGE</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Submit five sim trades all following the same stated strategy. Before any trade:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Complete and save your Trading Plan (all 10 fields filled).</li>
          <li>All five trades must match the criteria in the saved plan exactly.</li>
          <li>Each trade must have R/R ≥ 1:2.</li>
          <li>Position size must be calculated to meet stated max risk percent.</li>
          <li>Include pre trade justification in terms of your strategy.</li>
          <li>Include post trade reflection for each trade.</li>
        </ol>
      </div>
    `,
    criteria: [
      'Trading Plan is complete with all 10 fields filled and internally consistent.',
      'All five trades are consistent with the stated plan.',
      'Student did not deviate from the plan at any point.',
      'All five trades are logged with justification.',
      'None of the six behaviour traps are detected.',
      'Student demonstrates patience (no FOMO entries).'
    ]
  },

  7: {
    title: 'Stage 7: The Professional Standard',
    learn: `
      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:12px;font-size:18px;">The Professional Standard</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Consistency is the only proof of competence. Professional traders are judged not on individual trades but on risk adjusted returns over time. This final stage teaches you to measure yourself against institutional standards and understand what truly separates professionals from amateurs.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">7.1 What Professional Traders Actually Do</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Professional traders at funds and banks do not trade on instinct. They follow process, risk frameworks, and structured evaluation. They are judged on risk adjusted returns over time.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">THE METRICS THAT MATTER PROFESSIONALLY:</strong></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:6px;font-size:13px;">PROFIT FACTOR</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;line-height:1.6;margin-bottom:6px;">Gross profit divided by gross loss.</div>
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;line-height:1.5;">Below 1.0: Losing<br>1.0–1.5: Marginal<br>1.5–2.0: Decent<br>Above 2.0: Strong</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:6px;font-size:13px;">SHARPE RATIO</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;line-height:1.6;margin-bottom:6px;">Return relative to volatility/risk.</div>
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;line-height:1.5;">Above 1.0: Acceptable<br>Above 1.5: Good<br>Above 2.0: Excellent</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:6px;font-size:13px;">MAX DRAWDOWN</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;line-height:1.6;margin-bottom:6px;">Peak to trough decline.</div>
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;line-height:1.5;">Below 10%: Excellent<br>10–20%: Acceptable<br>Above 20%: Professional funds rarely tolerate</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:6px;font-size:13px;">WIN RATE &amp; AVG R</div>
          <div style="font-family:var(--font-display);color:var(--text2);font-size:12px;line-height:1.6;margin-bottom:6px;">Win rate below 30% is hard to sustain psychologically.</div>
          <div style="font-family:var(--font-mono);color:var(--text3);font-size:11px;line-height:1.5;">Positive average R + consistent application = profit</div>
        </div>
      </div>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">7.2 Prop Firm Trading and Funded Accounts</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Proprietary trading firms give traders access to institutional capital in exchange for a share of profits. Popular firms: FTMO, MyForexFunds, The Funded Trader.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">The evaluation process:</strong> Phase 1: Hit profit target (e.g. 10 percent) without exceeding drawdown limits (e.g. 5 percent daily, 10 percent overall). Phase 2: Repeat with smaller target to confirm consistency. Funded: Trade firm's money, keep 70 to 90 percent of profits.</p>
      <blockquote style="background:var(--bg2);border-left:4px solid var(--teal);padding:12px 16px;border-radius:8px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);color:var(--text2);line-height:1.6;font-size:14px;">The Wingman Academy Stage 7 challenge simulates a prop firm evaluation — demonstrating you can trade consistently within strict risk parameters.</div>
      </blockquote>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">Rules prop firms universally apply:</strong> Maximum daily loss (usually 4 to 5 percent). Maximum overall drawdown (usually 8 to 12 percent). Minimum trading days (usually 4+). No trading during major news (some firms). Consistent strategy (no random switching).</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">7.3 Institutional Market Mechanics</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">THE SMART MONEY CYCLE:</strong></p>
      <ol style="font-family:var(--font-display);color:var(--text2);line-height:1.8;margin-left:20px;margin-bottom:12px;">
        <li><strong style="color:var(--text);">Accumulation:</strong> Institutions quietly build positions. Price ranges. Retail leaves bored.</li>
        <li><strong style="color:var(--text);">Markup:</strong> Institutions drive price their direction. Trend begins. Retail notices and enters.</li>
        <li><strong style="color:var(--text);">Distribution:</strong> Institutions quietly exit into retail frenzy at top/bottom.</li>
        <li><strong style="color:var(--text);">Markdown/Reaccumulation:</strong> Price reverses. Retail holds losses.</li>
      </ol>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">This cycle explains why trends end when everyone talks about them, and why best entries often feel uncomfortable.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">7.4 Fundamental Analysis — The Macro Layer</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;">Technical analysis describes what price is doing. Fundamental analysis explains why it might continue or reverse.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">INTEREST RATES:</strong> Most powerful driver of currency strength. Higher rates attract foreign capital. Currency strengthens. Central banks (Fed, ECB, BoE, BoJ) set rates. Follow FOMC, ECB, BoE meetings.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">INFLATION (CPI):</strong> Central banks raise rates to fight inflation. Rising CPI leads to rate hike expectations. Rate hike expectations strengthen currency.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">EMPLOYMENT (NFP):</strong> Strong employment equals strong economy, potential rate rises, stronger currency. NFP (US Non Farm Payrolls) is most market moving monthly data point in forex.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:12px;"><strong style="color:var(--text);">GDP:</strong> Measures economic growth. Strong growth equals stronger currency. Recession fears equal weaker currency.</p>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;"><strong style="color:var(--text);">GEOPOLITICS:</strong> Wars, elections, trade disputes move markets. Cannot be predicted. Can only be managed with risk controls.</p>

      <h3 style="font-family:var(--font-display);color:var(--gold);font-weight:700;margin-bottom:8px;font-size:16px;">7.5 The Final Review: Self Assessment Framework</h3>
      <p style="font-family:var(--font-display);color:var(--text2);line-height:1.7;font-size:14px;margin-bottom:16px;">Before claiming professional readiness, honestly answer the following. If the answer to any is no, Stage 7 is about doing the work to make it yes.</p>
      <div style="display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:16px;">
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Can I describe my strategy in under 60 seconds?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Do I follow my trading plan on 90 percent plus of trades?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Has my behaviour score improved since Stage 1?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Have I had zero stop widening instances in my last 20 trades?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Have I had zero revenge trades in my last 20 trades?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Do I understand why I take every trade I take?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Do I have a daily and weekly review habit?</div>
        </div>
        <div style="background:var(--bg2);border:2px solid var(--gold);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.6;">□ Could I pass a prop firm evaluation on my current performance?</div>
        </div>
      </div>
    `,
    tools: [
      { name: 'Performance Analytics Dashboard', desc: 'Win rate, profit factor, average R, maximum drawdown across all sim trades', id: 'perf-dashboard', demo: false },
      { name: 'Prop Firm Simulation Mode', desc: 'Wingman enforces daily and overall drawdown limits and minimum trade session requirements', id: 'propfirm-mode', demo: false },
      { name: 'Fundamental Calendar', desc: 'Economic events with expected vs actual values', id: 'econ-calendar', demo: false },
      { name: 'Behaviour Score Chart', desc: 'Your behaviour score over time since Stage 1', id: 'behaviour-chart', demo: false }
    ],
    challenge: `
      <div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-family:var(--font-display);font-weight:700;color:var(--gold);margin-bottom:8px;font-size:14px;">STAGE 7 CHALLENGE — THE GRADUATION ASSESSMENT</div>
        <p style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:12px;">Complete a 10-trade sim session following prop firm rules. All 10 trades must:</p>
        <ol style="font-family:var(--font-display);color:var(--text2);font-size:13px;line-height:1.8;margin-left:20px;margin-bottom:16px;">
          <li>Follow the Trading Plan saved in Stage 6 (or an updated version).</li>
          <li>R/R ≥ 1:2 on every trade.</li>
          <li>Max risk per trade: 1 percent of current sim balance.</li>
          <li>Maximum daily drawdown: 4 percent of sim balance (Wingman enforces this).</li>
          <li>Overall drawdown must not exceed 8 percent during the 10-trade period.</li>
          <li>Minimum 5 separate trading sessions (not all 10 in one day).</li>
          <li>No behaviour flags on more than 2 of the 10 trades.</li>
          <li>Behaviour score at end of 10 trades must be ≥ 65.</li>
        </ol>
      </div>
    `,
    criteria: [
      'All 10 trades follow the saved Trading Plan exactly.',
      'All trades meet 1:2 R/R minimum.',
      'All trades risk 1 percent or less of current balance.',
      'Daily drawdown never exceeds 4 percent.',
      'Overall drawdown stays within 8 percent.',
      'Trades are spread across minimum 5 separate sessions.',
      'Behaviour flags appear on no more than 2 trades.',
      'Final behaviour score is at least 65.'
    ]
  }
};

var academyStage  = parseInt(localStorage.getItem('wm_academy_stage')  || '1', 10);
var academyStreak = parseInt(localStorage.getItem('wm_academy_streak') || '0', 10);

var ACADEMY_CONTENT = {
  1: {
    title: 'Stage 1: Foundation',
    sub: 'KNOWLEDGE CHECK',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">The Language of Trading</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">PIPS · LOTS · LEVERAGE · SPREAD · MARGIN</div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">What is a Pip?</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          A <strong style="color:var(--text);">pip</strong> (percentage in point) is the smallest standard price move in a currency pair. For most pairs like EUR/USD, one pip equals a move of <strong style="color:var(--gold);">0.0001</strong> in the price.
          <br><br>
          Example: EUR/USD moves from 1.1050 to 1.1055 — that is a 5 pip move upward.
          <br><br>
          For JPY pairs (like USD/JPY), one pip equals <strong style="color:var(--gold);">0.01</strong> because JPY is quoted to 2 decimal places.
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px 14px;margin-top:10px;">
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);letter-spacing:1px;margin-bottom:6px;">QUICK REFERENCE</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.9;">
            EUR/USD 1.10<strong style="color:var(--gold);">50</strong> → 1.10<strong style="color:var(--gold);">51</strong> = 1 pip<br>
            USD/JPY 143.<strong style="color:var(--gold);">50</strong> → 143.<strong style="color:var(--gold);">51</strong> = 1 pip<br>
            Gold (XAUUSD) 1920.<strong style="color:var(--gold);">0</strong> → 1920.<strong style="color:var(--gold);">1</strong> = 1 pip (often called a tick)
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">What is a Lot?</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          A <strong style="color:var(--text);">lot</strong> is the standardised unit of trade size. It determines how much money you make or lose per pip.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
          <div style="background:var(--bg2);border-radius:8px;padding:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;color:var(--gold);">Standard</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-top:2px;">1.0 lot</div>
            <div style="font-size:11px;color:var(--text2);margin-top:4px;">100,000 units. ~$10 per pip (EUR/USD).</div>
          </div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;color:var(--text);">Mini</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-top:2px;">0.1 lot</div>
            <div style="font-size:11px;color:var(--text2);margin-top:4px;">10,000 units. ~$1 per pip.</div>
          </div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;color:var(--text);">Micro</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-top:2px;">0.01 lot</div>
            <div style="font-size:11px;color:var(--text2);margin-top:4px;">1,000 units. ~$0.10 per pip.</div>
          </div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.03em;color:var(--text3);">Nano</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-top:2px;">0.001 lot</div>
            <div style="font-size:11px;color:var(--text2);margin-top:4px;">100 units. Minimal risk. Practice sizing.</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Leverage and Margin</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          <strong style="color:var(--text);">Leverage</strong> lets you control a large position with a smaller deposit. With 1:100 leverage, £1,000 controls a £100,000 position.
          <br><br>
          <strong style="color:var(--text);">Margin</strong> is the deposit your broker requires to open that leveraged position. It is not a fee — it is collateral held while the trade is open.
          <br><br>
          <strong style="color:var(--red);">The risk:</strong> leverage amplifies both gains AND losses equally. A 1% adverse move on a 1:100 leveraged position wipes your entire margin.
        </div>
        <div style="background:rgba(255,61,90,0.08);border:1px solid var(--red-dim);border-radius:8px;padding:12px;margin-top:10px;">
          <div style="font-family:var(--font-mono);font-size:8px;color:var(--red);letter-spacing:1px;margin-bottom:4px;">KEY RULE</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.6;">Never risk more than 1 to 2% of your account on a single trade, regardless of how high your leverage is.</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Spread</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          The <strong style="color:var(--text);">spread</strong> is the difference between the bid price (what you sell at) and the ask price (what you buy at). It is the broker's built-in cost per trade.
          <br><br>
          Example: EUR/USD Bid 1.1050 / Ask 1.1052 — the spread is 2 pips. You are immediately 2 pips in the red the moment you open a trade. Your trade must move at least 2 pips in your favour just to break even.
          <br><br>
          Major pairs like EUR/USD and GBP/USD typically have the tightest spreads (0.5 to 2 pips). Exotic pairs and indices carry much wider spreads.
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Reading Candlestick Charts</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;margin-bottom:10px;">
          Each candle on a chart represents price action over a specific time period. It shows four values: Open, High, Low, and Close.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:rgba(0,232,122,0.08);border:1px solid var(--green-dim);border-radius:8px;padding:12px;">
            <div style="font-family:'Inter',sans-serif;font-weight:700;color:var(--green);margin-bottom:4px;">Bullish candle</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.7;">Close is higher than Open. Price moved up during this period. Body is filled green (or hollow). Wicks show the high and low of the period.</div>
          </div>
          <div style="background:rgba(255,61,90,0.08);border:1px solid var(--red-dim);border-radius:8px;padding:12px;">
            <div style="font-family:'Inter',sans-serif;font-weight:700;color:var(--red);margin-bottom:4px;">Bearish candle</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.7;">Close is lower than Open. Price moved down during this period. Body is filled red (or solid). The top wick is the high, bottom wick is the low.</div>
          </div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--text2);line-height:1.7;">
          <strong style="color:var(--text);">Key patterns to know:</strong> Doji (indecision — open and close nearly equal), Hammer (potential reversal after a downtrend — long lower wick), Shooting Star (potential reversal after an uptrend — long upper wick), Engulfing (strong reversal signal — one candle completely engulfs the previous).
        </div>
      </div>

      <div class="card">
        <div class="card-label">Summary</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.9;">
          Before you place a single trade you must be able to answer: How many pips is my stop loss? What lot size gives me exactly 1% account risk at that stop? What is the spread cost on this pair? Which direction does the daily chart suggest? If you cannot answer these immediately, reread this section before moving to the Activity.
        </div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 1 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">OBSERVATION EXERCISE — NO TRADES YET</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">What to do</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">
          <div style="display:flex;gap:10px;margin-bottom:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;color:var(--gold);flex-shrink:0;">1</div>
            <div>Open the <strong style="color:var(--text);">Risk Calculator</strong> from the sidebar. Enter a balance of $10,000 and a risk of 1%. Choose EUR/USD as your instrument. Notice how the lot size and max loss change as you adjust the stop loss distance. This is position sizing in action.</div>
          </div>
          <div style="display:flex;gap:10px;margin-bottom:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;color:var(--gold);flex-shrink:0;">2</div>
            <div>Open the <strong style="color:var(--text);">Sim Trader</strong>. Look at the current chart. Identify: one bullish candle, one bearish candle, and the most recent candle. Note its open, high, low, and close by hovering over it.</div>
          </div>
          <div style="display:flex;gap:10px;margin-bottom:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;color:var(--gold);flex-shrink:0;">3</div>
            <div>Switch the chart to the Daily timeframe. Look at the last 10 candles. Is the overall direction: bullish (higher highs and higher lows), bearish (lower highs and lower lows), or ranging (sideways)?</div>
          </div>
          <div style="display:flex;gap:10px;">
            <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;color:var(--gold);flex-shrink:0;">4</div>
            <div>Calculate manually: if EUR/USD is at 1.1050 and your stop loss is 20 pips below entry, what is the stop price? What lot size would risk exactly $100 on a $10,000 account?</div>
          </div>
        </div>
      </div>
      <div class="card" style="background:rgba(212,175,55,0.04);">
        <div class="card-label">Answer Key</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">
          Stop price = 1.1050 minus 0.0020 = <strong style="color:var(--green);">1.1030</strong><br>
          1% of $10,000 = $100 risk<br>
          20 pip stop × $10 per pip (standard lot) = $200 per standard lot<br>
          So lot size = $100 / $200 = <strong style="color:var(--green);">0.5 lots</strong><br><br>
          Use the Risk Calculator to verify your answer. When it matches, you are ready for the quiz.
        </div>
      </div>
    `,
    quiz: [
      { q: 'EUR/USD moves from 1.10500 to 1.10530. How many pips did it move?', opts: ['2 pips','3 pips','0.3 pips','30 pips'], ans: 1, exp: 'The move is 0.00030, which equals 3 pips (each pip is 0.00010 for EUR/USD).' },
      { q: 'You have a $5,000 account and want to risk 1% per trade. Your stop loss is 25 pips away. Approximately what lot size should you trade on EUR/USD?', opts: ['0.02 lots','0.5 lots','1.0 lots','0.2 lots'], ans: 3, exp: '1% of $5,000 = $50 risk. Each pip on 0.1 lot = $1, so 25 pips = $2.50 per 0.01 lot, or $25 per 0.1 lot. $50 / $25 = 2 × 0.1 = 0.2 lots.' },
      { q: 'What does margin represent in a leveraged trade?', opts: ['The broker fee for opening a trade','The profit target of the trade','Collateral deposited to hold the leveraged position open','The maximum loss you can take'], ans: 2, exp: 'Margin is collateral — not a cost. It is held by the broker while the position is open and returned when the trade closes (minus any P&L).' },
      { q: 'A bearish engulfing candle appears after a 3-day uptrend. What does this typically signal?', opts: ['Continuation of the uptrend','Indecision in the market','A potential reversal to the downside','A breakout higher'], ans: 2, exp: 'A bearish engulfing pattern after an uptrend signals that sellers have overwhelmed buyers — the second candle completely engulfs the first, suggesting momentum is shifting downward.' },
      { q: 'EUR/USD has a spread of 1.5 pips. You go long. How many pips must price move in your favour before you are at break-even?', opts: ['0 pips — you are at breakeven immediately','1.5 pips','3 pips','0.5 pips'], ans: 1, exp: 'The spread is the immediate cost. You buy at the Ask price but the market is quoted at Bid. Price must move 1.5 pips in your favour just to reach your entry price on a closing basis.' }
    ]
  },

  2: {
    title: 'Stage 2: Risk First',
    sub: '10 GRADED SIM TRADES',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">Risk Management is the Edge</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">POSITION SIZING · THE 2% RULE · RISK:REWARD</div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Why Risk Management Comes Before Everything Else</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          Most traders fail not because they cannot read charts — they fail because they cannot manage risk. A trader with a 40% win rate and consistent 1:3 risk:reward is more profitable than a trader with a 70% win rate who blows up their account on one oversized trade.
          <br><br>
          Risk management is the only edge that guarantees your survival long enough to let your skills compound.
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">The 2% Rule</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          Risk no more than <strong style="color:var(--gold);">2% of your account on any single trade</strong>. This is not arbitrary — it is mathematical survival.
          <br><br>
          With a 2% max risk per trade, you would need to lose 50 consecutive trades to go broke. With 10% per trade, just 10 losses in a row is enough. Professional fund managers often cap at 0.5 to 1% per trade.
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;margin-top:10px;">
          <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1px;margin-bottom:8px;">DRAWDOWN TABLE</div>
          <div style="font-size:11px;color:var(--text2);line-height:2;">
            5 losses at 2% each = 9.4% drawdown — easily recoverable<br>
            5 losses at 5% each = 22.6% drawdown — needs 29% gain to recover<br>
            5 losses at 10% each = 40.9% drawdown — needs 69% gain to recover<br>
            <strong style="color:var(--red);">5 losses at 20% each = 67.2% drawdown — needs 205% gain to recover</strong>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Calculating Correct Position Size</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;margin-bottom:10px;">
          Use this formula every single time:
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:14px;font-family:var(--font-mono);font-size:11px;line-height:2;color:var(--text2);">
          Risk Amount ($) = Account Balance × Risk %<br>
          Pip Value = (Lot Size × Pip Size) × Exchange Rate<br>
          <strong style="color:var(--gold);">Lot Size = Risk Amount / (Stop Loss in Pips × Pip Value per lot)</strong>
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--text2);line-height:1.8;">
          <strong style="color:var(--text);">Worked example:</strong> Account $10,000, risk 1% = $100. EUR/USD stop loss 20 pips. Pip value on 1 standard lot = $10. So lot size = $100 / (20 × $10) = $100 / $200 = 0.5 lots.<br><br>
          The Wingman Risk Calculator does this automatically. But you must understand why the number is what it is.
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Risk:Reward Ratio</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          Risk:reward (R:R) compares how much you stand to lose versus how much you stand to gain. A 1:2 R:R means your potential gain is twice your potential loss.
          <br><br>
          At 1:2 R:R, you can be wrong 50% of the time and still be profitable. At 1:3 R:R, you can be wrong 65% of the time and still profit. <strong style="color:var(--gold);">Never take a trade with less than 1:1.5 R:R.</strong>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;">
          <div style="background:rgba(255,61,90,0.08);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:800;color:var(--red);">1:1</div>
            <div style="font-size:10px;color:var(--text3);margin-top:3px;">Need 50%+ win rate to profit</div>
          </div>
          <div style="background:rgba(212,175,55,0.08);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:800;color:var(--gold);">1:2</div>
            <div style="font-size:10px;color:var(--text3);margin-top:3px;">Profitable above 34% win rate</div>
          </div>
          <div style="background:rgba(0,232,122,0.08);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-family:'Inter',sans-serif;font-size:14px;font-weight:800;color:var(--green);">1:3</div>
            <div style="font-size:10px;color:var(--text3);margin-top:3px;">Profitable above 25% win rate</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-label">Stop Loss Placement</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          A stop loss must be placed at a price level where the original trade idea is invalidated — not at a distance that fits your preferred lot size. Place your stop first, then calculate your lot size from that distance.
          <br><br>
          Common stop placement: just below the most recent swing low (for BUY trades) or just above the most recent swing high (for SELL trades). Give the market breathing room — do not place stops so tight that normal price fluctuation triggers them.
        </div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 2 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">PLACE 10 SIM TRADES WITH CORRECT SIZING</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">Rules for this stage</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">
          <div style="display:flex;gap:10px;margin-bottom:10px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 1</div><div>Every trade must risk exactly 1 to 2% of your sim account. Use the Risk Calculator to find the correct lot size before entering.</div></div>
          <div style="display:flex;gap:10px;margin-bottom:10px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 2</div><div>Every trade must have a stop loss set at a logical price level — not arbitrary. Place it below a swing low (BUY) or above a swing high (SELL).</div></div>
          <div style="display:flex;gap:10px;margin-bottom:10px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 3</div><div>Every trade must have a minimum 1:1.5 risk:reward ratio. If the nearest logical take profit is less than 1.5x your stop distance, do not take the trade.</div></div>
          <div style="display:flex;gap:10px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 4</div><div>No single trade may exceed 3% account risk. Breaching this resets the stage immediately.</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">How to complete this stage</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">
          Open the Sim Trader and place 10 trades following the four rules above. You do not need to win — you need to size correctly. When you have 10 trades in your sim history, return here to take the quiz and confirm your understanding. AI will review your sizing on each trade.
        </div>
      </div>
    `,
    quiz: [
      { q: 'Your account is $8,000. You want to risk 1.5% on a trade. What is your maximum dollar risk on this trade?', opts: ['$80','$120','$150','$160'], ans: 1, exp: '$8,000 × 0.015 = $120. This is the maximum you should lose if stopped out.' },
      { q: 'Your stop loss is 40 pips away on GBP/USD. Each pip on 0.1 lot = $1. You want to risk $80. What lot size should you trade?', opts: ['0.1 lots','0.5 lots','0.2 lots','1.0 lots'], ans: 2, exp: '$80 risk / (40 pips × $1 per pip per 0.1 lot) = $80 / $40 = 2 × 0.1 lot = 0.2 lots.' },
      { q: 'You risk $100 on a trade with a 30-pip stop. Your take profit is 45 pips away. What is the risk:reward ratio?', opts: ['1:1','1:1.5','1:2','1:3'], ans: 1, exp: 'TP distance / SL distance = 45 / 30 = 1.5. So the R:R is 1:1.5.' },
      { q: 'Where is the most logical place to put a stop loss on a BUY trade?', opts: ['10 pips below your entry','Just below the most recent swing low','At a round number below entry','At the daily open price'], ans: 1, exp: 'A stop below the most recent swing low is logical — if price breaks that level, the uptrend structure is broken and your trade idea is invalidated.' },
      { q: 'You have a 40% win rate and a consistent 1:2 risk:reward. Over 100 trades risking $100 each, what is your approximate net profit?', opts: ['-$2,000','$0','+$2,000','+$4,000'], ans: 2, exp: '40 wins × $200 = $8,000 gained. 60 losses × $100 = $6,000 lost. Net = +$2,000. A 40% win rate is perfectly profitable at 1:2 R:R.' }
    ]
  },

  3: {
    title: 'Stage 3: Reading the Market',
    sub: '15 TRADES WITH HTF BIAS',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">Trade in the Direction of the River</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">MARKET STRUCTURE · HTF BIAS · MULTI TIMEFRAME ANALYSIS</div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Higher Timeframe Bias</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          Every timeframe tells a story — but the higher timeframe tells the bigger story. A 5-minute chart showing a bullish move means nothing if the daily chart is in a strong downtrend. Trading against the higher timeframe is like swimming upstream against a current.
          <br><br>
          <strong style="color:var(--gold);">HTF bias</strong> is your directional read on the market from the Daily or 4-Hour chart. Establish it before you open a lower timeframe chart for entries.
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Market Structure</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          Markets move in three structural states:
        </div>
        <div style="display:grid;gap:8px;margin-top:10px;">
          <div style="background:rgba(0,232,122,0.08);border:1px solid var(--green-dim);border-radius:8px;padding:12px;">
            <div style="font-family:'Inter',sans-serif;font-weight:700;color:var(--green);margin-bottom:4px;">Bullish structure</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.7;">Higher highs (HH) and higher lows (HL). Each rally breaks the previous high. Each pullback holds above the previous low. Only look for BUY opportunities.</div>
          </div>
          <div style="background:rgba(255,61,90,0.08);border:1px solid var(--red-dim);border-radius:8px;padding:12px;">
            <div style="font-family:'Inter',sans-serif;font-weight:700;color:var(--red);margin-bottom:4px;">Bearish structure</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.7;">Lower highs (LH) and lower lows (LL). Each selloff breaks the previous low. Each bounce fails below the previous high. Only look for SELL opportunities.</div>
          </div>
          <div style="background:var(--bg2);border-radius:8px;padding:12px;">
            <div style="font-family:'Inter',sans-serif;font-weight:700;color:var(--text3);margin-bottom:4px;">Ranging (Neutral)</div>
            <div style="font-size:11px;color:var(--text2);line-height:1.7;">Price oscillates between a clear support and resistance zone. No directional bias. Either avoid trading or trade range boundaries only.</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">The Multi Timeframe Approach</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;margin-bottom:10px;">
          Professional traders use a minimum of two timeframes: one for direction, one for entry.
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;">
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);letter-spacing:1px;margin-bottom:8px;">TIMEFRAME PAIRING</div>
          <div style="font-size:12px;color:var(--text2);line-height:2;">
            Daily → 4H: Swing trading (holds days to weeks)<br>
            4H → 1H: Intraday momentum trading<br>
            1H → 15M: Short-term scalp entries
          </div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--text2);line-height:1.8;">
          <strong style="color:var(--text);">Process:</strong> Check Daily for overall bias. Drop to 4H to see where price is within that bias. Drop to 1H or 15M for a precise entry trigger. Only enter on the lower timeframe when it aligns with the higher timeframe direction.
        </div>
      </div>

      <div class="card">
        <div class="card-label">Structure Break vs Pullback</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          In a bullish trend, price pulls back before making the next higher high. The key skill is distinguishing between a pullback (healthy — still buy the dip) and a structure break (trend is potentially reversing — caution).
          <br><br>
          A <strong style="color:var(--red);">break of structure</strong> occurs when price closes below the most recent higher low in an uptrend, or above the most recent lower high in a downtrend. This signals the trend may be ending. Do not enter in the old direction after a structure break — wait for confirmation of a new trend direction.
        </div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 3 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">15 TRADES WITH DECLARED HTF BIAS</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">The Bias Declaration Rule</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">
          Before every trade in this stage, you must record your HTF bias in the trade notes field:
          <br><br>
          <strong style="color:var(--text);">D1 bias: Bullish / Bearish / Neutral. Entry timeframe: 1H. Reason: [one sentence].</strong>
          <br><br>
          Then only trade in the direction of your declared bias. A SELL trade with a Bullish D1 bias declaration is an automatic fail for that trade — even if it profits.
        </div>
      </div>
      <div class="card">
        <div class="card-label">Target</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">
          Complete 15 sim trades with a bias declaration in each. At least 12 of the 15 must have the correct HTF bias alignment (entry direction matching declared bias, and declared bias being correct based on structure). All trades must still follow Stage 2 sizing rules.
        </div>
      </div>
    `,
    quiz: [
      { q: 'EUR/USD Daily chart shows: Jan high 1.1200, Jan low 1.0800, Feb high 1.1350, Feb low 1.0950, Mar currently at 1.1100. What is the HTF bias?', opts: ['Bearish — lower lows forming','Neutral — ranging between levels','Bullish — higher highs and higher lows','Unclear — not enough data'], ans: 2, exp: 'Feb high (1.1350) broke Jan high (1.1200) — a higher high. Feb low (1.0950) held above Jan low (1.0800) — a higher low. This is a clear bullish structure.' },
      { q: 'You identify a Bullish Daily bias on GBP/USD. On the 1H chart, price is near a recent support level and forms a bullish hammer. What should you do?', opts: ['Look for a BUY entry — aligns with HTF bias','Look for a SELL entry — fading the move','Avoid the trade — conflicting signals','Wait for the Daily close before deciding'], ans: 0, exp: 'The 1H trigger aligns with the Daily bullish bias. A bullish hammer at support on the lower timeframe, confirmed by the higher timeframe direction, is a high probability long setup.' },
      { q: 'In a strong downtrend on the 4H chart, the 15M chart shows a sharp bullish bounce and you see a BUY setup forming. What is the risk?', opts: ['None — short term moves are always tradeable','The 15M buy is counter-trend to the 4H — higher probability of failure','The bounce will definitely continue to the upside','This is the perfect entry for a trend reversal'], ans: 1, exp: 'Counter-trend trades on lower timeframes have a lower probability of success. The dominant 4H selling pressure can resume at any moment, trapping buyers.' },
      { q: 'What defines a "Break of Structure" in a bullish trend?', opts: ['Price failing to make a new high','Price closing below the most recent higher low','A bearish candle forming on the daily chart','Price touching a round number level'], ans: 1, exp: 'In a bullish trend, higher lows are the structural foundation. When price closes below the most recent higher low, the pattern of higher lows is broken — signalling a potential trend change.' },
      { q: 'You want to day-trade EUR/USD on the 15M chart. Which timeframe should you use to establish your directional bias first?', opts: ['1M chart for the fastest signals','15M chart — same as entry','1H or 4H chart','Weekly chart only'], ans: 2, exp: 'For 15M entries, check the 1H or 4H for bias. The 1M is noise. The Weekly is too slow for day trading. You need a timeframe 4 to 16 times higher than your entry for meaningful context.' }
    ]
  },

  4: {
    title: 'Stage 4: The Setup',
    sub: '15 TRADES — CONFLUENCE SCORING',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">Stack the Odds in Your Favour</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">CONFLUENCE · ENTRY QUALITY · INDICATORS</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">What is Confluence?</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">Confluence means multiple independent factors pointing in the same direction at the same time. A single signal is unreliable. Two signals are better. Three or more create a high probability setup.<br><br>Think of it as evidence stacking — the more evidence supporting a trade, the stronger the case for entering it.</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Key Confluence Factors</div>
        <div style="display:grid;gap:8px;margin-top:4px;">
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-weight:700;color:var(--gold);margin-bottom:3px;">1. HTF Bias alignment</div><div style="font-size:11px;color:var(--text2);">Entry direction matches the Daily or 4H trend structure.</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-weight:700;color:var(--gold);margin-bottom:3px;">2. Key level (support / resistance)</div><div style="font-size:11px;color:var(--text2);">Price is at or near a significant structural level — previous highs, lows, round numbers, or consolidation zones.</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-weight:700;color:var(--gold);margin-bottom:3px;">3. Candlestick pattern confirmation</div><div style="font-size:11px;color:var(--text2);">A reversal candle (hammer, engulfing, pin bar) forms at the level, confirming rejection.</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-weight:700;color:var(--gold);margin-bottom:3px;">4. Indicator alignment (RSI, EMA)</div><div style="font-size:11px;color:var(--text2);">RSI oversold for BUY setups / overbought for SELLs. Price above or below key EMAs (20, 50, 200).</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-weight:700;color:var(--gold);margin-bottom:3px;">5. Volume or momentum confirmation</div><div style="font-size:11px;color:var(--text2);">Increased volume on the reversal candle confirms genuine interest. Momentum divergence (price makes new low but RSI does not) is a powerful signal.</div></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Entry Timing</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">Entry timing separates the professional from the amateur. An amateur enters as soon as they see a signal. A professional waits for confirmation.<br><br><strong style="color:var(--text);">Wait for candle close:</strong> never enter mid candle. Wait for the candle to close and confirm the pattern before executing. A pattern that looks perfect mid candle often looks completely different at close.<br><br><strong style="color:var(--text);">Entry types:</strong> Market entry (enter at next candle open after signal closes), Limit entry (pre-place an order at the exact level you want to enter), Stop entry (place a buy stop above resistance or sell stop below support to enter on a breakout).</div>
      </div>
      <div class="card">
        <div class="card-label">The Pre Trade Checklist</div>
        <div style="font-size:13px;color:var(--text2);line-height:2;">Before clicking BUY or SELL, confirm each item:<br>
          <span style="color:var(--green);">✓</span> HTF bias identified and entry matches<br>
          <span style="color:var(--green);">✓</span> Entry is at a key structural level<br>
          <span style="color:var(--green);">✓</span> Candle pattern confirms direction<br>
          <span style="color:var(--green);">✓</span> Stop loss placed at logical invalidation point<br>
          <span style="color:var(--green);">✓</span> Minimum 1:1.5 R:R confirmed<br>
          <span style="color:var(--green);">✓</span> Lot size calculated for max 2% account risk<br>
          <span style="color:var(--green);">✓</span> No major news event in the next 30 minutes
        </div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 4 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">15 TRADES — SCORE EACH ON CONFLUENCE</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">Before each trade</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">Before entering each trade in the Sim Trader, write a brief note in the trade notes field listing every confluence factor you can identify. Score yourself:<br><br>Each factor present: +20 points (max 5 factors = 100 points)<br>Target average: 65 points across all 15 trades.<br>No trade should score below 40 (2 or fewer factors present).</div>
      </div>
      <div class="card">
        <div class="card-label">Aim for quality not quantity</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">It is better to take 2 well structured trades this week than 15 low quality ones. If no good setup appears, do not force one. Patience is a skill — and Stage 4 rewards it.</div>
      </div>
    `,
    quiz: [
      { q: 'A BUY setup has: Bullish D1 structure, price at a key support level, bullish engulfing candle on 1H, RSI at 32 (oversold). How many confluence factors does this have?', opts: ['1','2','3','4'], ans: 3, exp: '4 factors: HTF bias (Bullish D1), key level (support), candlestick pattern (engulfing), indicator (RSI oversold). A strong, well-confluent setup.' },
      { q: 'You see a beautiful bullish pin bar forming on the 15M chart. You enter mid candle because the pattern looks perfect. The candle then closes as a bearish candle. What mistake did you make?', opts: ['Entered too large a lot size','Entered without waiting for candle close — the pattern was not yet confirmed','Did not check the daily chart first','Set the wrong take profit level'], ans: 1, exp: 'Never enter mid candle. Patterns must be confirmed by the candle close. A setup that looks ideal with 5 minutes remaining can invalidate completely before the candle closes.' },
      { q: 'RSI on the 1H chart is at 72 (overbought) and you want to take a SELL trade. The D1 trend is bullish. Should you take this trade?', opts: ['Yes — RSI overbought is a strong sell signal','No — the overbought RSI conflicts with the bullish D1 bias','Yes — but with a very small lot size','No — RSI above 70 always means the market will reverse'], ans: 1, exp: 'In a strong bullish trend, overbought RSI is normal — the market can stay overbought for extended periods. Trading against the HTF trend on an overbought signal alone has a low success rate.' },
      { q: 'What is the purpose of a pre trade checklist?', opts: ['To slow you down so you miss entries','To ensure you only enter trades with multiple supporting factors — eliminating impulsive entries','To calculate your lot size automatically','To predict market direction with certainty'], ans: 1, exp: 'The checklist forces deliberate thinking before every entry. It filters out impulsive, emotionally-driven trades by requiring you to confirm objective criteria are met.' },
      { q: 'You have a strong BUY setup on EUR/USD. The trade checks all 5 confluence boxes. Then you notice a high impact US NFP report is releasing in 20 minutes. What should you do?', opts: ['Enter immediately to get ahead of the move','Wait until after the news release before entering','Enter half size now and add after the news','Cancel the trade — a confluence stack overrides news risk'], ans: 1, exp: 'High-impact news events create unpredictable, wide spikes that can stop out even well-placed trades. Wait for the announcement and for price to settle before entering — even the best setups should not be entered into news.' }
    ]
  },

  5: {
    title: 'Stage 5: Managing the Trade',
    sub: '20 TRADES — MANAGEMENT DISCIPLINE',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">Let Winners Run. Cut Losers Clean.</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">TRADE MANAGEMENT · HOLD RATIO · STOP WIDENING</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">The Most Expensive Habit in Trading</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">Most traders lose money not because they cannot find good entries — they lose because of what they do after the entry. Two behaviours are responsible for the majority of unprofitable trading:<br><br><strong style="color:var(--red);">1. Closing winning trades too early</strong> — taking profit at 30% of the potential move because of fear, then watching price continue to the original target.<br><br><strong style="color:var(--red);">2. Widening stop losses</strong> — moving a stop further away when price approaches it, turning a manageable loss into a catastrophic one.</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">The Hold Ratio</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">The hold ratio measures how long you hold winning trades versus losing trades. Profitable traders hold winners longer than losers.<br><br>A hold ratio above 1.2 means winners are held at least 20% longer than losers on average. This alone — without improving your win rate — makes a significant difference to long term profitability.</div>
        <div style="background:var(--bg2);border-radius:8px;padding:12px;margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:center;">
          <div><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--red);">0.7</div><div style="font-size:10px;color:var(--text3);">Cutting winners early. Common pattern in losing traders.</div></div>
          <div><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--green);">1.4</div><div style="font-size:10px;color:var(--text3);">Letting winners run. Consistent pattern in profitable traders.</div></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Stop Loss Management Rules</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">
          <strong style="color:var(--text);">Never widen your stop.</strong> If price is approaching your stop, it means your trade idea may be wrong. The stop is there precisely to protect you at that point. Moving it further away does not improve the trade — it increases your loss.<br><br>
          <strong style="color:var(--text);">You can move your stop to breakeven</strong> once price moves 1R in your favour (i.e., once you are up by the amount you risked). This eliminates the risk of a loss while leaving the trade open for further gains.<br><br>
          <strong style="color:var(--text);">Trailing stops</strong> lock in profits by following price at a set distance. Useful in strongly trending markets. Use them only once a trade is meaningfully in profit.
        </div>
      </div>
      <div class="card">
        <div class="card-label">Partial Take Profit vs Full Exit</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">One valid management approach is to close 50% of the position at the first target (locking in profit and reducing emotional pressure) while letting the remaining 50% run to a larger target with a breakeven stop. This balances the psychology of taking profit with the discipline of letting winners run.</div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 5 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">20 TRADES — MANAGEMENT TRACKING</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">Management rules for this stage</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">
          <div style="display:flex;gap:10px;margin-bottom:8px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 1</div><div>Never close a winning trade before the take profit is hit (unless a clear reversal signal forms on the entry timeframe).</div></div>
          <div style="display:flex;gap:10px;margin-bottom:8px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 2</div><div>Never widen a stop loss after entry under any circumstance.</div></div>
          <div style="display:flex;gap:10px;margin-bottom:8px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 3</div><div>Move stop to breakeven once price reaches 1R in profit.</div></div>
          <div style="display:flex;gap:10px;"><div style="color:var(--gold);font-weight:700;flex-shrink:0;">Rule 4</div><div>Allow losing trades to hit the stop loss naturally. Do not manually close early out of fear — trust the analysis.</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">Pass conditions</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">Hold ratio above 1.2. Fewer than 3 early exits. Zero stop widening events across 20 trades. Continue applying Stages 2, 3, and 4 rules throughout.</div>
      </div>
    `,
    quiz: [
      { q: 'You are 15 pips in profit on a trade with a 20-pip stop and a 40-pip target. You feel nervous and close the trade early. What problem does this create?', opts: ['None — taking profit is always correct','It reduces your effective R:R below what you planned, making your edge unprofitable over time','It is the correct action — securing profit is the goal','It shows disciplined risk management'], ans: 1, exp: 'If you plan for 1:2 R:R but consistently exit at 0.75R, your actual R:R becomes negative over time. Your entries can be excellent but poor management will make the strategy a loser.' },
      { q: 'Your stop is 20 pips below entry. Price drops to 18 pips below entry and slows down. You move your stop 10 pips further to give it more room. What are you doing?', opts: ['Smart trade management — giving the market breathing room','Risk management — adapting to changing conditions','Stop widening — increasing your loss if the trade fails','Breakeven management'], ans: 2, exp: 'Stop widening is one of the most destructive habits in trading. You are now risking 30 pips instead of 20 — a 50% increase in potential loss — in exchange for giving a trade more room that you originally judged was not needed.' },
      { q: 'Your trade is up by exactly your initial risk amount (1R). What is the correct action according to trade management rules?', opts: ['Close the full trade — 1R is a good profit','Do nothing — let it run to the full target','Move your stop loss to breakeven to eliminate risk','Add to the position to increase potential profit'], ans: 2, exp: 'Once a trade moves 1R in your favour, moving to breakeven eliminates the risk of turning a winner into a loser. You can now let it run to target with zero downside.' },
      { q: 'What does a hold ratio of 0.6 tell you about a trader?', opts: ['They hold winners much longer than losers — a positive sign','They are cutting winners at 60% of their stop distance','They are closing winning trades much faster than losing trades — a negative behavioural pattern','Their win rate is 60%'], ans: 2, exp: 'A hold ratio below 1.0 means losing trades are being held longer than winning trades. This is the opposite of profitable behaviour. Fear makes you exit winners early; hope makes you hold losers too long.' },
      { q: 'You want to manage a trade using partial close. Your setup targets 60 pips with a 20-pip stop. What is a sensible partial close plan?', opts: ['Close 50% at 20 pips (1R), move stop to breakeven, let 50% run to 60 pips','Close 100% at 20 pips to guarantee profit','Close 25% every 10 pips regardless of structure','Close 50% immediately at entry to reduce exposure'], ans: 0, exp: 'Closing 50% at 1R locks in a guaranteed profit and moves the stop to breakeven, making the remaining position risk-free. The second half can then target the full 60-pip objective without emotional pressure.' }
    ]
  },

  6: {
    title: 'Stage 6: Consistency',
    sub: '30 TRADES — ZERO BEHAVIOURAL FLAGS',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">The Mind is the Last Market to Conquer</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">BEHAVIOURAL DISCIPLINE · TILT · EMOTIONAL CONTROL</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">The Six Behavioural Failures</div>
        <div style="display:grid;gap:8px;margin-top:4px;">
          <div style="background:rgba(255,61,90,0.07);border-left:3px solid var(--red);padding:10px 12px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:var(--red);margin-bottom:2px;">Revenge Trading</div><div style="font-size:11px;color:var(--text2);">Entering a new trade immediately after a loss, driven by the urge to recover the money quickly. The new trade is emotional, not analytical — and typically loses too.</div></div>
          <div style="background:rgba(255,61,90,0.07);border-left:3px solid var(--red);padding:10px 12px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:var(--red);margin-bottom:2px;">Overtrading</div><div style="font-size:11px;color:var(--text2);">Trading excessive volume within a single session — taking marginal setups, entering multiple overlapping positions, or trading when no valid setup exists. Overtrading erodes an edge through transaction costs and low quality entries.</div></div>
          <div style="background:rgba(212,175,55,0.1);border-left:3px solid var(--gold);padding:10px 12px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:var(--gold);margin-bottom:2px;">FOMO Entry</div><div style="font-size:11px;color:var(--text2);">Entering a trade because price is moving strongly and you fear missing the move — not because a valid setup exists. FOMO entries are typically at the worst possible price, near the end of the move, with no logical stop placement.</div></div>
          <div style="background:rgba(212,175,55,0.1);border-left:3px solid var(--gold);padding:10px 12px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:var(--gold);margin-bottom:2px;">Early Exit</div><div style="font-size:11px;color:var(--text2);">Closing a winning trade before the target is hit, driven by fear of giving back profits. Destroys the R:R edge of your strategy over time.</div></div>
          <div style="background:rgba(212,175,55,0.1);border-left:3px solid var(--gold);padding:10px 12px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:var(--gold);margin-bottom:2px;">Stop Widening</div><div style="font-size:11px;color:var(--text2);">Moving a stop loss further away to avoid being stopped out. This converts a manageable planned loss into a potentially catastrophic unplanned one.</div></div>
          <div style="background:rgba(160,32,240,0.1);border-left:3px solid var(--purple);padding:10px 12px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:var(--purple);margin-bottom:2px;">Tilt</div><div style="font-size:11px;color:var(--text2);">Two or more of the above flags triggered in a single session. When tilt is detected, the correct action is to immediately stop trading for the rest of that session. Log what happened and return tomorrow with a fresh mindset.</div></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Building Routine and Discipline</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">Consistency does not come from motivation — it comes from systems. Build a daily trading routine: same analysis time, same process, same journalling. The market rewards traders who show up with a process, not traders who show up with emotion.</div>
      </div>
      <div class="card">
        <div class="card-label">The Daily Max Loss Rule</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">Set a daily maximum loss of 3 to 5% of your account. If you hit it, stop trading for the day — no exceptions. A bad day becomes catastrophic only when you keep trading through it. Your best trading comes when your mind is clear, not when you are chasing losses.</div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 6 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">30 TRADES — ALL 6 DETECTORS ACTIVE</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">The challenge</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">Complete 30 sim trades with all 6 behavioural detectors monitoring every move. Any flag triggered pauses the stage and requires a reflection note. The goal is zero flags across all 30 trades.<br><br>Additionally, end the stage with a positive P&L — the account does not need to be up significantly, just green.</div>
      </div>
      <div class="card">
        <div class="card-label">After each trade</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">Write one sentence in the trade notes describing your emotional state at entry and exit. Honest self-observation over 30 trades will reveal patterns about your psychology that no textbook can teach you.</div>
      </div>
    `,
    quiz: [
      { q: 'You lose 3 trades in a row. Without pausing to reassess, you immediately enter a 4th trade with double the lot size to recover the losses. Which behaviour is this?', opts: ['Overtrading','FOMO Entry','Revenge Trading','Tilt'], ans: 2, exp: 'Revenge trading is characterised by rapid re-entry after a loss, often with increased size, driven by the emotional desire to recover — not by a new analytical setup.' },
      { q: 'Two distinct valid setups form simultaneously on GBP/USD and EUR/JPY. You enter both at the same time with full size on each. Both move against you. You add a third position on AUD/USD. This sequence describes:', opts: ['Good diversification strategy','Overtrading and early tilt','Normal multi-pair trading','Conservative risk management'], ans: 1, exp: 'Entering multiple full-size positions simultaneously and then adding a third despite drawdown is overtrading. Tilt is imminent when the urge to trade is driven by loss aversion rather than valid setups.' },
      { q: 'EUR/USD has been rallying strongly for 4 hours. You have no setup — no confluence, no key level, no structure. But price is moving and you fear missing it. You enter long. This is:', opts: ['HTF bias alignment','Breakout trading','FOMO Entry','Momentum trading'], ans: 2, exp: 'Fear of Missing Out (FOMO) causes entries without a valid setup, typically near the exhaustion of a move. These entries often result in buying the top or selling the bottom of a momentum run.' },
      { q: 'What is the correct response when you trigger 2 or more behavioural flags in a single trading session?', opts: ['Increase position size to recover losses faster','Continue trading but only take A-grade setups','Stop trading for the rest of the session — you are in tilt','Call a financial advisor'], ans: 2, exp: 'Tilt is a compound state where multiple behavioural failures compound. The only correct response is to remove yourself from the market for the rest of that day, journal what happened, and return fresh.' },
      { q: 'You have a daily maximum loss rule of 3%. Your account is $10,000. You have already lost $280 today. A high-quality setup appears. What should you do?', opts: ['Take the trade — it is a valid setup and you have not hit the limit yet','Take half size only since you are close to the daily limit','Skip the trade — you are too close to the limit to take another risk','Increase size to try to recover the day\'s losses'], ans: 0, exp: 'You have lost 2.8% — still within the 3% rule. A genuinely valid setup can be taken with correct sizing. However, if the trade triggers your remaining 0.2%, stop for the day regardless of outcome.' }
    ]
  },

  7: {
    title: 'Stage 7: Graduation',
    sub: '50-TRADE FINAL ASSESSMENT',
    learn: `
      <div class="card" style="margin-bottom:12px;">
        <div style="font-family:'Inter',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.04em;margin-bottom:4px;">The Trader Passport</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;">FINAL ASSESSMENT · FULL REVIEW · GRADUATION</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">What this stage proves</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">Stage 7 is not a new lesson — it is a demonstration of everything you have built. Across 50 trades, you must apply every principle from Stages 1 through 6 simultaneously, consistently, and under conditions that test your emotional discipline as well as your technical skill.</div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">What Lumen grades you on</div>
        <div style="display:grid;gap:6px;margin-top:4px;">
          <div style="background:var(--bg2);border-radius:8px;padding:10px;display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text2);">Position sizing consistency</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);">20 pts</span></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text2);">HTF bias alignment accuracy</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);">20 pts</span></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text2);">Average confluence score</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);">20 pts</span></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text2);">Trade management discipline (hold ratio)</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);">20 pts</span></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text2);">Behavioural flags (zero = full score)</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--gold);">20 pts</span></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:12px;">
        <div class="card-label">Graduation Grades</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px;text-align:center;">
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--gold);">A</div><div style="font-size:10px;color:var(--text3);">90 to 100</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">Elite trader readiness</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--green);">B</div><div style="font-size:10px;color:var(--text3);">75 to 89</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">Strong foundation</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--blue);">C</div><div style="font-size:10px;color:var(--text3);">60 to 74</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">Developing — revisit weak stages</div></div>
          <div style="background:var(--bg2);border-radius:8px;padding:10px;"><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--text3);">D</div><div style="font-size:10px;color:var(--text3);">45 to 59</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">Needs improvement</div></div>
          <div style="background:rgba(255,61,90,0.08);border-radius:8px;padding:10px;"><div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:var(--red);">F</div><div style="font-size:10px;color:var(--text3);">Below 45</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">Restart from Stage 3+</div></div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">Your Trader Passport</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8;">On completion, the AI generates your Trader Passport: overall grade, a strengths and weaknesses profile, your best and worst trade with AI commentary, regime performance breakdown, and a shareable scorecard. This is your first real evidence of trading readiness.</div>
      </div>
    `,
    activity: `
      <div class="card" style="margin-bottom:12px;border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.03em;color:var(--gold);margin-bottom:4px;">Stage 7 Activity</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:1.5px;">50-TRADE COMPREHENSIVE FINAL REVIEW</div>
      </div>
      <div class="card" style="margin-bottom:10px;">
        <div class="card-label">The Final Assessment</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.9;">Apply every principle from every stage across 50 sim trades. No shortcuts. No exceptions. This is the final proof of what you have built.<br><br>When you have completed 50 trades, return here and submit your Graduation Quiz. The AI will generate your full Trader Passport based on your sim account history.</div>
      </div>
      <div class="card" style="background:rgba(212,175,55,0.04);border-color:var(--gold);">
        <div style="font-family:'Inter',sans-serif;font-weight:700;color:var(--gold);margin-bottom:6px;">After graduation</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8;">A Wingman graduate has demonstrated: correct sizing, HTF bias alignment, confluence quality, trade management discipline, and emotional consistency — across 130+ graded practice trades. That is the foundation. Real markets will test you further. Use Wingman Sim daily to maintain and sharpen the edge.</div>
      </div>
    `,
    quiz: [
      { q: 'What percentage of a $10,000 account should you risk on your first live trade after graduation?', opts: ['5% — you have earned it','As much as you are comfortable with','1% maximum — treat the live account with the same discipline as your sim account','0.5% or less — start conservatively and scale up as confidence builds in the live environment'], ans: 3, exp: 'The psychological difference between sim and live trading is significant. Starting with 0.5% or less allows you to experience real market emotions without the pain of large losses while adjusting. Scale up only after demonstrating the same consistency as in your sim.' },
      { q: 'Your Trader Passport shows a Grade B overall but highlights that your Stage 5 hold ratio was 0.8. What should you focus on?', opts: ['Take higher confluence setups to improve entries','Improve trade management — letting winners run further before exiting','Reduce position sizes across the board','Work on your HTF bias identification'], ans: 1, exp: 'A hold ratio of 0.8 below 1.0 means you are cutting winners shorter than you are holding losers. This is the specific weakness to address — the fix is to commit to a rule: do not close a winner before the target unless a reversal signal forms.' },
      { q: 'You complete 50 graduation trades and achieve: 72% HTF alignment, average confluence 68, hold ratio 1.3, zero behavioural flags, positive P&L. What grade would you expect?', opts: ['F — needs improvement','C — developing','B — strong foundation','A — elite readiness'], ans: 2, exp: 'Strong across all metrics with a 1.3 hold ratio, zero flags, and positive P&L. The 72% HTF alignment and 68 confluence score are solid but not perfect — a B grade reflects a strong foundation with some room to grow.' },
      { q: 'What is the most important mindset shift a Wingman graduate must make when moving to a real account?', opts: ['Trade larger to compensate for broker spreads','Apply identical rules as in simulation — the process does not change because money is real','Be more aggressive to grow the account faster initially','Trust your intuition more now that you have experience'], ans: 1, exp: 'The entire purpose of the Academy is to build habits that transfer to the live market. The rules do not change. The size may start smaller as you acclimatise, but the process — sizing, bias, confluence, management, behaviour — is identical.' },
      { q: 'A fellow trader tells you they skip the pre trade checklist on obvious setups to save time. What is wrong with this approach?', opts: ['Nothing — experienced traders do not need checklists','The checklist is only necessary for beginners','The checklist filters out impulsive entries. Skipping it, even once, establishes a habit of bypassing the process — which is where all behavioural failures begin','Obvious setups do not need analysis'], ans: 2, exp: 'The checklist is not training wheels — it is a professional process tool. Its value is greatest on the trades that feel most obvious, because those are the trades most likely to be driven by emotion rather than analysis. Every trade gets the same process.' }
    ]
  }
};

function openAcademyStage(n) {
  const overlay = document.getElementById('academy-overlay');
  const data = ACADEMY_CONTENT[n];
  if (!data) return;

  if (n > academyStage) {
    toast('Complete Stage ' + (n-1) + ' first to unlock this stage.');
    return;
  }

  // Set titles
  document.getElementById('overlay-stage-title').textContent = data.title;
  document.getElementById('overlay-stage-sub').textContent   = data.sub;

  // Set content
  document.getElementById('overlay-learn-content').innerHTML    = data.learn;
  document.getElementById('overlay-activity-content').innerHTML = data.activity;

  // Build quiz
  buildAcademyQuiz(data.quiz, n);

  // Show overlay on learn tab
  switchAcademyTab(document.querySelector('.academy-tab-btn'), 'learn');
  overlay.classList.add('open');
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeAcademyOverlay() {
  document.getElementById('academy-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function switchAcademyTab(btn, tab) {
  document.querySelectorAll('.academy-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.academy-content-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const el = document.getElementById('academy-content-' + tab);
  if (el) el.classList.add('active');
}

var quizAnswers = {};
var quizStageNum = 0;

function buildAcademyQuiz(questions, stageN) {
  quizAnswers = {};
  quizStageNum = stageN;
  const container = document.getElementById('overlay-quiz-content');
  const result    = document.getElementById('quiz-result');
  if (result) result.style.display = 'none';

  container.innerHTML = questions.map((q, i) => `
    <div class="card" style="margin-bottom:12px;" id="quiz-q-${i}">
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:10px;line-height:1.6;">${i+1}. ${q.q}</div>
      ${q.opts.map((opt, j) => `
        <button class="academy-quiz-opt" onclick="selectQuizAnswer(${i},${j})" id="quiz-opt-${i}-${j}">${opt}</button>
      `).join('')}
      <div id="quiz-exp-${i}" style="display:none;margin-top:8px;font-size:11px;color:var(--text3);background:var(--bg2);border-radius:6px;padding:8px 10px;line-height:1.6;"></div>
    </div>
  `).join('') + `<button class="btn btn-primary" onclick="submitAcademyQuiz()" style="width:100%;padding:13px;margin-top:4px;">Submit Answers</button>`;
}

function selectQuizAnswer(qi, oi) {
  quizAnswers[qi] = oi;
  // Highlight selected
  const q = ACADEMY_CONTENT[quizStageNum].quiz[qi];
  for (let j = 0; j < q.opts.length; j++) {
    const btn = document.getElementById('quiz-opt-' + qi + '-' + j);
    if (btn) { btn.classList.remove('correct','wrong'); btn.style.borderColor = ''; }
  }
  const sel = document.getElementById('quiz-opt-' + qi + '-' + oi);
  if (sel) sel.style.borderColor = 'var(--gold)';
}

function submitAcademyQuiz() {
  const questions = ACADEMY_CONTENT[quizStageNum].quiz;
  let correct = 0;
  questions.forEach((q, i) => {
    const chosen = quizAnswers[i];
    for (let j = 0; j < q.opts.length; j++) {
      const btn = document.getElementById('quiz-opt-' + i + '-' + j);
      if (!btn) continue;
      btn.disabled = true;
      if (j === q.ans) btn.classList.add('correct');
      else if (j === chosen && j !== q.ans) btn.classList.add('wrong');
    }
    const expEl = document.getElementById('quiz-exp-' + i);
    if (expEl) { expEl.style.display = 'block'; expEl.textContent = q.exp; }
    if (chosen === q.ans) correct++;
  });

  const total   = questions.length;
  const passed  = correct >= Math.ceil(total * 0.8); // 80% pass threshold
  const result  = document.getElementById('quiz-result');
  result.style.display = 'block';
  result.innerHTML = `
    <div class="card" style="border-color:${passed?'var(--green)':'var(--red)'};">
      <div style="font-family:'Inter',sans-serif;font-size:20px;font-weight:800;letter-spacing:-0.04em;color:${passed?'var(--green)':'var(--red)'};margin-bottom:6px;">
        ${passed ? '✓ Quiz Passed' : '✗ Not quite'}
      </div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:12px;">You answered ${correct} of ${total} correctly. ${passed ? 'Well done — you have demonstrated understanding of this stage.' : 'Review the incorrect answers and the Learn section before retrying.'}</div>
      ${passed ? `<button class="btn btn-primary" onclick="markStageComplete(${quizStageNum})" style="width:100%;padding:12px;">Mark Stage ${quizStageNum} Complete</button>` : `<button class="btn btn-ghost" onclick="buildAcademyQuiz(ACADEMY_CONTENT[${quizStageNum}].quiz, ${quizStageNum})" style="width:100%;padding:12px;">Retry Quiz</button>`}
    </div>`;
  result.scrollIntoView({ behavior: 'smooth' });
}

function markStageComplete(n) {
  if (n >= academyStage) {
    academyStage = n + 1;
    localStorage.setItem('wm_academy_stage', String(academyStage));
  }
  toast('Stage ' + n + ' complete! Stage ' + Math.min(academyStage, 7) + ' unlocked.');
  closeAcademyOverlay();
  updateAcademyProgress();
}

function academySelectStage(n) { openAcademyStage(n); }

function updateAcademyProgress() {
  const fill     = document.getElementById('academy-progress-fill');
  const label    = document.getElementById('academy-stage-label');
  const streakEl = document.getElementById('academy-streak');
  const simEl    = document.getElementById('academy-sim-trades');

  const stagesComplete = Math.max(0, academyStage - 1);
  if (fill)     fill.style.width = (stagesComplete / 7 * 100) + '%';
  if (label)    label.textContent = academyStage <= 7 ? 'Stage ' + academyStage + ' of 7' : 'Graduated';
  if (streakEl) streakEl.textContent = academyStreak;
  const simTrades = JSON.parse(localStorage.getItem('wm_sim_trades') || '[]');
  if (simEl) simEl.textContent = simTrades.length;

  // Update stage cards
  document.querySelectorAll('.academy-stage').forEach((el, i) => {
    const n = i + 1;
    el.classList.remove('active','completed','locked');
    if (n < academyStage)       el.classList.add('completed');
    else if (n === academyStage) el.classList.add('active');
    else                         el.classList.add('locked');
    // Update lock icon
    const numEl = el.querySelector('.academy-stage-num');
    if (numEl) numEl.textContent = n < academyStage ? '✓' : n === academyStage ? String(n) : 'L';
  });

  // Update detail panel
  const detailTitle = document.getElementById('overlay-stage-title');
  if (!detailTitle) return;
  const currentData = ACADEMY_CONTENT[Math.min(academyStage, 7)];
  document.getElementById('academy-stage-detail').querySelector('[class="btn btn-primary"]')?.setAttribute('onclick', 'openAcademyStage(' + Math.min(academyStage,7) + ')');
}


// Called by the bootstrap after every JS module is confirmed loaded.
// Replaces window.addEventListener('load') which is unreliable: on cached
// loads the load event fires before dynamic modules finish loading, causing
// ReferenceError on functions like buildInstPanel (defined in markets.js).
function __wmReady() {
  launchApp(); // Auto-launch — all features free, no API key prompt needed
  buildChecklist();
  buildRules();
  renderTrades();
  updateRisk();
  startClock();
  renderAlerts();
  if (priceAlerts.filter(a=>!a.triggered).length) startAlertChecking();
}

function launchApp() {
  // Remove display:none but let CSS media queries control the layout value (grid/flex)
  const appEl = document.getElementById('app');
  appEl.style.removeProperty('display');
  // Fallback if CSS doesn't kick in
  if (getComputedStyle(appEl).display === 'none') {
    appEl.style.display = window.innerWidth >= 1200 ? 'grid' : window.innerWidth >= 768 ? 'grid' : 'flex';
  }

  // Always start on home tab and sync nav active states
  navigate('home', null);

  // Show right panel on desktop
  if (window.innerWidth >= 1200) {
    const rp = document.getElementById('right-panel');
    if (rp) rp.style.removeProperty('display');
  }

  updateRisk();
  syncBinanceConnections(); // start Binance WS for crypto pairs immediately
  fetchLivePrices();
  updateSidebarStats();
  startClock();
  updateTrialBadge();       // show free scan counter if no Claude key
  buildInstPanel();       // pre-build instrument dropdown
  buildChartInstPanel();  // pre-build chart instrument dropdown
  updateCorrHint();       // init correlation hint
  // Pre-load today's events for scan news strip
  const _today = new Date(); _today.setHours(0,0,0,0);
  loadEventsForDate(_today).then(() => {
    const ds = dateStr(_today);
    if (calEventCache[ds]) renderScanNewsStrip(calEventCache[ds]);
    else renderScanNewsStrip([]); // clear "loading" state
  }).catch(() => {
    renderScanNewsStrip([]); // clear on error too
  });
  // Fallback: clear "Loading events..." after 5 seconds regardless
  setTimeout(() => {
    const strip = document.getElementById('scan-news-strip');
    if (strip && strip.innerHTML.includes('Loading')) {
      renderScanNewsStrip([]);
    }
  }, 5000);
  // Chart initialises lazily when user navigates to the chart tab
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACADEMY STAGE 6 — RENDERING ENGINE, STATE MACHINE, GRADING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// ── STATE MACHINE ─────────────────────────────────────────────────────────────
function acadGetCurrentStage() {
  return parseInt(localStorage.getItem('wm_academy_stage') || '1', 10);
}

function acadGetStatus(n) {
  var stored = localStorage.getItem('wm_stage_' + n + '_status');
  if (stored) return stored;
  var current = acadGetCurrentStage();
  if (n < current) return 'passed';
  if (n === current) return 'active';
  return 'locked';
}

function acadSetStatus(n, s) {
  localStorage.setItem('wm_stage_' + n + '_status', s);
}

function acadGetAttempts(n) {
  return parseInt(localStorage.getItem('wm_stage_' + n + '_attempts') || '0', 10);
}

function acadIncrAttempts(n) {
  var v = acadGetAttempts(n) + 1;
  localStorage.setItem('wm_stage_' + n + '_attempts', String(v));
  return v;
}

function acadCooldownActive(n) {
  var ts = parseInt(localStorage.getItem('wm_stage_' + n + '_cooldown') || '0', 10);
  return ts > Date.now();
}

function acadCooldownRemaining(n) {
  var ts = parseInt(localStorage.getItem('wm_stage_' + n + '_cooldown') || '0', 10);
  return Math.max(0, ts - Date.now());
}

// ── UI STATE ──────────────────────────────────────────────────────────────────
var acadActiveStage = 1;
var acadActiveTab   = 'learn';
var acadReadHandler = null;

// ── STAGE MAP ─────────────────────────────────────────────────────────────────
function acadRenderMap() {
  var container = document.getElementById('acad-map-nodes');
  if (!container) return;
  var current  = acadGetCurrentStage();
  var html     = '';

  for (var i = 1; i <= 7; i++) {
    var status    = acadGetStatus(i);
    var viewing   = (i === acadActiveStage);
    var nodeClass = 'acad-node acad-node-' + status + (viewing ? ' acad-node-viewing' : '');
    var clickable = (status !== 'locked');
    var onclick   = clickable ? 'onclick="acadSwitchStage(' + i + ')"' : '';

    var icon = '';
    if (status === 'passed') {
      icon = '<img src="icons/icon-check.svg" width="15" height="15" alt="">';
    } else if (status === 'locked') {
      icon = '<img src="icons/icon-lock.svg" width="13" height="13" alt="">';
    } else {
      icon = String(i);
    }

    var stageTitle = (ACADEMY_STAGES[i] || ACADEMY_CONTENT[i] || {}).title || ('Stage ' + i);
    html += '<div class="acad-node-wrap">';
    html += '<div class="' + nodeClass + '" ' + onclick + ' title="' + stageTitle + '">' + icon + '</div>';
    html += '<div class="acad-node-label">' + i + '</div>';
    html += '</div>';
    if (i < 7) {
      html += '<div class="acad-line' + (status === 'passed' ? ' acad-line-done' : '') + '"></div>';
    }
  }

  container.innerHTML = html;

  var countEl = document.getElementById('acad-map-stage-count');
  if (countEl) {
    var passed = Math.max(0, current - 1);
    countEl.textContent = passed + ' of 7 complete';
  }
}

// ── BEHAVIOUR FLAGS ───────────────────────────────────────────────────────────
var ACAD_FLAG_LABELS = {
  REVENGE_TRADE:  'REVENGE TRADE',
  FOMO_ENTRY:     'FOMO ENTRY',
  EARLY_EXIT:     'EARLY EXIT',
  STOP_WIDENING:  'STOP WIDENING',
  OVERTRADE:      'OVERTRADE',
  TILT_PATTERN:   'TILT PATTERN'
};

function acadRenderFlags() {
  var container = document.getElementById('acad-flags-list');
  if (!container) return;
  var log  = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]');
  var last = log.slice(0, 3);

  if (!last.length) {
    container.innerHTML = '<span class="acad-flag-none">No behaviour flags detected. Well done.</span>';
    return;
  }

  container.innerHTML = last.map(function(f) {
    var label = ACAD_FLAG_LABELS[f.type] || f.type;
    var rel   = acadRelTime(f.timestamp);
    return '<span class="acad-flag-badge">' + label + '</span>' +
           '<span class="acad-flag-time">' + rel + '</span>';
  }).join('');
}

function acadRelTime(ts) {
  var diff = Date.now() - ts;
  var mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' min ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
  var days = Math.floor(hrs / 24);
  return days + (days === 1 ? ' day ago' : ' days ago');
}

// ── STAGE HEADING ─────────────────────────────────────────────────────────────
function acadRenderHeading() {
  var el = document.getElementById('acad-stage-heading');
  if (!el) return;
  var n         = acadActiveStage;
  var status    = acadGetStatus(n);
  var stageData = ACADEMY_STAGES[n] || ACADEMY_CONTENT[n] || {};
  var title     = stageData.title || ('Stage ' + n);

  var badgeClass = 'acad-badge-' + status;
  var badgeLabels = { passed: 'PASSED', active: 'IN PROGRESS', cooldown: 'COOLDOWN', locked: 'LOCKED' };
  var badge = '<span class="acad-status-badge ' + badgeClass + '">' + (badgeLabels[status] || status.toUpperCase()) + '</span>';

  el.innerHTML =
    '<div class="acad-heading-inner">' +
      '<div class="acad-heading-num">' + n + '</div>' +
      '<div>' +
        '<div class="acad-heading-title">' + title + '</div>' +
        badge +
      '</div>' +
    '</div>';
}

// ── STAGE SWITCHING ───────────────────────────────────────────────────────────
function acadSwitchStage(n) {
  acadActiveStage = n;
  acadRenderMap();
  acadRenderHeading();
  acadSwitchTab(acadActiveTab);
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
function acadSwitchTab(tab) {
  acadActiveTab = tab;

  document.querySelectorAll('.acad-tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  ['learn', 'tools', 'challenge', 'debrief'].forEach(function(t) {
    var pane = document.getElementById('acad-pane-' + t);
    if (pane) pane.style.display = (t === tab) ? '' : 'none';
  });

  var prog = document.getElementById('acad-read-progress');
  if (prog) prog.style.display = (tab === 'learn') ? '' : 'none';

  acadStopReadTracking();
  if (tab === 'learn')     { acadRenderLearn();     acadStartReadTracking(); }
  else if (tab === 'tools')     acadRenderTools();
  else if (tab === 'challenge') acadRenderChallenge();
  else if (tab === 'debrief')   acadRenderDebrief();
}

// ── LEARN TAB ─────────────────────────────────────────────────────────────────
function acadRenderLearn() {
  var n    = acadActiveStage;
  var pane = document.getElementById('acad-pane-learn');
  if (!pane) return;
  var data    = ACADEMY_STAGES[n] || ACADEMY_CONTENT[n];
  var readKey = 'wm_stage_' + n + '_read';

  if (!data) {
    pane.innerHTML = '<div class="acad-empty">Stage content is being prepared. Check back soon.</div>';
    return;
  }

  var content = data.learn || '<div class="acad-empty">No lesson content available yet.</div>';
  var alreadyRead = localStorage.getItem(readKey) === '1';
  var btnClass = 'acad-mark-read-btn' + (alreadyRead ? ' done' : '');
  var btnDisabled = alreadyRead ? '' : 'disabled';
  var btnText = alreadyRead ? 'Read' : 'Mark as Read';

  pane.innerHTML =
    '<div id="acad-learn-body">' + content + '</div>' +
    '<div class="acad-mark-read-wrap">' +
      '<button id="acad-mark-read-btn" class="' + btnClass + '" ' + btnDisabled + ' onclick="acadMarkRead(' + n + ')">' + btnText + '</button>' +
    '</div>';
}

function acadMarkRead(n) {
  localStorage.setItem('wm_stage_' + n + '_read', '1');
  var btn = document.getElementById('acad-mark-read-btn');
  if (btn) { btn.textContent = 'Read'; btn.classList.add('done'); btn.disabled = false; }
}

function acadStartReadTracking() {
  var shell = document.getElementById('tab-academy');
  if (!shell) return;
  acadReadHandler = function() {
    var body = document.getElementById('acad-learn-body');
    if (!body) return;
    var scrollTop    = shell.scrollTop;
    var scrollHeight = shell.scrollHeight - shell.clientHeight;
    var pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
    var bar = document.getElementById('acad-read-bar');
    if (bar) bar.style.width = pct + '%';
    if (pct >= 90) {
      var btn = document.getElementById('acad-mark-read-btn');
      if (btn && btn.disabled) btn.disabled = false;
    }
  };
  shell.addEventListener('scroll', acadReadHandler);
}

function acadStopReadTracking() {
  var shell = document.getElementById('tab-academy');
  if (shell && acadReadHandler) {
    shell.removeEventListener('scroll', acadReadHandler);
    acadReadHandler = null;
  }
}

// ── TOOLS TAB ─────────────────────────────────────────────────────────────────
function acadRenderTools() {
  var n    = acadActiveStage;
  var pane = document.getElementById('acad-pane-tools');
  if (!pane) return;
  var data = ACADEMY_STAGES[n];

  if (!data || !data.tools || !data.tools.length) {
    pane.innerHTML = '<div class="acad-empty">Tools introduced in this stage will be listed here once stage content is finalised.</div>';
    return;
  }

  pane.innerHTML = data.tools.map(function(t) {
    return '<div class="acad-tool-card">' +
      '<div class="acad-tool-name">' + t.name + '</div>' +
      '<div class="acad-tool-desc">' + t.desc + '</div>' +
      (t.demo ? '<button class="acad-tool-try-btn" onclick="acadToolDemo(\'' + t.id + '\')">Try it</button>' : '') +
    '</div>';
  }).join('');
}

function acadToolDemo(id) {
  toast('Tool demo: ' + id + '. Open the Sim Trader to try this tool live.');
}

// ── CHALLENGE TAB ─────────────────────────────────────────────────────────────
function acadRenderChallenge() {
  var n      = acadActiveStage;
  var pane   = document.getElementById('acad-pane-challenge');
  if (!pane) return;
  var status = acadGetStatus(n);
  var data   = ACADEMY_STAGES[n] || ACADEMY_CONTENT[n];

  if (status === 'locked') {
    pane.innerHTML = '<div class="acad-empty">Complete the preceding stage to unlock this challenge.</div>';
    return;
  }

  if (!data) {
    pane.innerHTML = '<div class="acad-empty">Challenge specification will appear here once stage content is finalised.</div>';
    return;
  }

  var challengeHtml = data.challenge || '<div class="acad-empty">Challenge specification coming in a future update.</div>';

  var criteriaHtml = '';
  if (data.criteria && data.criteria.length) {
    criteriaHtml =
      '<div class="acad-criteria-list">' +
        '<div class="acad-criteria-label">PASS CRITERIA</div>' +
        data.criteria.map(function(c) {
          return '<div class="acad-criterion"><span class="acad-criterion-dot"></span><span>' + c + '</span></div>';
        }).join('') +
      '</div>';
  }

  var actionHtml = '';
  if (status === 'passed') {
    actionHtml = '<div class="acad-passed-note">' +
      '<img src="icons/icon-pass.svg" width="16" height="16" alt=""> Stage passed.' +
      '</div>';
  } else if (acadCooldownActive(n)) {
    var hrs = Math.ceil(acadCooldownRemaining(n) / 3600000);
    actionHtml = '<div class="acad-cooldown-box">' +
      '<img src="icons/icon-clock.svg" width="14" height="14" alt="">' +
      '<span>Cooldown active. Try again in approximately ' + hrs + (hrs === 1 ? ' hour.' : ' hours.') + '</span>' +
      '</div>';
  } else {
    actionHtml = '<button class="acad-submit-btn" id="acad-submit-btn" onclick="acadSubmitForGrading(' + n + ')">Submit Trade for Grading</button>';
  }

  pane.innerHTML = '<div class="acad-challenge-body">' + challengeHtml + '</div>' + criteriaHtml + actionHtml;
}

// ── DEBRIEF TAB ───────────────────────────────────────────────────────────────
function acadRenderDebrief() {
  var n    = acadActiveStage;
  var pane = document.getElementById('acad-pane-debrief');
  if (!pane) return;

  // Stage 8 slot is the passport — show the full passport card
  if (acadGetCurrentStage() > 7 && n >= 7) {
    acadRenderPassport();
    return;
  }

  var history      = JSON.parse(localStorage.getItem('wm_grade_history') || '[]');
  var stageHistory = history.filter(function(r) { return r.stage === n; });
  var latest       = stageHistory[0];

  if (!latest) {
    pane.innerHTML = '<div class="acad-empty">No grading results yet for this stage. Submit a trade from the Challenge tab to receive your debrief.</div>';
    return;
  }

  var gradeColors = { A: 'var(--green)', B: 'var(--teal)', C: 'var(--gold)', D: 'var(--text3)', F: 'var(--red)' };
  var gradeColor  = gradeColors[latest.grade] || 'var(--text)';
  var statusColor = latest.passed ? 'var(--green)' : 'var(--red)';
  var statusLabel = latest.passed ? 'PASSED' : 'NOT YET PASSED';

  var criteriaHtml = '';
  if (latest.criteria_results && latest.criteria_results.length) {
    criteriaHtml = '<div class="acad-crit-list">' +
      latest.criteria_results.map(function(r) {
        var icon = r.passed
          ? '<img src="icons/icon-check.svg" width="13" height="13" alt="">'
          : '<span class="acad-crit-fail">&#x2715;</span>';
        return '<div class="acad-crit-row">' + icon +
          '<div><div class="acad-crit-name">' + r.criterion + '</div>' +
          '<div class="acad-crit-comment">' + r.comment + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  var strengthsHtml = '';
  if (latest.strengths && latest.strengths.length) {
    strengthsHtml = '<div class="acad-debrief-section">' +
      '<div class="acad-debrief-label">STRENGTHS</div>' +
      latest.strengths.map(function(s) {
        return '<div class="acad-debrief-item acad-item-good">' + s + '</div>';
      }).join('') + '</div>';
  }

  var improvementsHtml = '';
  if (latest.improvements && latest.improvements.length) {
    improvementsHtml = '<div class="acad-debrief-section">' +
      '<div class="acad-debrief-label">AREAS FOR IMPROVEMENT</div>' +
      latest.improvements.map(function(s) {
        return '<div class="acad-debrief-item acad-item-warn">' + s + '</div>';
      }).join('') + '</div>';
  }

  var coachingHtml = latest.coaching_note
    ? '<div class="acad-coaching-note">' + latest.coaching_note + '</div>'
    : '';

  pane.innerHTML =
    '<div class="acad-grade-card">' +
      '<div class="acad-grade-header">' +
        '<div class="acad-grade-letter" style="color:' + gradeColor + '">' + latest.grade + '</div>' +
        '<div>' +
          '<div class="acad-grade-status" style="color:' + statusColor + '">' + statusLabel + '</div>' +
          '<div class="acad-grade-score">Score: ' + latest.score + ' / 100</div>' +
        '</div>' +
      '</div>' +
      criteriaHtml + strengthsHtml + improvementsHtml + coachingHtml +
    '</div>';
}

// ── GRADING SYSTEM ─────────────────────────────────────────────────────────────
async function acadSubmitForGrading(n) {
  if (acadGetStatus(n) === 'passed') { toast('Stage ' + n + ' is already passed.'); return; }
  if (acadCooldownActive(n))         { toast('Cooldown is active. Please wait before resubmitting.'); return; }

  var history      = JSON.parse(localStorage.getItem('wm_grade_history') || '[]');
  var stageHistory = history.filter(function(r) { return r.stage === n; });
  var failStreak   = 0;
  for (var i = 0; i < stageHistory.length; i++) {
    if (!stageHistory[i].passed) failStreak++;
    else break;
  }
  if (failStreak >= 3) { acadShowIntervention(n); return; }

  var journal   = JSON.parse(localStorage.getItem('wm_trade_journal') || '[]');
  var flags     = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]').slice(0, 5);
  var data      = ACADEMY_STAGES[n] || ACADEMY_CONTENT[n] || {};
  var criteria  = data.criteria || [];

  var btn = document.getElementById('acad-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Grading...'; }

  var gradingSystem = 'You are an Academy grading engine. Grade the submitted trade against the stage criteria. Return only valid JSON.';
  var gradingPrompt = JSON.stringify({
    stage: n,
    criteria: criteria,
    trade: journal[0] || null,
    behaviourFlags: flags,
    justification: localStorage.getItem('wm_stage_' + n + '_justification') || ''
  });

  try {
    var res = await fetch(WORKER_URL + '/behaviour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: gradingSystem, prompt: gradingPrompt })
    });
    var data2 = await res.json();
    var text = data2.content && data2.content[0] && data2.content[0].text || '';
    var match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in grading response');
    var result  = JSON.parse(match[0]);
    result.stage     = n;
    result.timestamp = Date.now();

    var gHistory = JSON.parse(localStorage.getItem('wm_grade_history') || '[]');
    gHistory.unshift(result);
    if (gHistory.length > 100) gHistory = gHistory.slice(0, 100);
    localStorage.setItem('wm_grade_history', JSON.stringify(gHistory));

    acadIncrAttempts(n);
    acadProcessGradeResult(n, result);
  } catch (e) {
    toast('Grading service unavailable. Please try again shortly.');
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Trade for Grading'; }
  }
}

function acadProcessGradeResult(n, result) {
  if (result.passed) {
    acadSetStatus(n, 'passed');
    localStorage.setItem('wm_stage_' + n + '_passed_at', String(Date.now()));
    var nextStage = n + 1;
    var current   = acadGetCurrentStage();
    if (n >= current) {
      localStorage.setItem('wm_academy_stage', String(Math.min(nextStage, 8)));
      if (nextStage <= 7) acadSetStatus(nextStage, 'active');
    }
    acadShowPassAnimation();
    setTimeout(function() {
      acadSwitchStage(n);
      acadSwitchTab('debrief');
      acadRenderMap();
    }, 1800);
    acadRenderPassportTeaser();
    updateAcademyProgress();
  } else {
    acadSetStatus(n, 'cooldown');
    localStorage.setItem('wm_stage_' + n + '_cooldown', String(Date.now() + 86400000));
    acadSwitchTab('debrief');
    acadRenderChallenge();
  }
}

// ── PASS ANIMATION ─────────────────────────────────────────────────────────────
function acadShowPassAnimation() {
  var el = document.getElementById('acad-pass-anim');
  if (!el) return;
  el.style.display = 'flex';
  setTimeout(function() { el.style.display = 'none'; }, 1800);
}

// ── INTERVENTION MODAL ──────────────────────────────────────────────────────────
function acadShowIntervention(n) {
  var modal = document.getElementById('acad-intervention');
  if (!modal) return;
  var stageEl = document.getElementById('acad-intervention-stage');
  if (stageEl) stageEl.textContent = String(n);
  modal.style.display = 'flex';
}

function acadDismissIntervention(proceed) {
  var modal = document.getElementById('acad-intervention');
  if (modal) modal.style.display = 'none';
  if (proceed) {
    var n = acadActiveStage;
    localStorage.removeItem('wm_stage_' + n + '_cooldown');
    acadSetStatus(n, 'active');
    acadRenderChallenge();
  }
}

// ── TRADER PASSPORT TEASER ──────────────────────────────────────────────────────
function acadRenderPassportTeaser() {
  var el = document.getElementById('acad-passport-teaser');
  if (!el) return;
  var allPassed = acadGetCurrentStage() > 7;

  if (allPassed) {
    el.innerHTML =
      '<div class="acad-passport-unlocked">' +
        '<img src="icons/icon-passport.svg" width="24" height="24" alt="">' +
        '<div>' +
          '<div class="acad-passport-title">Trader Passport Unlocked</div>' +
          '<div class="acad-passport-sub">All 7 stages complete. View your Trader Passport in the Debrief tab.</div>' +
        '</div>' +
      '</div>';
  } else {
    el.innerHTML =
      '<div class="acad-passport-locked">' +
        '<img src="icons/icon-passport.svg" width="24" height="24" alt="" style="opacity:0.25;">' +
        '<div>' +
          '<div class="acad-passport-title acad-passport-blurred">Trader Passport</div>' +
          '<div class="acad-passport-sub">Complete all 7 stages to unlock your Trader Passport.</div>' +
        '</div>' +
      '</div>';
  }
}

// ── TRADER PASSPORT — STAGE 11 ────────────────────────────────────────────────

function acadPassportGetOrCreateId() {
  var id = localStorage.getItem('wm_passport_id');
  if (!id) {
    var a = Date.now().toString(36).toUpperCase().slice(-4);
    var b = Math.random().toString(36).toUpperCase().slice(-4);
    id = 'WM-' + a + '-' + b;
    localStorage.setItem('wm_passport_id', id);
  }
  return id;
}

function acadPassportStats() {
  var simTrades = JSON.parse(localStorage.getItem('wm_sim_trades')    || '[]');
  var journal   = JSON.parse(localStorage.getItem('wm_trade_journal') || '[]');
  var allTrades = journal.concat(simTrades);

  var total    = allTrades.length;
  var wins     = allTrades.filter(function(t) { return (t.pnl || 0) > 0; }).length;
  var winRate  = total ? Math.round(wins / total * 100) : 0;

  // Average R (pnl / risk — approximate via avg positive vs avg negative)
  var positives = allTrades.filter(function(t) { return (t.pnl||0) > 0; });
  var negatives = allTrades.filter(function(t) { return (t.pnl||0) < 0; });
  var avgWin  = positives.length ? positives.reduce(function(s,t){return s+(t.pnl||0);},0) / positives.length : 0;
  var avgLoss = negatives.length ? Math.abs(negatives.reduce(function(s,t){return s+(t.pnl||0);},0) / negatives.length) : 1;
  var avgR    = avgLoss ? (avgWin / avgLoss).toFixed(2) : '0.00';

  // Best instrument by net PnL
  var instMap = {};
  allTrades.forEach(function(t) {
    var k = t.pair || t.inst || t.instrument || 'N/A';
    instMap[k] = (instMap[k] || 0) + (t.pnl || 0);
  });
  var bestInst = 'N/A';
  var bestPnl  = -Infinity;
  Object.keys(instMap).forEach(function(k) {
    if (instMap[k] > bestPnl) { bestPnl = instMap[k]; bestInst = k; }
  });

  // Days to complete: from stage 1 first attempt to stage 7 passed
  var stage1Key = localStorage.getItem('wm_stage_1_passed_at');
  var stage7Key = localStorage.getItem('wm_stage_7_passed_at');
  var daysToComplete = 'N/A';
  if (stage1Key && stage7Key) {
    var ms = parseInt(stage7Key) - parseInt(stage1Key);
    daysToComplete = Math.max(1, Math.round(ms / 86400000));
  }

  // Behaviour score at graduation
  var behScore = (typeof calcBehaviourScore === 'function') ? calcBehaviourScore(30).score : 0;

  // Top flag overcome (most frequent in full log)
  var log    = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]');
  var counts = {};
  log.forEach(function(e) { counts[e.type] = (counts[e.type]||0)+1; });
  var topFlag = null, topCount = 0;
  Object.keys(counts).forEach(function(k) { if (counts[k] > topCount) { topCount = counts[k]; topFlag = k; }});
  var flagLabels = { REVENGE_TRADE:'Revenge trading', FOMO_ENTRY:'FOMO entry', EARLY_EXIT:'Early exit', STOP_WIDENING:'Stop widening', OVERTRADE:'Overtrading', TILT_PATTERN:'Tilt' };
  var topFlagLabel = topFlag ? (flagLabels[topFlag] || topFlag) : 'None';

  // Graduation date: stage 7 passed_at
  var gradDate = 'N/A';
  if (stage7Key) {
    gradDate = new Date(parseInt(stage7Key)).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }

  return { total, winRate, avgR, bestInst, behScore, daysToComplete, topFlagLabel, gradDate };
}

// Stage badge data for the passport row
function acadPassportBadges() {
  var badges = [];
  for (var i = 1; i <= 7; i++) {
    var passedAt = localStorage.getItem('wm_stage_' + i + '_passed_at');
    var dateStr  = '';
    if (passedAt) {
      var d = new Date(parseInt(passedAt));
      dateStr = d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
    }
    badges.push({ n: i, passed: !!passedAt, date: dateStr });
  }
  return badges;
}

// Score dial SVG (40px, inline)
function acadPassportScoreDial(score) {
  var pct    = Math.max(0, Math.min(100, score));
  var radius = 16;
  var circ   = 2 * Math.PI * radius;
  var filled = (pct / 100) * circ;
  var color  = pct >= 70 ? '#00E87A' : pct >= 40 ? '#F0B429' : '#FF3D5A';
  return '<svg width="40" height="40" viewBox="0 0 40 40" style="display:block;">' +
    '<circle cx="20" cy="20" r="' + radius + '" fill="none" stroke="#1C1C25" stroke-width="4"/>' +
    '<circle cx="20" cy="20" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="4"' +
      ' stroke-dasharray="' + filled.toFixed(1) + ' ' + (circ - filled).toFixed(1) + '"' +
      ' stroke-dashoffset="' + (circ * 0.25).toFixed(1) + '"' +
      ' stroke-linecap="round"/>' +
    '<text x="20" y="25" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="800" fill="' + color + '">' + score + '</text>' +
  '</svg>';
}

function acadPassportBuildCard(stats, identity, passportId, traderName) {
  var badges = acadPassportBadges();
  var scoreDial = acadPassportScoreDial(stats.behScore);

  var badgesHtml = badges.map(function(b) {
    return '<div class="pp-badge-item">' +
      '<div class="pp-badge-circle' + (b.passed ? ' pp-badge-passed' : '') + '">' + b.n + '</div>' +
      '<div class="pp-badge-date">' + (b.date || '') + '</div>' +
    '</div>';
  }).join('');

  var statsHtml =
    '<div class="pp-stat-cell"><div class="pp-stat-val">' + stats.total + '</div><div class="pp-stat-key">Total Trades</div></div>' +
    '<div class="pp-stat-cell"><div class="pp-stat-val" style="color:#00E87A;">' + stats.winRate + '%</div><div class="pp-stat-key">Win Rate</div></div>' +
    '<div class="pp-stat-cell"><div class="pp-stat-val" style="color:#F0B429;">' + stats.avgR + 'R</div><div class="pp-stat-key">Avg per Trade</div></div>' +
    '<div class="pp-stat-cell"><div class="pp-stat-val">' + stats.bestInst + '</div><div class="pp-stat-key">Best Instrument</div></div>' +
    '<div class="pp-stat-cell"><div class="pp-stat-val">' + stats.behScore + '</div><div class="pp-stat-key">Behaviour Score</div></div>' +
    '<div class="pp-stat-cell"><div class="pp-stat-val">' + stats.daysToComplete + '</div><div class="pp-stat-key">Days to Graduate</div></div>';

  return '<div id="trader-passport-card" class="pp-card">' +

    // Top section
    '<div class="pp-top">' +
      '<img src="img/wingman-mark.svg" alt="Wingman" class="pp-logo">' +
      '<div class="pp-wordmark">TRADER PASSPORT</div>' +
      '<div class="pp-id">' + passportId + '</div>' +
    '</div>' +

    // Divider
    '<div class="pp-divider"></div>' +

    // Middle section
    '<div class="pp-middle">' +
      '<div class="pp-name">' + (traderName || 'Wingman Graduate') + '</div>' +
      '<div class="pp-grad-date">Graduated ' + stats.gradDate + '</div>' +
      '<div class="pp-score-row">' +
        scoreDial +
        '<div class="pp-score-label">Behaviour Score<br>at Graduation</div>' +
      '</div>' +
      '<div class="pp-badges-row">' + badgesHtml + '</div>' +
    '</div>' +

    // Divider
    '<div class="pp-divider"></div>' +

    // Stats grid
    '<div class="pp-stats-grid">' + statsHtml + '</div>' +

    // Identity statement
    '<div class="pp-identity">' + (identity || '') + '</div>' +

    // Bottom strip
    '<div class="pp-bottom">' +
      '<div class="pp-bottom-divider"></div>' +
      '<div class="pp-bottom-inner">' +
        '<img src="img/wingman-mark.svg" alt="Wingman" class="pp-bottom-logo">' +
        '<span class="pp-bottom-text">Trained on Wingman</span>' +
        '<span class="pp-bottom-url">wingman.app</span>' +
      '</div>' +
    '</div>' +

  '</div>';
}

async function acadRenderPassport() {
  var pane = document.getElementById('acad-pane-debrief');
  if (!pane) return;

  var allPassed = acadGetCurrentStage() > 7;

  if (!allPassed) {
    // Blurred teaser
    var stats       = acadPassportStats();
    var passportId  = 'WM####';
    var traderName  = localStorage.getItem('wm_trader_name') || 'Your Name';
    var cardHtml    = acadPassportBuildCard(stats, 'Complete all 7 stages to unlock your Trader Passport.', passportId, traderName);
    pane.innerHTML =
      '<div class="pp-teaser-wrap">' +
        '<div class="pp-teaser-blur">' + cardHtml + '</div>' +
        '<div class="pp-teaser-overlay">Complete all 7 stages to unlock your Trader Passport</div>' +
      '</div>';
    return;
  }

  var passportId  = acadPassportGetOrCreateId();
  var traderName  = localStorage.getItem('wm_trader_name') || 'Wingman Graduate';
  var stats       = acadPassportStats();
  var identity    = localStorage.getItem('wm_passport_identity') || '';

  pane.innerHTML =
    '<div class="pp-wrap">' +
      acadPassportBuildCard(stats, identity || '<span style="color:var(--text4);">Generating your trader identity statement...</span>', passportId, traderName) +
      '<div class="pp-actions">' +
        '<input id="pp-name-input" class="pp-name-input" type="text" placeholder="Enter your name" value="' + (traderName === 'Wingman Graduate' ? '' : traderName) + '">' +
        '<button class="pp-btn-save" onclick="acadPassportSaveName()">Save name</button>' +
        '<button class="pp-btn-download" onclick="acadPassportDownload()">Download PNG</button>' +
      '</div>' +
    '</div>';

  // Fetch identity statement if not cached
  if (!identity) {
    try {
      var holdTimes = JSON.parse(localStorage.getItem('wm_trade_journal') || '[]');
      var avgHold   = 'unknown hold time';
      if (holdTimes.length >= 2) {
        avgHold = holdTimes[0].tf ? holdTimes[0].tf + ' minute timeframe' : 'short timeframe';
      }
      var idPrompt = 'Write one complete sentence of plain English with no hyphens that describes this trader\'s style and strengths based on: win rate ' + stats.winRate + ' percent, best instrument ' + stats.bestInst + ', top behaviour flag overcome ' + stats.topFlagLabel + ', and average hold time ' + avgHold + '. Start with \'A\' or \'An\'. Do not mention AI.';
      var res  = await fetch(WORKER_URL + '/behaviour', {
        method: 'POST', headers: workerHeaders(),
        body: JSON.stringify({ prompt: idPrompt, maxTokens: 60 })
      });
      var data = await res.json();
      var text = (data.content && data.content[0] && data.content[0].text) || '';
      text = text.replace(/^[\s"'`]+|[\s"'`]+$/g, '').trim();
      if (text) {
        localStorage.setItem('wm_passport_identity', text);
        var card = document.getElementById('trader-passport-card');
        if (card) {
          var idEl = card.querySelector('.pp-identity');
          if (idEl) idEl.textContent = text;
        }
      }
    } catch (_) {}
  }
}

function acadPassportSaveName() {
  var input = document.getElementById('pp-name-input');
  if (!input || !input.value.trim()) return;
  var name = input.value.trim();
  localStorage.setItem('wm_trader_name', name);
  // Re-render the name on the card without a full re-render
  var nameEl = document.querySelector('#trader-passport-card .pp-name');
  if (nameEl) nameEl.textContent = name;
  toast('Name saved.');
}

async function acadPassportDownload() {
  var card = document.getElementById('trader-passport-card');
  if (!card) { toast('Passport not available yet.'); return; }
  if (typeof html2canvas !== 'function') { toast('Download library not loaded. Please refresh.'); return; }

  var btn = document.querySelector('.pp-btn-download');
  if (btn) { btn.disabled = true; btn.textContent = 'Generating...'; }

  try {
    var canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0C0C10',
      logging: false
    });
    var link    = document.createElement('a');
    var id      = localStorage.getItem('wm_passport_id') || 'passport';
    link.download = 'wingman-passport-' + id + '.png';
    link.href   = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    toast('Download failed. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Download PNG'; }
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function initAcademy() {
  acadActiveStage = acadGetCurrentStage();
  acadRenderMap();
  acadRenderFlags();
  acadRenderHeading();
  acadSwitchTab('learn');
  acadRenderPassportTeaser();
  updateAcademyProgress();
}

