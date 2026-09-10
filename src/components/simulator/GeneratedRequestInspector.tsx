import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  Activity, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Sparkles, 
  Layers, 
  Globe2, 
  CheckCircle2, 
  ArrowRight,
  Sliders,
  Cpu
} from 'lucide-react';
import { SimulationResult, SupportedLanguage, ToolMode } from '../../types';

interface GeneratedRequestInspectorProps {
  result: SimulationResult;
  simLanguage: SupportedLanguage;
  activeMode: ToolMode;
}

const inspectorTexts: Record<string, Record<SupportedLanguage, string>> = {
  header: {
    en: 'Generated Request Inspector',
    fa: 'بازرسی درخواست هوش مصنوعی',
    ar: 'فاحص طلب الذكاء الاصطناعي',
    zh: 'AI 智能请求检查器',
    es: 'Inspector de Solicitud de IA',
    tr: 'Yapay Zeka İstek Denetleyicisi',
  },
  banner: {
    en: 'Trade Zone Chat Interface Preview — Clean user-facing prompt bubble (raw prompt is never shown to the user).',
    fa: 'نمای شبیه‌سازی‌شده دقیق پیام کاربر در تاریخچه چت تریدزون (بدون نمایش پرامپت خام به کاربر)',
    ar: 'المعاينة الدقيقة لرسالة المستخدم في واجهة الدردشة (دون إظهار الأوامر الخام)',
    zh: 'Trade Zone 聊天界面预览 — 干净的用户前端气泡提示（用户端绝不暴露原始提示词）。',
    es: 'Vista previa del chat de Trade Zone — Burbuja limpia para el usuario (el prompt crudo nunca se muestra al usuario).',
    tr: 'Trade Zone Sohbet Önizlemesi — Temiz kullanıcı sohbet balonu (ham prompt son kullanıcıya asla gösterilmez).',
  },
  analysisRequest: {
    en: 'Analysis Request',
    fa: 'درخواست تحلیل هوشمند',
    ar: 'طلب التحليل الذكي',
    zh: '智能分析请求',
    es: 'Solicitud de Análisis',
    tr: 'Akıllı Analiz Talebi',
  },
  signalConfluence: {
    en: 'Algorithmic Signal Confluence',
    fa: 'سیگنال تایید شده الگوریتمی',
    ar: 'إشارة مؤكدة خوارزمياً',
    zh: '算法验证交易共振',
    es: 'Confluencia de Señal Algorítmica',
    tr: 'Algoritmik Sinyal Onayı',
  },
  entryZone: {
    en: 'Entry Zone',
    fa: 'نقطه ورود (Entry Zone)',
    ar: 'نقطة الدخول',
    zh: '入场区间 (Entry Zone)',
    es: 'Zona de Entrada',
    tr: 'Giriş Bölgesi (Entry Zone)',
  },
  targets: {
    en: 'Take Profit Targets',
    fa: 'تارگت‌ها (Take Profits)',
    ar: 'الأهداف الربحية',
    zh: '止盈目标 (Take Profits)',
    es: 'Objetivos de Ganancia',
    tr: 'Kâr Alma Hedefleri (TP)',
  },
  stopLoss: {
    en: 'Stop-Loss',
    fa: 'حد ضرر (Stop Loss)',
    ar: 'وقف الخسارة',
    zh: '止损位 (Stop Loss)',
    es: 'Stop-Loss',
    tr: 'Zarar Kes (Stop-Loss)',
  },
  confluences: {
    en: 'Confluence Breakdown',
    fa: 'واگرایی‌ها و تایید اندیکاتورها',
    ar: 'تأكيدات المؤشرات الفنية',
    zh: '技术指标共振细分',
    es: 'Desglose de Confluencias',
    tr: 'Teknik Gösterge Kırılımı',
  },
};

export const GeneratedRequestInspector: React.FC<GeneratedRequestInspectorProps> = ({
  result,
  simLanguage,
  activeMode
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'n8n'>('chat');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const isRtl = simLanguage === 'fa' || simLanguage === 'ar';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(result.compiled_prompt || '');
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(result.n8n_payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Helper to get human-readable labels for selected input chips in Chat view
  const getInputChips = () => {
    const chips: Array<{ key: string; label: string; value: string }> = [];
    const fields = activeMode.fields || [];

    Object.entries(result.form_values).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') return;
      
      const fieldDef = fields.find(f => f.key === key);
      let label = key;
      if (fieldDef) {
        if (typeof fieldDef.label === 'string') {
          label = fieldDef.label;
        } else if (fieldDef.label && typeof fieldDef.label === 'object') {
          label = fieldDef.label[simLanguage] || fieldDef.label.en || key;
        }
      }

      let displayVal = String(val);
      if (fieldDef && fieldDef.options) {
        const matchedOpt = fieldDef.options.find(o => o.value === val);
        if (matchedOpt) {
          if (typeof matchedOpt.label === 'string') {
            displayVal = matchedOpt.label;
          } else if (matchedOpt.label && typeof matchedOpt.label === 'object') {
            displayVal = (matchedOpt.label as any)[simLanguage] || (matchedOpt.label as any).en || val;
          }
        }
      }

      chips.push({ key, label, value: displayVal });
    });

    return chips;
  };

  const inputChips = getInputChips();

  return (
    <div 
      id="generated-request-inspector"
      className="mt-4 rounded-xl border border-[#1e293b] bg-[#0d1117] shadow-2xl overflow-hidden transition-all duration-200"
    >
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] bg-[#161b22] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
              <span>{inspectorTexts.header[simLanguage] || 'Generated Request Inspector'}</span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                LIVE DUAL-OUTPUT
              </span>
            </h3>
          </div>
        </div>

        {/* 2 Clear Tabs: Chat Bubble Preview vs. Compiled n8n Payload */}
        <div className="flex items-center rounded-lg bg-[#0d1117] p-1 border border-[#1e293b]" dir="ltr">
          <button
            type="button"
            id="tab-chat-preview"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Bubble Preview</span>
          </button>

          <button
            type="button"
            id="tab-n8n-preview"
            onClick={() => setActiveTab('n8n')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'n8n'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Compiled n8n Payload</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Chat Bubble Preview */}
      {activeTab === 'chat' && (
        <div className="p-4 space-y-4 animate-in fade-in duration-150" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Info Banner */}
          <div className="flex items-center justify-between rounded-lg bg-[#161b22]/70 border border-[#1e293b] px-3.5 py-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                {inspectorTexts.banner[simLanguage] || 'Trade Zone Chat Interface Preview — Clean user-facing prompt bubble (raw prompt is never shown to the user).'}
              </span>
            </span>
            <span className="font-mono text-[10px] text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded">
              {result.timestamp}
            </span>
          </div>

          {/* User Message Bubble */}
          <div className="flex flex-col items-end">
            <div className="max-w-[92%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg border border-blue-400/20">
              {/* Header: Localized Mode Title */}
              <div className="flex items-center justify-between gap-3 border-b border-blue-400/30 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white text-[10px] font-black">
                    U
                  </div>
                  <span className="text-xs font-bold text-blue-100">
                    {inspectorTexts.analysisRequest[simLanguage] || 'Analysis Request'}:
                  </span>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-black tracking-wide text-white backdrop-blur-sm">
                  {result.mode_title}
                </span>
              </div>

              {/* Display Summary */}
              <div className="text-sm font-bold tracking-tight text-white mb-2.5">
                {result.display_summary || `${result.mode_title}`}
              </div>

              {/* Parameter Badges / Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {inputChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-900/60 border border-blue-400/30 px-2 py-0.5 text-[11px] font-medium text-blue-100"
                  >
                    <span className="text-blue-300 text-[10px]">{chip.label}:</span>
                    <span className="font-bold text-white">{chip.value}</span>
                  </span>
                ))}
              </div>

              <div className="mt-2 text-[10px] text-blue-200/70 text-end font-mono">
                {result.timestamp} • Delivered
              </div>
            </div>
          </div>

          {/* AI Assistant Output Card */}
          <div className="rounded-2xl rounded-tl-sm border border-[#1e293b] bg-[#161b22] p-4 shadow-xl space-y-3.5">
            {/* Card Header: Signal type & Confidence */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Trade Zone AI Bot</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wider ${
                      result.ai_mock_response.signal_type === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {result.ai_mock_response.signal_type === 'BUY' ? '▲ LONG / BUY' : '▼ SHORT / SELL'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {inspectorTexts.signalConfluence[simLanguage] || 'Algorithmic Signal Confluence'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-md bg-[#0d1117] px-2.5 py-1 text-xs font-mono font-bold text-blue-400 border border-[#1e293b]">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                <span>{result.ai_mock_response.confidence}% Confidence</span>
              </div>
            </div>

            {/* Summary Text */}
            <p className="text-xs leading-relaxed text-gray-200">
              {result.ai_mock_response.summary}
            </p>

            {/* Coordinates Grid: Entry, TP, SL */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="rounded-lg bg-[#0d1117] p-2.5 border border-[#1e293b]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {inspectorTexts.entryZone[simLanguage] || 'Entry Zone'}
                </span>
                <div className="mt-0.5 text-xs font-mono font-bold text-white">
                  {result.ai_mock_response.entry_zone}
                </div>
              </div>

              <div className="rounded-lg bg-[#0d1117] p-2.5 border border-[#1e293b]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {inspectorTexts.targets[simLanguage] || 'Take Profit Targets'}
                </span>
                <div className="mt-0.5 space-y-0.5 text-[11px] font-mono font-semibold text-emerald-300">
                  {result.ai_mock_response.targets.map((tp, idx) => (
                    <div key={idx}>{tp}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[#0d1117] p-2.5 border border-[#1e293b]">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    {inspectorTexts.stopLoss[simLanguage] || 'Stop-Loss'}
                  </span>
                  <span className="text-[10px] font-mono text-blue-400">
                    R:R {result.ai_mock_response.risk_reward}
                  </span>
                </div>
                <div className="mt-0.5 text-xs font-mono font-bold text-rose-300">
                  {result.ai_mock_response.stop_loss}
                </div>
              </div>
            </div>

            {/* Indicator Confluence Badges */}
            <div className="rounded-lg bg-[#0d1117] p-2.5 border border-[#1e293b] space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {inspectorTexts.confluences[simLanguage] || 'Confluence Breakdown'}
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                {result.ai_mock_response.indicators_breakdown.map((ind, i) => (
                  <div key={i} className="flex items-center justify-between rounded bg-[#161b22] border border-[#1e293b] px-2 py-1 text-[11px]">
                    <span className="text-gray-300 font-medium">{ind.name}</span>
                    <span className={`text-[10px] font-bold ${
                      ind.sentiment === 'bullish' ? 'text-emerald-400' : ind.sentiment === 'bearish' ? 'text-rose-400' : 'text-gray-400'
                    }`}>
                      {ind.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Notes */}
            <div className="text-[11px] text-gray-400 bg-[#0d1117] p-2.5 rounded-lg border border-[#1e293b]">
              {result.ai_mock_response.detailed_notes}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Compiled n8n Payload */}
      {activeTab === 'n8n' && (
        <div className="p-4 space-y-4 animate-in fade-in duration-150" dir="ltr">
          {/* Webhook Endpoint Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#161b22] border border-[#1e293b] px-3.5 py-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="rounded bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                POST
              </span>
              <span className="text-gray-300 font-medium">https://n8n.tradezone.ai/webhook/v1/ai-signal-generate</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
              <span className="rounded bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 text-blue-300">
                HTTP 200 OK
              </span>
              <span>application/json</span>
            </div>
          </div>

          {/* Section 1: Compiled Prompt Box */}
          <div className="rounded-lg border border-[#1e293b] bg-[#161b22] p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Compiled AI Prompt
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-[#0d1117] px-2 py-0.5 rounded border border-[#1e293b]">
                  {(result.compiled_prompt || '').length} chars
                </span>
              </div>
              <button
                type="button"
                id="btn-copy-compiled-prompt"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 rounded-md bg-[#0d1117] hover:bg-[#1e293b] border border-[#1e293b] px-2.5 py-1 text-xs font-bold text-gray-200 transition-colors"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Prompt!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md bg-[#0d1117] p-3 font-mono text-xs leading-relaxed text-emerald-300 border border-[#1e293b]">
              {result.compiled_prompt ? (
                result.compiled_prompt
              ) : (
                <span className="text-gray-500 italic">
                  "" (Empty compiled_prompt — raw field inputs will be transmitted directly to n8n)
                </span>
              )}
            </pre>
          </div>

          {/* Section 2: Raw Webhook JSON Payload Box */}
          <div className="rounded-lg border border-[#1e293b] bg-[#161b22] p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Raw Webhook JSON Payload
                </span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">
                  Target: n8n Node
                </span>
              </div>
              <button
                type="button"
                id="btn-copy-webhook-payload"
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-bold text-white shadow-sm transition-colors"
              >
                {copiedPayload ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Copied Payload!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Webhook Payload</span>
                  </>
                )}
              </button>
            </div>
            <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md bg-[#0d1117] p-3 font-mono text-xs leading-relaxed text-blue-300 border border-[#1e293b]">
              {JSON.stringify(result.n8n_payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
