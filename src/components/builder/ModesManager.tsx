import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Terminal, 
  Globe, 
  Zap, 
  CheckCircle2
} from 'lucide-react';
import { ToolMode, SupportedLanguage, SUPPORTED_LANGUAGES } from '../../types';
import { FieldEditor } from './FieldEditor';
import { extractPlaceholders } from '../../utils/promptCompiler';

interface ModesManagerProps {
  modes: ToolMode[];
  activeModeId: string;
  onSelectMode: (modeId: string) => void;
  onChangeModes: (updatedModes: ToolMode[]) => void;
}

const titlePlaceholders: Record<SupportedLanguage, string> = {
  en: 'e.g. Scalp & Rapid Breakout',
  fa: 'مثال: اسکالپ و شکست سریع',
  ar: 'مثال: المضاربة السريعة والاختراق',
  zh: '例如：高频超短线与突破',
  es: 'ej. Scalping y Ruptura Rápida',
  tr: 'örn. Scalp ve Hızlı Kırılım',
};

const descPlaceholders: Record<SupportedLanguage, string> = {
  en: 'Explain what this mode achieves for the end user...',
  fa: 'توضیح دهید این حالت چه تحلیلی ارائه می‌دهد تا کاربر متوجه شود...',
  ar: 'اشرح ما يقدمه هذا الوضع للمستخدم...',
  zh: '说明该模式的交易逻辑与为用户提供的分析价值...',
  es: 'Explica qué analiza este modo para el usuario final...',
  tr: 'Bu modun son kullanıcı için ne sağladığını açıklayın...',
};

export const ModesManager: React.FC<ModesManagerProps> = ({
  modes,
  activeModeId,
  onSelectMode,
  onChangeModes
}) => {
  const [activeLangTab, setActiveLangTab] = useState<SupportedLanguage>('en');
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const activeMode = modes.find(m => m.id === activeModeId) || modes[0];

  const updateActiveMode = (updates: Partial<ToolMode>) => {
    if (!activeMode) return;
    const updated = modes.map(m => m.id === activeMode.id ? { ...m, ...updates } : m);
    onChangeModes(updated);
  };

  const addMode = () => {
    const newId = `mode_${Date.now().toString(36)}`;
    const newMode: ToolMode = {
      id: newId,
      mode_id: `custom_strategy_${modes.length + 1}`,
      title: {
        en: `Mode ${modes.length + 1}: Custom Strategy`,
        fa: `حالت ${modes.length + 1}: استراتژی سفارشی`,
        ar: `الوضع ${modes.length + 1}: استراتيجية مخصصة`,
        zh: `模式 ${modes.length + 1}: 自定义策略`,
        es: `Modo ${modes.length + 1}: Estrategia Personalizada`,
        tr: `Mod ${modes.length + 1}: Özel Strateji`
      },
      description: {
        en: `Description for analysis mode ${modes.length + 1}...`,
        fa: `توضیحات کاربردی برای حالت تحلیلی ${modes.length + 1}...`,
        ar: `وصف تفصيلي لوضع التحليل ${modes.length + 1}...`,
        zh: `针对分析模式 ${modes.length + 1} 的应用说明...`,
        es: `Descripción práctica para el modo de análisis ${modes.length + 1}...`,
        tr: `${modes.length + 1}. analiz modu için pratik açıklama...`
      },
      icon: 'Zap',
      badge_color: 'blue',
      prompt_template: `Act as a trading analyst. Analyze {asset} on {timeframe}. Risk profile: {risk_level}. Language: {language}.`,
      display_template: 'Analysis: {asset} • {timeframe}',
      fields: [
        {
          id: `f_${Date.now()}_1`,
          key: 'asset',
          label: 'Crypto Asset / Pair',
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
    };

    const updated = [...modes, newMode];
    onChangeModes(updated);
    onSelectMode(newId);
  };

  const deleteMode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (modes.length <= 1) {
      alert('A tool must have at least one analysis mode.');
      return;
    }
    const updated = modes.filter(m => m.id !== id);
    onChangeModes(updated);
    if (activeModeId === id) {
      onSelectMode(updated[0].id);
    }
  };

  const duplicateMode = (mode: ToolMode, e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = `mode_${Date.now().toString(36)}`;
    const currentModeId = mode.mode_id || `mode_${Date.now().toString(36)}`;
    const cloned: ToolMode = {
      ...JSON.parse(JSON.stringify(mode)),
      id: newId,
      mode_id: `${currentModeId}_copy`,
      title: {
        en: `${mode.title.en || ''} (Copy)`,
        fa: `${mode.title.fa || ''} (کپی)`,
        ar: mode.title.ar ? `${mode.title.ar} (نسخة)` : '',
        zh: mode.title.zh ? `${mode.title.zh} (副本)` : '',
        es: mode.title.es ? `${mode.title.es} (Copia)` : '',
        tr: mode.title.tr ? `${mode.title.tr} (Kopya)` : ''
      }
    };
    const updated = [...modes, cloned];
    onChangeModes(updated);
    onSelectMode(newId);
  };

  // Helper to insert variable placeholder into prompt template
  const insertPlaceholderIntoPrompt = (varKey: string) => {
    const textarea = promptTextareaRef.current;
    if (!textarea || !activeMode) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeMode.prompt_template || '';
    const tag = `{${varKey}}`;

    const updatedText = currentText.substring(0, start) + tag + currentText.substring(end);
    updateActiveMode({ prompt_template: updatedText });

    // restore cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  if (!activeMode) return null;

  const currentPlaceholders = extractPlaceholders(activeMode.prompt_template || '');
  const availableFieldKeys = activeMode.fields.map(f => (f.key || '').trim()).filter(Boolean);
  const allInsertableVariables = Array.from(new Set([...availableFieldKeys, 'language']));

  return (
    <div className="space-y-4">
      {/* Modes Navigation Bar */}
      <div className="rounded-lg border border-[#1e293b] bg-[#161b22] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-600/10 p-1.5 text-blue-500">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              Analysis Modes ({modes.length})
            </h2>
          </div>
          <button
            type="button"
            id="btn-add-mode"
            onClick={addMode}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Mode</span>
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          {modes.map((mode, idx) => {
            const isActive = mode.id === activeMode.id;
            return (
              <div
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition ${
                  isActive
                    ? 'border-blue-500 bg-blue-600/10 text-white shadow-sm'
                    : 'border-[#1e293b] bg-[#0d1117] text-gray-400 hover:border-[#334155] hover:text-gray-200'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="max-w-[150px] truncate sm:max-w-[200px]">
                  {mode.title?.[activeLangTab] || mode.title?.en || mode.title?.fa || `Mode ${idx + 1}`}
                </span>
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => duplicateMode(mode, e)}
                    title="Duplicate Mode"
                    className="rounded p-0.5 text-gray-400 hover:text-blue-400"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {modes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => deleteMode(mode.id, e)}
                      title="Delete Mode"
                      className="rounded p-0.5 text-gray-400 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Mode Configuration Container */}
      <div className="rounded-lg border border-[#1e293b] bg-[#161b22] p-4 sm:p-5 space-y-5">
        {/* Mode Header & Active Mode Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              Active Mode: <span className="text-blue-400">{activeMode.title?.[activeLangTab] || activeMode.title?.en || activeMode.title?.fa}</span>
            </span>
          </div>

          {/* Language Switcher for Mode Title & Description */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Globe className="h-3 w-3 text-gray-500" />
              <span>Editing Language:</span>
            </span>
            <div className="flex flex-wrap gap-1 rounded-md bg-[#0d1117] p-1 border border-[#1e293b]">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLangTab(lang.code)}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeLangTab === lang.code
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]'
                  }`}
                >
                  <span className="text-xs">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Title & Mode ID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs text-gray-400 font-medium">
              Mode Title ({activeLangTab.toUpperCase()}) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              dir={activeLangTab === 'fa' || activeLangTab === 'ar' ? 'rtl' : 'ltr'}
              value={
                typeof activeMode.title === 'object' && activeMode.title !== null
                  ? (activeMode.title[activeLangTab] ?? '')
                  : String(activeMode.title ?? '')
              }
              onChange={(e) => {
                const currentTitle = typeof activeMode.title === 'object' && activeMode.title !== null
                  ? { ...activeMode.title }
                  : { en: typeof activeMode.title === 'string' ? activeMode.title : '', fa: '', ar: '', zh: '', es: '', tr: '' };
                updateActiveMode({
                  title: {
                    ...currentTitle,
                    [activeLangTab]: e.target.value
                  }
                });
              }}
              placeholder={titlePlaceholders[activeLangTab]}
              className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-gray-400 font-medium">
              Mode ID / Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={activeMode.mode_id || ''}
              onChange={(e) => updateActiveMode({ 
                mode_id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
              })}
              placeholder="e.g. scalp_breakout"
              className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 font-mono text-xs text-blue-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mode Description (Multilingual) */}
        <div className="space-y-1.5">
          <label className="block text-xs text-gray-400 font-medium">
            Mode User Description ({activeLangTab.toUpperCase()})
          </label>
          <textarea
            dir={activeLangTab === 'fa' || activeLangTab === 'ar' ? 'rtl' : 'ltr'}
            rows={2}
            value={
              typeof activeMode.description === 'object' && activeMode.description !== null
                ? (activeMode.description[activeLangTab] ?? '')
                : String(activeMode.description ?? '')
            }
            onChange={(e) => {
              const currentDesc = typeof activeMode.description === 'object' && activeMode.description !== null
                ? { ...activeMode.description }
                : { en: typeof activeMode.description === 'string' ? activeMode.description : '', fa: '', ar: '', zh: '', es: '', tr: '' };
              updateActiveMode({
                description: {
                  ...currentDesc,
                  [activeLangTab]: e.target.value
                }
              });
            }}
            placeholder={descPlaceholders[activeLangTab]}
            className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Prompt Template Section with Variable Injection */}
        <div className="rounded-lg border border-[#1e293b] bg-[#0d1117] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded bg-blue-600/10 p-1 text-blue-400">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300">
                  AI Prompt Template (Sent to LLM / n8n) <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <p className="text-[11px] text-gray-500">
                  Click any variable pill to insert, or leave blank if only raw form inputs should be sent to n8n:
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-blue-400 bg-[#161b22] px-2 py-0.5 rounded border border-[#1e293b]">
              {currentPlaceholders.length} {currentPlaceholders.length === 1 ? 'variable' : 'variables'} detected
            </span>
          </div>

          {/* Variable Injection Chips */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#1e293b] bg-[#161b22] p-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-1">
              Insert Variable:
            </span>
            {allInsertableVariables.map((vKey) => {
              const isUsed = currentPlaceholders.includes(vKey);
              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => insertPlaceholderIntoPrompt(vKey)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-mono font-medium transition ${
                    isUsed
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30'
                      : 'bg-[#0d1117] text-gray-300 border border-[#1e293b] hover:bg-[#1e293b] hover:text-white'
                  }`}
                  title={`Click to insert {${vKey}} at cursor position`}
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span>{"{" + vKey + "}"}</span>
                  {isUsed && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Prompt Template Textarea */}
          <textarea
            ref={promptTextareaRef}
            rows={4}
            value={activeMode.prompt_template || ''}
            onChange={(e) => updateActiveMode({ prompt_template: e.target.value })}
            placeholder="Optional: e.g. Act as a quantitative crypto scalper. Analyze {asset} on {timeframe} timeframe... (Leave blank if you do not need compiled_prompt)"
            className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] p-2.5 font-mono text-xs text-blue-300 placeholder-gray-600 leading-relaxed focus:border-blue-500 focus:outline-none"
          />

          {/* Display Template */}
          <div className="pt-2 border-t border-[#1e293b] space-y-1">
            <label className="block text-xs text-gray-400 font-medium">
              Display Summary Template (Rendered in Chat Bubble tag)
            </label>
            <input
              type="text"
              value={activeMode.display_template || ''}
              onChange={(e) => updateActiveMode({ 
                display_template: e.target.value
              })}
              placeholder="e.g. {asset} • {timeframe} • Risk: {risk_level}"
              className="w-full rounded-md border border-[#1e293b] bg-[#161b22] px-3 py-1.5 font-mono text-xs text-emerald-400 placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-[10px] text-gray-500">
              Template for the concise summary pill shown when the user submits their request (e.g. BTCUSDT • 15m • Scalp).
            </p>
          </div>
        </div>

        {/* Dynamic Field Builder for this Mode */}
        <div className="pt-2">
          <FieldEditor
            fields={activeMode.fields}
            onChange={(updatedFields) => updateActiveMode({ fields: updatedFields })}
          />
        </div>
      </div>
    </div>
  );
};
