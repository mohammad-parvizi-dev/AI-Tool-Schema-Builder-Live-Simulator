import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Activity, 
  Search, 
  Bot, 
  Zap,
  Globe2
} from 'lucide-react';
import { 
  RootToolSchema, 
  ToolMode, 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES,
  SimulationResult,
  N8nWebhookPayload
} from '../../types';
import { compileTemplate, generateMockAiResponse } from '../../utils/promptCompiler';
import { GeneratedRequestInspector } from './GeneratedRequestInspector';

const uiTranslations: Record<string, Record<SupportedLanguage, string>> = {
  selectMode: {
    en: 'Select Analysis Mode',
    fa: 'انتخاب حالت تحلیل',
    ar: 'اختر نوع التحليل',
    zh: '选择分析模式',
    es: 'Seleccionar Modo de Análisis',
    tr: 'Analiz Modunu Seçin',
  },
  modesCount: {
    en: 'Modes',
    fa: 'حالت موجود',
    ar: 'أوضاع متاحة',
    zh: '个模式',
    es: 'Modos',
    tr: 'Mod',
  },
  inputsCount: {
    en: 'inputs',
    fa: 'فیلد',
    ar: 'حقول',
    zh: '个字段',
    es: 'campos',
    tr: 'girdi',
  },
  active: {
    en: 'Active',
    fa: 'فعال',
    ar: 'نشط',
    zh: '当前生效',
    es: 'Activo',
    tr: 'Aktif',
  },
  analysisParams: {
    en: 'Analysis Parameters',
    fa: 'تنظیم پارامترهای تحلیل',
    ar: 'إعدادات المعاملات',
    zh: '分析参数设置',
    es: 'Parámetros de Análisis',
    tr: 'Analiz Parametreleri',
  },
  noFields: {
    en: 'No input fields defined for this mode.',
    fa: 'فیلدی برای این حالت اضافه نشده است',
    ar: 'لم يتم تحديد حقول لهذا الوضع.',
    zh: '该模式尚未配置输入字段。',
    es: 'No hay campos definidos para este modo.',
    tr: 'Bu mod için tanımlanmış alan yok.',
  },
  generating: {
    en: 'Analyzing Orderbook & Processing Quantitative Signal...',
    fa: 'در حال تحلیل دفتر سفارشات و پردازش الگوریتمی...',
    ar: 'جاري تحليل الأوامر ومعالجة الخوارزميات...',
    zh: '正在分析订单簿并计算量化信号...',
    es: 'Analizando libro de órdenes y procesando señal cuantitativa...',
    tr: 'Emir defteri analiz ediliyor ve algoritmik sinyal işleniyor...',
  },
  generateBtn: {
    en: 'Generate AI Quantitative Analysis',
    fa: 'ارسال درخواست و تولید تحلیل هوش مصنوعی',
    ar: 'إرسال الطلب وإنشاء التحليل بالذكاء الاصطناعي',
    zh: '生成 AI 量化分析与交易信号',
    es: 'Generar Análisis Cuantitativo de IA',
    tr: 'Yapay Zeka Kantitatif Analizi Üret',
  },
};

interface LiveSimulatorProps {
  schema: RootToolSchema;
  activeModeId: string;
  onSelectMode: (modeId: string) => void;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({
  schema,
  activeModeId,
  onSelectMode
}) => {
  const [simLanguage, setSimLanguage] = useState<SupportedLanguage>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showPromptAccordion, setShowPromptAccordion] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [searchAssetQuery, setSearchAssetQuery] = useState('');
  const [openSearchFieldId, setOpenSearchFieldId] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMode: ToolMode = (schema.modes || []).find(m => m.id === activeModeId) || (schema.modes || [])[0] || {
    id: 'default',
    mode_id: 'default',
    title: { en: 'Default Strategy', fa: 'استراتژی پیش‌فرض', ar: 'الاستراتيجية الافتراضية' },
    description: { en: '', fa: '', ar: '' },
    prompt_template: '',
    display_template: '',
    fields: []
  };

  // Sync initial default values whenever activeMode changes
  useEffect(() => {
    if (!activeMode) return;
    const initial: Record<string, any> = {};
    (activeMode.fields || []).forEach(field => {
      if (formValues[field.key] !== undefined) {
        initial[field.key] = formValues[field.key];
      } else {
        initial[field.key] = field.default_value ?? '';
      }
    });
    setFormValues(initial);
  }, [activeMode?.id, activeMode?.fields?.length]);

  const handleInputChange = (key: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerate = () => {
    if (!activeMode) return;
    setIsGenerating(true);

    setTimeout(() => {
      const modeTitle = (activeMode.title && typeof activeMode.title === 'object')
        ? (activeMode.title[simLanguage] || activeMode.title.en || activeMode.mode_id || 'Trade Mode')
        : String(activeMode.title || activeMode.mode_id || 'Trade Mode');

      const compiled = activeMode.prompt_template?.trim()
        ? compileTemplate(activeMode.prompt_template, formValues, simLanguage)
        : '';
      const summaryTemplate = activeMode.display_template || '{asset} • {timeframe}';
      const summary = compileTemplate(summaryTemplate, formValues, simLanguage);
      const mockAi = generateMockAiResponse(modeTitle, formValues, simLanguage);

      const n8nPayload: N8nWebhookPayload = {
        mode_id: activeMode.mode_id || activeMode.id,
        display_title: modeTitle,
        display_summary: summary || modeTitle,
        compiled_prompt: compiled || '',
        inputs: {
          ...formValues,
          language: simLanguage
        }
      };

      setSimulationResult({
        timestamp: new Date().toLocaleTimeString(),
        mode_id: activeMode.mode_id || activeMode.id,
        mode_title: modeTitle,
        display_summary: summary,
        form_values: formValues,
        compiled_prompt: compiled,
        language: simLanguage,
        n8n_payload: n8nPayload,
        ai_mock_response: mockAi
      });
      setIsGenerating(false);
    }, 450);
  };

  const handleCopyPrompt = () => {
    if (!simulationResult) return;
    navigator.clipboard.writeText(simulationResult.compiled_prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const isRtl = simLanguage === 'fa' || simLanguage === 'ar';

  const getFieldLabel = (field: any) => {
    if (typeof field.label === 'string') return field.label;
    if (field.label && typeof field.label === 'object') {
      return field.label[simLanguage] || field.label.en || field.key;
    }
    return field.key;
  };

  const getFieldHelper = (field: any) => {
    if (typeof field.description === 'string') return field.description;
    if (field.description && typeof field.description === 'object') {
      return field.description[simLanguage] || field.description.en || '';
    }
    return '';
  };

  const getFieldPlaceholder = (field: any) => {
    if (typeof field.placeholder === 'string') return field.placeholder;
    if (field.placeholder && typeof field.placeholder === 'object') {
      return field.placeholder[simLanguage] || field.placeholder.en || '';
    }
    return '';
  };

  const getOptionLabel = (opt: any) => {
    if (typeof opt.label === 'string') return opt.label;
    if (opt.label && typeof opt.label === 'object') {
      return opt.label[simLanguage] || opt.label.en || opt.value;
    }
    return opt.value;
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === simLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div 
      id="live-user-simulator"
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="flex h-full flex-col overflow-hidden rounded-lg border border-[#1e293b] bg-[#0d1117] shadow-xl"
    >
      {/* Simulator Device Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] bg-[#161b22] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5" dir="ltr">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-[#1e293b]" />
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-white">
              Trade Zone Dark UI
            </span>
            <span className="rounded bg-blue-600/10 px-1.5 py-0.2 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
              Live Preview
            </span>
          </div>
        </div>

        {/* Live Simulator Language Switcher matching uploaded design */}
        <div className="relative" ref={langMenuRef} dir="ltr">
          <button
            type="button"
            id="sim-lang-dropdown-trigger"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 rounded-xl bg-[#0d1117] hover:bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-gray-200 border border-[#1e293b] shadow-sm transition hover:border-[#334155]"
          >
            <span className="text-base">{currentLangObj.flag}</span>
            <span>{currentLangObj.name}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangMenuOpen && (
            <div 
              id="sim-lang-dropdown-menu"
              className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#1e293b] bg-[#0c1322] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-md"
            >
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = simLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSimLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition text-left ${
                      isSelected
                        ? 'bg-[#1e293b] text-white font-bold shadow-sm'
                        : 'text-gray-300 hover:bg-[#161b22] hover:text-white'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Simulator Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Active Mode Banner in Live UI */}
        <div className="rounded-lg border border-[#1e293b] bg-[#161b22] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {activeMode.title[simLanguage] || activeMode.title.en || activeMode.title.fa || 'Trade Zone AI Engine'}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                {activeMode.description[simLanguage] || activeMode.description.en || activeMode.description.fa || 'Real-time AI Quantitative Analysis Engine'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Cards (End-User View) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {uiTranslations.selectMode[simLanguage] || 'Select Analysis Mode'}
            </label>
            <span className="text-[11px] text-blue-400 font-medium">
              {(schema.modes || []).length} {uiTranslations.modesCount[simLanguage] || 'Modes'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {(schema.modes || []).map((mode, mIdx) => {
              const isSelected = mode.id === activeMode.id;
              const title = mode.title[simLanguage] || mode.title.en || mode.title.fa || `Mode ${mIdx + 1}`;
              const desc = mode.description[simLanguage] || mode.description.en || mode.description.fa || '';

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSelectMode(mode.id)}
                  className={`group relative flex flex-col justify-between rounded-lg border p-3 text-start transition duration-150 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/10 text-white shadow-sm'
                      : 'border-[#1e293b] bg-[#0d1117] text-gray-300 hover:border-[#334155] hover:bg-[#161b22]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-blue-600 text-white font-black' : 'bg-[#1e293b] text-gray-400'
                        }`}>
                          {mIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                          {title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      )}
                    </div>
                    {desc && (
                      <p className="text-[11px] leading-relaxed text-gray-400 line-clamp-2">
                        {desc}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{(mode.fields || []).length} {uiTranslations.inputsCount[simLanguage] || 'inputs'}</span>
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition">
                      {isSelected ? `✓ ${uiTranslations.active[simLanguage] || 'Active'}` : '→'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form for Active Mode */}
        <div className="rounded-lg border border-[#1e293b] bg-[#161b22] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
            <h3 className="text-xs font-bold text-gray-200 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>
                {uiTranslations.analysisParams[simLanguage] || 'Analysis Parameters'}
              </span>
            </h3>
            <span className="font-mono text-[11px] text-blue-400">
              {activeMode.title[simLanguage] || activeMode.title.en || activeMode.title.fa}
            </span>
          </div>

          {(activeMode.fields || []).length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              {uiTranslations.noFields[simLanguage] || 'No input fields defined for this mode.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(activeMode.fields || []).map((field) => {
                const label = getFieldLabel(field);
                const helper = getFieldHelper(field);
                const placeholder = getFieldPlaceholder(field);
                const value = formValues[field.key] ?? field.default_value;

                return (
                  <div 
                    key={field.id} 
                    className={`${field.type === 'textarea' || field.type === 'switch' ? 'sm:col-span-2' : ''}`}
                  >
                    {/* Field Label */}
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-300">
                        {label}
                        {field.required && <span className="text-rose-400 ml-1 mr-1">*</span>}
                      </label>
                      {field.type === 'range_slider' && (
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                          {value}{field.slider_config?.unit || ''}
                        </span>
                      )}
                    </div>

                    {/* RENDER FIELD TYPE: search_select */}
                    {field.type === 'search_select' && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenSearchFieldId(openSearchFieldId === field.id ? null : field.id)}
                          className="flex w-full items-center justify-between rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 text-xs text-white transition hover:border-[#334155] focus:border-blue-500 focus:outline-none"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-[10px] font-bold text-blue-300">
                              {(field.options?.find(o => o.value === value)?.symbol || value || 'C').slice(0, 3)}
                            </div>
                            <span className="font-medium text-white">
                              {getOptionLabel(field.options?.find(o => o.value === value)) ||
                               value ||
                               'Select Option'}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {/* Search Dropdown */}
                        {openSearchFieldId === field.id && (
                          <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-lg border border-[#1e293b] bg-[#161b22] p-1.5 shadow-2xl">
                            <div className="sticky top-0 mb-1 border-b border-[#1e293b] bg-[#161b22] pb-1.5">
                              <div className="relative">
                                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                  type="text"
                                  value={searchAssetQuery}
                                  onChange={(e) => setSearchAssetQuery(e.target.value)}
                                  placeholder={simLanguage === 'fa' ? 'جستجوی ارز یا نماد...' : 'Search coin / asset...'}
                                  className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] py-1 pl-7 pr-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              {(field.options || [])
                                .filter(opt => {
                                  const q = searchAssetQuery.toLowerCase();
                                  const optLbl = getOptionLabel(opt).toLowerCase();
                                  return (
                                    opt.value.toLowerCase().includes(q) ||
                                    optLbl.includes(q) ||
                                    (opt.symbol || '').toLowerCase().includes(q)
                                  );
                                })
                                .map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                      handleInputChange(field.key, opt.value);
                                      setOpenSearchFieldId(null);
                                      setSearchAssetQuery('');
                                    }}
                                    className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs text-start transition ${
                                      opt.value === value
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-gray-300 hover:bg-[#0d1117] hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {opt.symbol && (
                                        <span className="rounded bg-[#0d1117] px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-300 border border-[#1e293b]">
                                          {opt.symbol}
                                        </span>
                                      )}
                                      <span>{getOptionLabel(opt)}</span>
                                    </div>
                                    {opt.badge && (
                                      <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-amber-300">
                                        {opt.badge}
                                      </span>
                                    )}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RENDER FIELD TYPE: pills */}
                    {field.type === 'pills' && (
                      <div className="flex flex-wrap gap-1.5">
                        {(field.options || []).map((opt) => {
                          const isOptActive = String(value) === String(opt.value);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleInputChange(field.key, opt.value)}
                              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                isOptActive
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-[#0d1117] text-gray-300 border border-[#1e293b] hover:border-[#334155] hover:text-white'
                              }`}
                            >
                              {getOptionLabel(opt)}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* RENDER FIELD TYPE: select */}
                    {field.type === 'select' && (
                      <select
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 text-xs text-white transition focus:border-blue-500 focus:outline-none"
                      >
                        {(field.options || []).map((opt) => (
                          <option key={opt.id} value={opt.value}>
                            {getOptionLabel(opt)}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* RENDER FIELD TYPE: range_slider */}
                    {field.type === 'range_slider' && (
                      <div className="space-y-1.5">
                        <input
                          type="range"
                          min={field.slider_config?.min ?? 1}
                          max={field.slider_config?.max ?? 10}
                          step={field.slider_config?.step ?? 1}
                          value={value ?? 5}
                          onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#0d1117] accent-blue-500 border border-[#1e293b]"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>{field.slider_config?.min_label || `${field.slider_config?.min ?? 1}`}</span>
                          <span>{field.slider_config?.max_label || `${field.slider_config?.max ?? 10}`}</span>
                        </div>
                      </div>
                    )}

                    {/* RENDER FIELD TYPE: switch */}
                    {field.type === 'switch' && (
                      <div className="flex items-center justify-between rounded-md border border-[#1e293b] bg-[#0d1117] p-3">
                        <span className="text-xs text-gray-300">{label}</span>
                        <button
                          type="button"
                          onClick={() => handleInputChange(field.key, !value)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            value ? 'bg-blue-600' : 'bg-gray-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              value ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* RENDER FIELD TYPE: text */}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    )}

                    {/* RENDER FIELD TYPE: textarea */}
                    {field.type === 'textarea' && (
                      <textarea
                        rows={2}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    )}

                    {helper && (
                      <p className="mt-1 text-[10px] text-gray-500">{helper}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button: Generate Analysis */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-simulate-generate"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm transition-colors active:scale-[0.99] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>
                    {uiTranslations.generating[simLanguage] || 'Analyzing Orderbook & Processing Quantitative Signal...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span>
                    {uiTranslations.generateBtn[simLanguage] || 'Generate AI Quantitative Analysis'}
                  </span>
                  <Send className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual-Output Simulation Inspector: Chat Bubble Preview & Compiled n8n Payload */}
        {simulationResult && (
          <GeneratedRequestInspector
            result={simulationResult}
            simLanguage={simLanguage}
            activeMode={activeMode}
          />
        )}
      </div>
    </div>
  );
};
