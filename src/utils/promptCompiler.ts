import { SupportedLanguage, SimulationResult } from '../types';

/**
 * Extracts all variable keys inside {var_name} from a string
 */
export function extractPlaceholders(template: string): string[] {
  if (!template) return [];
  const matches = template.match(/\{([a-zA-Z0-9_-]+)\}/g);
  if (!matches) return [];
  const keys = matches.map(m => m.replace(/\{|\}/g, '').trim());
  return Array.from(new Set(keys));
}

/**
 * Compiles a template by substituting {key} with provided values
 */
export function compileTemplate(
  template: string,
  values: Record<string, any>,
  language: SupportedLanguage = 'en'
): string {
  if (!template) return '';
  
  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, key) => {
    if (key === 'language') {
      return language === 'fa' ? 'فارسی (Persian)' : language === 'ar' ? 'العربية (Arabic)' : 'English';
    }
    const val = values[key];
    if (val === undefined || val === null || val === '') {
      return `[${key}]`;
    }
    if (typeof val === 'boolean') {
      return val ? 'Yes / True' : 'No / False';
    }
    return String(val);
  });
}

/**
 * Generates an intelligent, context-aware simulated AI response for the Trade Zone live preview
 */
export function generateMockAiResponse(
  modeTitle: string,
  values: Record<string, any>,
  lang: SupportedLanguage
): SimulationResult['ai_mock_response'] {
  const asset = values.asset || values.pair || 'BTC/USDT';
  const tf = values.timeframe || '15m';
  const risk = Number(values.risk_level || 5);
  
  const isBullish = risk > 4 || !String(values.trend_direction || '').includes('bear');
  const signal_type = isBullish ? 'BUY' : 'SELL';
  const confidence = 84 + Math.floor(Math.random() * 12);
  
  if (lang === 'fa') {
    return {
      signal_type,
      confidence,
      summary: `تحلیل الگوریتمی ${asset} بر اساس مدل ${modeTitle} و تایم‌فریم ${tf} تکمیل شد. فشار خرید در محدوده تقاضا با انباشت سفارشات نهادی تایید شده است.`,
      entry_zone: isBullish ? `$87,420 - $87,950 (پولبک به محدوده FVG)` : `$89,800 - $90,200 (ریجکت از عرضه)`,
      targets: [
        `تارگت ۱: $88,600 (+1.2% سود)`,
        `تارگت ۲: $89,450 (+2.4% سود)`,
        `تارگت ۳: $90,900 (+4.1% خروج نهایی)`
      ],
      stop_loss: isBullish ? `$86,850 (ابطال ساختار در زیر کف سوئینگ)` : `$90,800 (ابطال در بالای مقاومت)`,
      risk_reward: `1 : 2.85`,
      indicators_breakdown: [
        { name: 'CVD Volume Delta', status: 'جذب سفارشات خرید قوی (Absorption)', sentiment: 'bullish' },
        { name: 'RSI Momentum (14)', status: 'خروج از اشباع فروش (58.4)', sentiment: 'bullish' },
        { name: 'Liquidity Pool', status: 'پاکسازی استاپ‌های بالای $89,200', sentiment: 'neutral' }
      ],
      detailed_notes: `📌 راهبرد مدیریت سرمایه: حداکثر ۲٪ از کل مارجین به این معامله اختصاص یابد. پس از رسیدن به تارگت اول، حد ضرر را به نقطه ورود (Risk-Free) انتقال دهید.`
    };
  } else if (lang === 'ar') {
    return {
      signal_type,
      confidence,
      summary: `تم إكمال التحليل الخوارزمي لزوج ${asset} وفق نموذج ${modeTitle} على الإطار الزمني ${tf}. تم رصد سيولة شرائية وتجميع مؤسسي واضح.`,
      entry_zone: isBullish ? `$87,420 - $87,950 (إعادة اختبار الفجوة السعرية)` : `$89,800 - $90,200 (مقاومة العرض)`,
      targets: [
        `الهدف الأول: $88,600 (+1.2%)`,
        `الهدف الثاني: $89,450 (+2.4%)`,
        `الهدف الثالث: $90,900 (+4.1%)`
      ],
      stop_loss: isBullish ? `$86,850 (كسر أدنى قاع)` : `$90,800 (فوق القمة)`,
      risk_reward: `1 : 2.85`,
      indicators_breakdown: [
        { name: 'دلتا الحجم التراكمي', status: 'امتصاص شرائي إيجابي', sentiment: 'bullish' },
        { name: 'مؤشر القوة النسبية RSI', status: 'توسع الزخم الصاعد (58.4)', sentiment: 'bullish' },
        { name: 'خريطة السيولة', status: 'سحب كتل السيولة المستهدفة', sentiment: 'neutral' }
      ],
      detailed_notes: `📌 التوصية: قم بتأمين الصفقة (نقل الوقف لنقطة الدخول) فور تحقيق الهدف الأول.`
    };
  }

  return {
    signal_type,
    confidence,
    summary: `Algorithmic analysis executed for ${asset} based on ${modeTitle} across ${tf}. High confluence detected between Volume Profile and orderbook liquidity sweep.`,
    entry_zone: isBullish ? `$87,420 - $87,950 (FVG & Order Block Retest)` : `$89,800 - $90,200 (Major Supply Block Rejection)`,
    targets: [
      `TP1: $88,600 (+1.2% Scalp Target)`,
      `TP2: $89,450 (+2.4% Mid Liquidity Run)`,
      `TP3: $90,900 (+4.1% Extended Runner)`
    ],
    stop_loss: isBullish ? `$86,850 (Structure Invalidation below Swing Low)` : `$90,800 (Breach above Supply)`,
    risk_reward: `1 : 2.85`,
    indicators_breakdown: [
      { name: 'CVD Volume Delta', status: 'Positive institutional buy absorption', sentiment: 'bullish' },
      { name: 'RSI Momentum (14)', status: 'Bullish divergence reset at 58.4', sentiment: 'bullish' },
      { name: 'Liquidity Heatmap', status: 'Unmitigated Buy-side Liquidity pool at $89.5k', sentiment: 'neutral' }
    ],
    detailed_notes: `📌 Execution Protocol: Allocate max 1.5% portfolio risk. Move Stop-Loss to Breakeven immediately after TP1 trigger.`
  };
}
