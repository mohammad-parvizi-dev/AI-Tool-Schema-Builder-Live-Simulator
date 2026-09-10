import { RootToolSchema, PresetItem } from '../types';

export const cryptoSignalBotSchema: RootToolSchema = {
  modes: [
    {
      id: 'mode_scalp_breakout',
      mode_id: 'scalp_breakout',
      title: {
        en: 'Scalp & Rapid Breakout',
        fa: 'اسکالپ و شکست سریع',
        ar: 'المضاربة السريعة والاختراق',
        zh: '高频超短线与急速突破',
        es: 'Scalping y Ruptura Rápida',
        tr: 'Scalp ve Hızlı Kırılım'
      },
      description: {
        en: 'High-frequency setup targeting immediate orderbook imbalance, volatility surges, and quick TP targets on low timeframes.',
        fa: 'تحلیل سریع با دقت بالا برای موج‌های کوتاه‌مدت، عدم تعادل دفتر سفارشات و تارگت‌های سریع در تایم‌فریم‌های پایین.',
        ar: 'تحليل عالي التردد يستهدف اختلال دفتر الأوامر والتقلبات السريعة وأهداف أرباح فورية على الفترات الزمنية القصيرة.',
        zh: '针对低周期订单簿失衡、波动率激增及快速止盈的高频交易策略。',
        es: 'Configuración de alta frecuencia dirigida al desequilibrio del libro de órdenes y objetivos rápidos.',
        tr: 'Düşük zaman dilimlerinde ani emir defteri dengesizliklerini ve hızlı kâr hedeflerini hedefleyen yüksek frekanslı analiz.'
      },
      icon: 'Zap',
      badge_color: 'amber',
      prompt_template: `Act as a senior Quantitative Crypto Scalper on Binance & Bybit.
Analyze {asset} on the {timeframe} timeframe.
Strategy Model: {strategy_style}
Risk Tolerance: {risk_level}/10
Include Order Book Imbalance & Liquidity: {include_liquidity}
Execution Language: {language}
Additional Notes: {custom_notes}

Deliver a structured signal breakdown:
1. Direction (LONG / SHORT / WAIT)
2. Precise Entry Zone & Optimal Trigger
3. TP1, TP2, TP3 with exact profit percentages
4. Invalidation / Hard Stop-Loss level & R:R ratio
5. Volume Profile & Order Flow rationale`,
      display_template: 'Scalp: {asset} • {timeframe} • Risk: {risk_level}/10',
      fields: [
        {
          id: 'f_asset_1',
          key: 'asset',
          label: 'Crypto Asset / Pair',
          description: 'Select the primary cryptocurrency pair to analyze',
          type: 'search_select',
          required: true,
          default_value: 'BTC/USDT',
          options: [
            { id: 'opt_btc', value: 'BTC/USDT', label: 'Bitcoin (BTC)', symbol: 'BTC', badge: 'King' },
            { id: 'opt_eth', value: 'ETH/USDT', label: 'Ethereum (ETH)', symbol: 'ETH', badge: 'L1' },
            { id: 'opt_sol', value: 'SOL/USDT', label: 'Solana (SOL)', symbol: 'SOL', badge: 'High Vol' },
            { id: 'opt_bnb', value: 'BNB/USDT', label: 'BNB (Binance Coin)', symbol: 'BNB', badge: 'Exchange' },
            { id: 'opt_xrp', value: 'XRP/USDT', label: 'Ripple (XRP)', symbol: 'XRP', badge: 'Payments' },
            { id: 'opt_sui', value: 'SUI/USDT', label: 'Sui Network (SUI)', symbol: 'SUI', badge: 'Trending' },
            { id: 'opt_doge', value: 'DOGE/USDT', label: 'Dogecoin (DOGE)', symbol: 'DOGE', badge: 'Meme' },
            { id: 'opt_ton', value: 'TON/USDT', label: 'Toncoin (TON)', symbol: 'TON', badge: 'Ecosystem' },
            { id: 'opt_near', value: 'NEAR/USDT', label: 'NEAR Protocol (NEAR)', symbol: 'NEAR', badge: 'AI/L1' }
          ]
        },
        {
          id: 'f_tf_1',
          key: 'timeframe',
          label: 'Scalp Timeframe',
          type: 'pills',
          required: true,
          default_value: '5m',
          options: [
            { id: 'tf_1m', value: '1m', label: '1m' },
            { id: 'tf_3m', value: '3m', label: '3m' },
            { id: 'tf_5m', value: '5m', label: '5m' },
            { id: 'tf_15m', value: '15m', label: '15m' },
            { id: 'tf_30m', value: '30m', label: '30m' }
          ]
        },
        {
          id: 'f_strat_1',
          key: 'strategy_style',
          label: 'Scalp Strategy Model',
          type: 'select',
          required: true,
          default_value: 'volume_vwap_breakout',
          options: [
            { id: 'strat_vwap', value: 'volume_vwap_breakout', label: 'Volume Profile + VWAP Deviation Bands' },
            { id: 'strat_smc_choc', value: 'smc_liquidity_sweep_choch', label: 'SMC Liquidity Sweep & CHoCH Reversal' },
            { id: 'strat_ema_ribbon', value: 'ema_ribbon_momentum', label: 'Dynamic EMA Ribbon Trend Surge' },
            { id: 'strat_orderbook_delta', value: 'orderbook_delta_imbalance', label: 'Cumulative Volume Delta (CVD) Absorption' }
          ]
        },
        {
          id: 'f_risk_1',
          key: 'risk_level',
          label: 'Risk & Leverage Index',
          type: 'range_slider',
          required: true,
          default_value: 6,
          slider_config: {
            min: 1,
            max: 10,
            step: 1,
            unit: '/10',
            min_label: 'Safe (Low Lev)',
            max_label: 'Degen (High Lev)'
          }
        },
        {
          id: 'f_liq_1',
          key: 'include_liquidity',
          label: 'Include Heatmap Liquidity & Funding Rates',
          type: 'switch',
          required: false,
          default_value: true
        },
        {
          id: 'f_notes_1',
          key: 'custom_notes',
          label: 'Optional Strategy Filter / Context',
          type: 'text',
          required: false,
          default_value: 'Target immediate 1:2.5 RR ratio before London session close.',
          placeholder: 'e.g., Wait for retest of previous 15m candle high'
        }
      ]
    },
    {
      id: 'mode_swing_trend',
      mode_id: 'swing_trend',
      title: {
        en: 'Swing & Trend Structure',
        fa: 'سوئینگ و ساختار روند',
        ar: 'صفقات السوينغ وتتبع الاتجاه',
        zh: '波段趋势与市场结构',
        es: 'Swing y Estructura de Tendencia',
        tr: 'Swing ve Trend Yapısı'
      },
      description: {
        en: 'Multi-day position modeling based on market structure shifts, institutional order blocks, and key Fibonacci retracements.',
        fa: 'طراحی معاملات چندروزه بر اساس سطوح ساختاری هفتگی و روزانه، اوردربلاک‌های نهادی و حمایت/مقاومت‌های کلان.',
        ar: 'نمذجة صفقات متعددة الأيام مبنية على تغيرات هيكل السوق والمستويات المؤسسية الكبرى.',
        zh: '基于市场结构转变、机构订单块和关键斐波那契回撤的多日持仓模型。',
        es: 'Modelado de posiciones de varios días basado en cambios de estructura de mercado y bloques de órdenes.',
        tr: 'Piyasa yapısı değişimleri, kurumsal emir blokları ve Fibonacci seviyelerine dayalı çok günlük pozisyon modellemesi.'
      },
      icon: 'BarChart2',
      badge_color: 'blue',
      prompt_template: `Act as a senior Macro Crypto Portfolio Manager.
Analyze {asset} on higher timeframes ({timeframe}).
Structure Bias: {trend_direction}
Maximum Stop-Loss Allowed: {max_sl_percent}%
Enable Trailing Stop Logic: {use_trailing}
Macro & Catalyst Context: {macro_context}
Language: {language}

Produce a detailed Swing Strategy Plan:
- HTF Bias (Daily / 4H confirmation)
- Confluence Checklist (Order Blocks, Fair Value Gaps, Liquidity Pools)
- Staggered Entry Levels (DCA Zone)
- Macro Take-Profit Targets with Trailing Stop parameters
- Invalidation Scenario and Capital Allocation percentage`,
      display_template: 'Swing: {asset} • {timeframe} • {trend_direction} • Max SL: {max_sl_percent}%',
      fields: [
        {
          id: 'f_asset_2',
          key: 'asset',
          label: 'Asset Pair',
          type: 'search_select',
          required: true,
          default_value: 'ETH/USDT',
          options: [
            { id: 'opt2_btc', value: 'BTC/USDT', label: 'Bitcoin (BTC)', symbol: 'BTC' },
            { id: 'opt2_eth', value: 'ETH/USDT', label: 'Ethereum (ETH)', symbol: 'ETH' },
            { id: 'opt2_sol', value: 'SOL/USDT', label: 'Solana (SOL)', symbol: 'SOL' },
            { id: 'opt2_avax', value: 'AVAX/USDT', label: 'Avalanche (AVAX)', symbol: 'AVAX' },
            { id: 'opt2_link', value: 'LINK/USDT', label: 'Chainlink (LINK)', symbol: 'LINK' }
          ]
        },
        {
          id: 'f_tf_2',
          key: 'timeframe',
          label: 'Primary Trend Timeframe',
          type: 'pills',
          required: true,
          default_value: '4h',
          options: [
            { id: 'tf2_1h', value: '1h', label: '1 Hour' },
            { id: 'tf2_4h', value: '4h', label: '4 Hours' },
            { id: 'tf2_1d', value: '1D', label: 'Daily (1D)' },
            { id: 'tf2_1w', value: '1W', label: 'Weekly (1W)' }
          ]
        },
        {
          id: 'f_bias_2',
          key: 'trend_direction',
          label: 'Market Structure Bias',
          type: 'select',
          required: true,
          default_value: 'bullish_pullback',
          options: [
            { id: 'bias_bull', value: 'bullish_pullback', label: 'Bullish Continuation after FVG Retest' },
            { id: 'bias_breakout', value: 'range_breakout', label: 'Weekly Range Consolidation Breakout' },
            { id: 'bias_bear', value: 'bearish_rejection', label: 'Bearish Rejection at HTF Supply Block' }
          ]
        },
        {
          id: 'f_sl_2',
          key: 'max_sl_percent',
          label: 'Max Allowed Stop-Loss Distance',
          type: 'range_slider',
          required: true,
          default_value: 4.5,
          slider_config: {
            min: 1,
            max: 15,
            step: 0.5,
            unit: '%',
            min_label: 'Tight (1%)',
            max_label: 'Wide (15%)'
          }
        },
        {
          id: 'f_trail_2',
          key: 'use_trailing',
          label: 'Apply Trailing Stop at TP1',
          type: 'switch',
          required: false,
          default_value: true
        },
        {
          id: 'f_macro_2',
          key: 'macro_context',
          label: 'Macro Catalysts & Upcoming Events',
          type: 'textarea',
          required: false,
          default_value: 'US CPI data releasing this Thursday. Watch for pre-FOMC volatility spike.',
          placeholder: 'Add any specific token unlocks, ETF flows, or Fed statements...'
        }
      ]
    },
    {
      id: 'mode_liquidity_hunt',
      mode_id: 'liquidity_hunt',
      title: {
        en: 'Liquidity Map & Trap Detector',
        fa: 'نقشه نقدینگی و شکار استاپ',
        ar: 'خريطة السيولة ومصائد السوق',
        zh: '流动性热力图与陷阱捕获',
        es: 'Mapa de Liquidez y Trampas',
        tr: 'Likidite Haritası ve Avı'
      },
      description: {
        en: 'Identify liquidation clusters, fake breakout traps (Turtle Soup), and institutional stop runs.',
        fa: 'شناسایی استخرهای تجمیع استاپ‌لاس، شکست‌های فیک نهادی و تله‌های مارکت‌میکر برای ورود در نقاط چرخش.',
        ar: 'تحديد كتل التصفية ومصائد الاختراق الوهمية ونقاط سحب السيولة المؤسسية.',
        zh: '识别强平清算聚集区、假突破陷阱及机构猎杀止损点。',
        es: 'Identifica clústeres de liquidación, trampas de ruptura falsa y barridos de stop-loss.',
        tr: 'Likidasyon havuzlarını, sahte kırılım tuzaklarını ve kurumsal stop avlarını tespit edin.'
      },
      icon: 'Layers',
      badge_color: 'cyan',
      prompt_template: `You are an expert Institutional Smart Money (SMC/ICT) liquidity engineer.
Audit {asset} on {timeframe}.
Focus Trap Pattern: {liquidity_target}
Liquidation Pool Size: {depth_tier}
Language: {language}

Provide:
1. Exact price coordinates where liquidity is trapped
2. Expected Fakeout vs Genuine Breakout validation rule
3. Counter-trend sweep entry model
4. Immediate target to the opposing liquidity pool`,
      display_template: 'Liquidity: {asset} • {timeframe} • {liquidity_target} • Pool: {depth_tier}',
      fields: [
        {
          id: 'f_asset_3',
          key: 'asset',
          label: 'Target Asset',
          type: 'search_select',
          required: true,
          default_value: 'SOL/USDT',
          options: [
            { id: 'opt3_btc', value: 'BTC/USDT', label: 'BTC/USDT', symbol: 'BTC' },
            { id: 'opt3_eth', value: 'ETH/USDT', label: 'ETH/USDT', symbol: 'ETH' },
            { id: 'opt3_sol', value: 'SOL/USDT', label: 'SOL/USDT', symbol: 'SOL' }
          ]
        },
        {
          id: 'f_tf_3',
          key: 'timeframe',
          label: 'Analysis Timeframe',
          type: 'pills',
          required: true,
          default_value: '15m',
          options: [
            { id: 'tf3_15m', value: '15m', label: '15m' },
            { id: 'tf3_1h', value: '1h', label: '1h' },
            { id: 'tf3_4h', value: '4h', label: '4h' }
          ]
        },
        {
          id: 'f_target_3',
          key: 'liquidity_target',
          label: 'Liquidity Trap Architecture',
          type: 'select',
          required: true,
          default_value: 'equal_highs_sweep',
          options: [
            { id: 'lt_eqh', value: 'equal_highs_sweep', label: 'Equal Highs (EQH) Buy-Side Liquidity Sweep' },
            { id: 'lt_eql', value: 'equal_lows_hunt', label: 'Equal Lows (EQL) Sell-Side Liquidity Purge' },
            { id: 'lt_cme', value: 'cme_gap_rebalance', label: 'CME Weekend Gap Rebalance Spike' }
          ]
        },
        {
          id: 'f_depth_3',
          key: 'depth_tier',
          label: 'Estimated Liquidation Pool Depth',
          type: 'pills',
          required: true,
          default_value: '$10M - $50M',
          options: [
            { id: 'dp_1', value: '< $5M', label: '< $5M (Micro)' },
            { id: 'dp_2', value: '$10M - $50M', label: '$10M - $50M (Medium)' },
            { id: 'dp_3', value: '$50M+', label: '$50M+ (Whale Cluster)' }
          ]
        }
      ]
    }
  ]
};

export const forexGoldSchema: RootToolSchema = {
  modes: [
    {
      id: 'mode_fx_session',
      mode_id: 'session_breakout',
      title: {
        en: 'Session Open Sweep & Judas Swing',
        fa: 'شکار سشن و جوداس سوئینگ',
        ar: 'افتتاح الجلسة وحركة جوداس'
      },
      description: {
        en: 'Exploits the classic 08:00 GMT London open fakeout and 13:30 NY open liquidity sweeps.',
        fa: 'بهره‌برداری از شکست‌های فیک بازگشایی سشن لندن و نیویورک بر اساس الگوهای ICT.',
        ar: 'استغلال الاختراق الوهمي في افتتاح لندن وجلسة نيويورك.'
      },
      icon: 'Clock',
      badge_color: 'amber',
      prompt_template: `Act as a senior Institutional FX trader.
Analyze {pair} during the {session} session on {timeframe}.
Session Bias: {bias}
Include DXY Dollar Index correlation: {include_dxy}
Language: {language}

Provide:
- Asia Session High/Low levels
- Expected Judas swing fakeout direction
- London/NY Continuation entry zone
- Risk to Reward parameters with pip-precise Stop Loss`,
      display_template: 'FX: {pair} • {session} • {timeframe} • {bias}',
      fields: [
        {
          id: 'fx_f_1',
          key: 'pair',
          label: 'Forex / Metal Pair',
          type: 'search_select',
          required: true,
          default_value: 'XAU/USD (Gold)',
          options: [
            { id: 'fx_gold', value: 'XAU/USD (Gold)', label: 'Gold (XAU/USD)', symbol: 'GOLD' },
            { id: 'fx_eur', value: 'EUR/USD', label: 'Euro / US Dollar', symbol: 'EUR' },
            { id: 'fx_gbp', value: 'GBP/USD', label: 'British Pound / USD', symbol: 'GBP' },
            { id: 'fx_jpy', value: 'USD/JPY', label: 'US Dollar / Yen', symbol: 'JPY' }
          ]
        },
        {
          id: 'fx_f_2',
          key: 'session',
          label: 'Trading Session',
          type: 'pills',
          required: true,
          default_value: 'London Open (07:00-11:00 UTC)',
          options: [
            { id: 's_lon', value: 'London Open (07:00-11:00 UTC)', label: 'London Open' },
            { id: 's_ny', value: 'NY Open (13:00-17:00 UTC)', label: 'New York Open' },
            { id: 's_asia', value: 'Asian Range (00:00-06:00 UTC)', label: 'Asian Range' }
          ]
        },
        {
          id: 'fx_f_3',
          key: 'timeframe',
          label: 'Execution Timeframe',
          type: 'pills',
          required: true,
          default_value: '15m',
          options: [
            { id: 'fxt_5m', value: '5m', label: '5m' },
            { id: 'fxt_15m', value: '15m', label: '15m' },
            { id: 'fxt_1h', value: '1h', label: '1h' }
          ]
        },
        {
          id: 'fx_f_4',
          key: 'bias',
          label: 'Directional Bias',
          type: 'select',
          required: true,
          default_value: 'bullish_expansion',
          options: [
            { id: 'b_long', value: 'bullish_expansion', label: 'Bullish Expansion (Long after sweep)' },
            { id: 'b_short', value: 'bearish_expansion', label: 'Bearish Expansion (Short after peak)' }
          ]
        },
        {
          id: 'fx_f_5',
          key: 'include_dxy',
          label: 'Check DXY (Dollar Index) Divergence',
          type: 'switch',
          required: false,
          default_value: true
        }
      ]
    }
  ]
};

export const warrenBuffettStockSchema: RootToolSchema = {
  modes: [
    {
      id: 'mode_moat_auditor',
      mode_id: 'economic_moat_auditor',
      title: {
        en: 'Economic Moat & Competitive Advantage',
        fa: 'ارزیابی خندق اقتصادی و مزیت رقابتی',
        ar: 'تدقيق الخندق الاقتصادي والميزة التنافسية'
      },
      description: {
        en: 'Evaluates pricing power, network effects, brand equity, and barrier to entry like Berkshire Hathaway.',
        fa: 'ارزیابی قدرت قیمت‌گذاری، اثر شبکه‌ای، اعتبار برند و موانع ورود به سبک وارن بافت.',
        ar: 'تقييم قوة التسعير وتأثير الشبكة وقيمة العلامة التجارية على طريقة وارن بافيت.'
      },
      icon: 'Shield',
      badge_color: 'emerald',
      prompt_template: `Act as Warren Buffett and Charlie Munger conducting a fundamental audit.
Analyze stock ticker: {ticker}.
Sector / Industry: {sector}
Required Return on Invested Capital (ROIC) threshold: {min_roic}%
Lookback Period: {lookback_years} years
Debt to Equity Tolerance: {debt_tolerance}
Language: {language}

Provide a deep Value Investing analysis:
1. Economic Moat Rating (Wide / Narrow / None) with 3 key pillars
2. ROIC & Free Cash Flow durability assessment
3. Management Capital Allocation track record
4. Circle of Competence summary and risks`,
      display_template: 'Buffett Audit: {ticker} • {sector} • ROIC > {min_roic}%',
      fields: [
        {
          id: 'wb_f_1',
          key: 'ticker',
          label: 'Stock Ticker / Company',
          type: 'search_select',
          required: true,
          default_value: 'AAPL',
          options: [
            { id: 'stk_aapl', value: 'AAPL', label: 'Apple Inc. (AAPL)', symbol: 'AAPL' },
            { id: 'stk_msft', value: 'MSFT', label: 'Microsoft Corp. (MSFT)', symbol: 'MSFT' },
            { id: 'stk_ko', value: 'KO', label: 'Coca-Cola Company (KO)', symbol: 'KO' },
            { id: 'stk_axp', value: 'AXP', label: 'American Express (AXP)', symbol: 'AXP' },
            { id: 'stk_oxy', value: 'OXY', label: 'Occidental Petroleum (OXY)', symbol: 'OXY' }
          ]
        },
        {
          id: 'wb_f_2',
          key: 'sector',
          label: 'Business Sector',
          type: 'select',
          required: true,
          default_value: 'Consumer & Tech Ecosystem',
          options: [
            { id: 'sec_tech', value: 'Consumer & Tech Ecosystem', label: 'Consumer Tech & Platform Ecosystems' },
            { id: 'sec_fin', value: 'Financial Services & Insurance', label: 'Financial Services & Insurance' },
            { id: 'sec_staple', value: 'Consumer Staples', label: 'Consumer Staples & Fast Moving Goods' },
            { id: 'sec_energy', value: 'Energy & Infrastructure', label: 'Energy, Rails & Capital Assets' }
          ]
        },
        {
          id: 'wb_f_3',
          key: 'min_roic',
          label: 'Minimum 5-Yr Avg ROIC Target',
          type: 'range_slider',
          required: true,
          default_value: 15,
          slider_config: {
            min: 5,
            max: 30,
            step: 1,
            unit: '%',
            min_label: '5% (Moderate)',
            max_label: '30% (Elite Compounder)'
          }
        },
        {
          id: 'wb_f_4',
          key: 'lookback_years',
          label: 'Historical Financials Lookback',
          type: 'pills',
          required: true,
          default_value: '10y',
          options: [
            { id: 'lb_5', value: '5y', label: '5 Years' },
            { id: 'lb_10', value: '10y', label: '10 Years' },
            { id: 'lb_20', value: '20y', label: '20 Years (Full Cycle)' }
          ]
        },
        {
          id: 'wb_f_5',
          key: 'debt_tolerance',
          label: 'Conservative Debt Constraint',
          type: 'switch',
          required: false,
          default_value: true
        }
      ]
    },
    {
      id: 'mode_dcf_margin',
      mode_id: 'dcf_margin_of_safety',
      title: {
        en: 'DCF Intrinsic Value & Margin of Safety',
        fa: 'ارزش ذاتی تنزیل جریان نقدی و حاشیه امنیت',
        ar: 'القيمة العادلة وهوامش الأمان'
      },
      description: {
        en: 'Calculates discounted cash flow intrinsic fair value with strict margin of safety discounts.',
        fa: 'محاسبه ارزش ذاتی بر اساس تنزیل جریان وجوه نقد آزاد و تعیین قیمت خرید با حاشیه امنیت.',
        ar: 'حساب القيمة العادلة ومعدل الخصم وهامش الأمان للمستثمر.'
      },
      icon: 'BarChart2',
      badge_color: 'blue',
      prompt_template: `Calculate intrinsic fair value for {ticker} using Discounted Free Cash Flow (DCF).
Conservative Terminal Growth Rate: {terminal_growth}%
Discount Rate (WACC / Hurdle): {discount_rate}%
Target Margin of Safety Discount: {margin_of_safety}%
Language: {language}

Provide:
1. Normalized Free Cash Flow estimate
2. Fair Value per share computation
3. Buy-Below Price (incorporating {margin_of_safety}% Margin of Safety)
4. Valuation summary table`,
      display_template: 'DCF: {ticker} • Discount: {discount_rate}% • Margin: {margin_of_safety}%',
      fields: [
        {
          id: 'dcf_f_1',
          key: 'ticker',
          label: 'Target Stock Ticker',
          type: 'search_select',
          required: true,
          default_value: 'AAPL',
          options: [
            { id: 'dcf_aapl', value: 'AAPL', label: 'Apple Inc. (AAPL)', symbol: 'AAPL' },
            { id: 'dcf_ko', value: 'KO', label: 'Coca-Cola (KO)', symbol: 'KO' }
          ]
        },
        {
          id: 'dcf_f_2',
          key: 'discount_rate',
          label: 'Discount Rate (Hurdle Rate)',
          type: 'range_slider',
          required: true,
          default_value: 9.5,
          slider_config: {
            min: 6,
            max: 15,
            step: 0.5,
            unit: '%',
            min_label: '6%',
            max_label: '15%'
          }
        },
        {
          id: 'dcf_f_3',
          key: 'terminal_growth',
          label: 'Terminal Perpetual Growth Rate',
          type: 'pills',
          required: true,
          default_value: '2.5%',
          options: [
            { id: 'tg_2', value: '2.0%', label: '2.0% (GDP Baseline)' },
            { id: 'tg_25', value: '2.5%', label: '2.5% (Conservative)' },
            { id: 'tg_3', value: '3.0%', label: '3.0% (GDP High)' }
          ]
        },
        {
          id: 'dcf_f_4',
          key: 'margin_of_safety',
          label: 'Margin of Safety Discount',
          type: 'range_slider',
          required: true,
          default_value: 25,
          slider_config: {
            min: 10,
            max: 40,
            step: 5,
            unit: '%',
            min_label: '10% (Tight)',
            max_label: '40% (Deep Value)'
          }
        }
      ]
    }
  ]
};

export const defaultPresets: PresetItem[] = [
  {
    id: 'crypto_signal_bot',
    name: 'Crypto Signal & Scalp Bot',
    description: '3 Modes: Scalp & Breakout, Swing & Trend, Liquidity Map',
    icon: '🚀',
    updated_at: new Date().toISOString(),
    schema: cryptoSignalBotSchema
  },
  {
    id: 'forex_gold_model',
    name: 'Forex & Gold Institutional Model',
    description: 'London & NY Session Breakout, XAU/USD, SMC liquidity model',
    icon: '📈',
    updated_at: new Date().toISOString(),
    schema: forexGoldSchema
  },
  {
    id: 'warren_buffett_stock_auditor',
    name: 'Warren Buffett Stock Auditor',
    description: 'Economic Moat Rating & DCF Margin of Safety valuation',
    icon: '💼',
    updated_at: new Date().toISOString(),
    schema: warrenBuffettStockSchema
  }
];

export const defaultBuiltinPresets = defaultPresets;

export const blankSchemaPreset: RootToolSchema = {
  modes: [
    {
      id: `mode_${Date.now()}`,
      mode_id: 'primary_mode',
      title: {
        en: 'Primary Strategy Mode',
        fa: 'حالت استراتژی اصلی',
        ar: 'وضع الاستراتيجية الرئيسي'
      },
      description: {
        en: 'Configure your primary analysis mode parameters.',
        fa: 'تنظیم پارامترهای تحلیل حالت اصلی.',
        ar: 'تكوين معلمات وضع التحليل الرئيسي.'
      },
      prompt_template: 'Act as an expert analyst. Analyze {asset} on {timeframe}. Language: {language}.',
      display_template: 'Analysis: {asset} • {timeframe}',
      fields: [
        {
          id: `f_${Date.now()}_1`,
          key: 'asset',
          label: 'Trading Asset',
          type: 'search_select',
          required: true,
          default_value: 'BTC/USDT',
          options: [
            { id: 'opt_1', value: 'BTC/USDT', label: 'Bitcoin (BTC)', symbol: 'BTC' },
            { id: 'opt_2', value: 'ETH/USDT', label: 'Ethereum (ETH)', symbol: 'ETH' }
          ]
        },
        {
          id: `f_${Date.now()}_2`,
          key: 'timeframe',
          label: 'Timeframe',
          type: 'pills',
          required: true,
          default_value: '15m',
          options: [
            { id: 'tf_1', value: '5m', label: '5m' },
            { id: 'tf_2', value: '15m', label: '15m' },
            { id: 'tf_3', value: '1h', label: '1h' }
          ]
        }
      ]
    }
  ]
};

