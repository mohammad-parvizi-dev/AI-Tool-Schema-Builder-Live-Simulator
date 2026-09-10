import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  AlertTriangle, 
  Maximize2, 
  Minimize2,
  Database,
  Sparkles,
  Minimize,
  RotateCcw,
  CheckCircle2,
  Code,
  Edit3
} from 'lucide-react';
import { RootToolSchema, ValidationError, ExportedRootSchema, ToolMode } from '../../types';

interface JsonViewerProps {
  schema: RootToolSchema;
  validationErrors: ValidationError[];
  onChangeSchema: (updatedSchema: RootToolSchema) => void;
  onResetToPreset?: () => void;
}

/**
 * Normalizes raw parsed JSON into a strictly typed RootToolSchema
 */
function normalizeParsedSchema(parsed: any): RootToolSchema | null {
  if (!parsed) return null;

  let rawModes: any[] = [];
  if (Array.isArray(parsed)) {
    rawModes = parsed;
  } else if (parsed && Array.isArray(parsed.modes)) {
    rawModes = parsed.modes;
  } else {
    return null;
  }

  const normalizedModes: ToolMode[] = rawModes.map((m: any, idx: number) => {
    const modeId = m.mode_id || m.slug || m.id || `mode_${idx + 1}`;
    
    // Normalize multilingual title
    let title = { en: `Mode ${idx + 1}`, fa: `حالت ${idx + 1}`, ar: `الوضع ${idx + 1}` };
    if (typeof m.title === 'string') {
      title = { en: m.title, fa: m.title, ar: m.title };
    } else if (m.title && typeof m.title === 'object') {
      title = {
        en: m.title.en || `Mode ${idx + 1}`,
        fa: m.title.fa || m.title.en || `حالت ${idx + 1}`,
        ar: m.title.ar || m.title.en || `الوضع ${idx + 1}`
      };
    }

    // Normalize multilingual description
    let description = { en: '', fa: '', ar: '' };
    if (typeof m.description === 'string') {
      description = { en: m.description, fa: m.description, ar: m.description };
    } else if (m.description && typeof m.description === 'object') {
      description = {
        en: m.description.en || '',
        fa: m.description.fa || m.description.en || '',
        ar: m.description.ar || m.description.en || ''
      };
    }

    // Normalize fields
    const fields = Array.isArray(m.fields)
      ? m.fields.map((f: any, fIdx: number) => {
          const fieldKey = f.key || `field_${fIdx + 1}`;
          return {
            id: f.id || `f_${modeId}_${fieldKey}_${fIdx}`,
            key: fieldKey,
            label: f.label || fieldKey,
            type: f.type || 'text',
            required: Boolean(f.required),
            description: f.description || '',
            default_value: f.default_value !== undefined ? f.default_value : '',
            placeholder: f.placeholder || '',
            slider_config: f.slider_config,
            options: Array.isArray(f.options)
              ? f.options.map((o: any, oIdx: number) => ({
                  id: o.id || `opt_${fieldKey}_${oIdx}`,
                  value: o.value || `option_${oIdx + 1}`,
                  label: o.label || o.value || `Option ${oIdx + 1}`,
                  symbol: o.symbol,
                  badge: o.badge,
                  icon_url: o.icon_url
                }))
              : undefined
          };
        })
      : [];

    return {
      id: m.id || `mode_${modeId}_${idx}`,
      mode_id: modeId,
      title,
      description,
      prompt_template: m.prompt_template || '',
      display_template: m.display_template || m.display_summary_template || '',
      fields
    };
  });

  return { modes: normalizedModes };
}

/**
 * Strips internal builder runtime IDs for clean export representation
 */
function toCleanExportObject(schema: RootToolSchema): ExportedRootSchema {
  return {
    modes: (schema.modes || []).map(m => ({
      mode_id: m.mode_id || m.id,
      title: m.title,
      description: m.description,
      prompt_template: m.prompt_template ?? '',
      display_template: m.display_template || '',
      fields: (m.fields || []).map(f => {
        const cleanField: any = {
          key: f.key,
          label: f.label,
          type: f.type,
          required: Boolean(f.required)
        };
        if (f.description) cleanField.description = f.description;
        if (f.default_value !== undefined && f.default_value !== '') cleanField.default_value = f.default_value;
        if (f.placeholder) cleanField.placeholder = f.placeholder;
        if (f.type === 'range_slider' && f.slider_config) cleanField.slider_config = f.slider_config;
        if (f.options && f.options.length > 0) {
          cleanField.options = f.options.map(o => {
            const cleanOpt: any = {
              value: o.value,
              label: o.label
            };
            if (o.symbol) cleanOpt.symbol = o.symbol;
            if (o.badge) cleanOpt.badge = o.badge;
            if (o.icon_url) cleanOpt.icon_url = o.icon_url;
            return cleanOpt;
          });
        }
        return cleanField;
      })
    }))
  };
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ 
  schema, 
  validationErrors,
  onChangeSchema,
  onResetToPreset
}) => {
  const [editorText, setEditorText] = useState<string>('');
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMinified, setIsMinified] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Track whether the editor is actively focused by the user to avoid cursor jumping
  const isUserTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external schema changes to the editor text when NOT actively edited by user
  useEffect(() => {
    if (isUserTypingRef.current) return;

    const cleanObj = toCleanExportObject(schema);
    const serialized = isMinified
      ? JSON.stringify(cleanObj)
      : JSON.stringify(cleanObj, null, 2);

    setEditorText(serialized);
    setSyntaxError(null);
  }, [schema, isMinified]);

  // Handle direct text editing with 300ms debounce and error isolation
  const handleTextChange = (newText: string) => {
    isUserTypingRef.current = true;
    setEditorText(newText);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        if (!newText.trim()) {
          setSyntaxError('JSON cannot be empty.');
          return;
        }

        const parsed = JSON.parse(newText);
        const normalized = normalizeParsedSchema(parsed);

        if (!normalized) {
          setSyntaxError('Invalid Schema Format: JSON must be an object with a "modes" array or an array of modes.');
          return;
        }

        if (normalized.modes.length === 0) {
          setSyntaxError('Invalid Schema: "modes" array cannot be empty. At least one mode is required.');
          return;
        }

        // Schema is valid! Push update to Visual Builder and Live Simulator
        setSyntaxError(null);
        onChangeSchema(normalized);
      } catch (err: any) {
        // Graceful error display without crashing the visual builder
        setSyntaxError(`Invalid JSON Syntax: ${err.message}`);
      } finally {
        // Release typing flag shortly after debounce finishes
        setTimeout(() => {
          isUserTypingRef.current = false;
        }, 150);
      }
    }, 300);
  };

  // Keyboard shortcut & Tab indentation handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newText = editorText.substring(0, start) + '  ' + editorText.substring(end);
      setEditorText(newText);
      handleTextChange(newText);

      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Format / Prettify Action
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(editorText);
      const formatted = JSON.stringify(parsed, null, 2);
      setIsMinified(false);
      setEditorText(formatted);
      setSyntaxError(null);
      const normalized = normalizeParsedSchema(parsed);
      if (normalized) onChangeSchema(normalized);
    } catch (err: any) {
      setSyntaxError(`Cannot format: ${err.message}`);
    }
  };

  // Minify Action
  const handleMinify = () => {
    try {
      const parsed = JSON.parse(editorText);
      const minified = JSON.stringify(parsed);
      setIsMinified(true);
      setEditorText(minified);
      setSyntaxError(null);
      const normalized = normalizeParsedSchema(parsed);
      if (normalized) onChangeSchema(normalized);
    } catch (err: any) {
      setSyntaxError(`Cannot minify: ${err.message}`);
    }
  };

  // Copy JSON to clipboard
  const handleCopy = () => {
    try {
      // If there's no syntax error, format cleanly before copying
      let textToCopy = editorText;
      try {
        const parsed = JSON.parse(editorText);
        textToCopy = JSON.stringify(toCleanExportObject(normalizeParsedSchema(parsed) || schema), null, 2);
      } catch {
        textToCopy = editorText;
      }

      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard.writeText(editorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download JSON File
  const handleDownload = () => {
    const blob = new Blob([editorText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const firstModeId = schema.modes?.[0]?.mode_id || 'trade_zone_schema';
    a.download = `${firstModeId}_tool_schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Sync scroll of line numbers gutter with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Calculate line numbers
  const linesCount = editorText.split('\n').length;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  const totalFields = (schema.modes || []).reduce((acc, m) => acc + (m.fields?.length || 0), 0);
  const errors = validationErrors.filter(e => e.type === 'error');
  const warnings = validationErrors.filter(e => e.type === 'warning');

  return (
    <div 
      id="json-live-editor-panel"
      className={`flex flex-col rounded-xl border border-[#1e293b] bg-[#0d1117] shadow-2xl transition-all ${
        expanded ? 'fixed inset-4 z-50 bg-[#0d1117]' : 'h-full'
      }`}
    >
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] bg-[#161b22] px-4 py-2.5">
        {/* Left Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Code className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
              <span>Schema JSON Export</span>
              <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                {"{ modes: [...] }"}
              </span>
            </h3>
          </div>
        </div>

        {/* Live sync badge */}
        <div className="hidden md:flex items-center gap-2">
          {syntaxError ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/40 px-2.5 py-0.5 rounded border border-rose-500/30">
              <AlertTriangle className="h-3 w-3" />
              <span>Syntax Error</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              <span>Bi-directional Sync Active</span>
            </span>
          )}
          <span className="text-[11px] font-mono text-gray-400 bg-[#0d1117] px-2 py-0.5 rounded border border-[#1e293b]">
            {(schema.modes || []).length} Modes • {totalFields} Fields
          </span>
        </div>

        {/* Toolbar Buttons: Format, Minify, Copy for DB, Reset, Download, Fullscreen */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Format / Prettify */}
          <button
            type="button"
            id="btn-format-json"
            onClick={handleFormat}
            title="Prettify JSON with 2-space indentation"
            className="flex items-center gap-1 rounded-md bg-[#0d1117] hover:bg-[#161b22] px-2.5 py-1 text-[11px] font-semibold text-gray-300 border border-[#1e293b] hover:text-white transition-colors"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Format</span>
          </button>

          {/* Minify */}
          <button
            type="button"
            id="btn-minify-json"
            onClick={handleMinify}
            title="Minify JSON into a single line"
            className="flex items-center gap-1 rounded-md bg-[#0d1117] hover:bg-[#161b22] px-2.5 py-1 text-[11px] font-semibold text-gray-300 border border-[#1e293b] hover:text-white transition-colors"
          >
            <Minimize className="h-3 w-3 text-blue-400" />
            <span>Minify</span>
          </button>

          {/* Reset to Preset / Blank */}
          {onResetToPreset && (
            <button
              type="button"
              id="btn-reset-json-preset"
              onClick={onResetToPreset}
              title="Reset schema to default preset"
              className="flex items-center gap-1 rounded-md bg-[#0d1117] hover:bg-[#161b22] px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-rose-300 border border-[#1e293b] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Copy JSON for Database Button */}
          <button
            type="button"
            id="btn-copy-json-db"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-bold text-white shadow-sm transition-colors active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                <span>Copied for DB!</span>
              </>
            ) : (
              <>
                <Database className="h-3.5 w-3.5" />
                <span>Copy JSON for Database</span>
              </>
            )}
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownload}
            title="Download .json file"
            className="rounded-md bg-[#161b22] p-1.5 text-gray-300 border border-[#1e293b] hover:bg-[#1e293b] hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Expand / Minimize */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Minimize' : 'Maximize Fullscreen'}
            className="rounded-md bg-[#161b22] p-1.5 text-gray-300 border border-[#1e293b] hover:bg-[#1e293b] hover:text-white"
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Syntax Error Alert Strip (Non-blocking, isolated) */}
      {syntaxError && (
        <div 
          id="json-syntax-error-banner"
          className="flex items-center gap-2 border-b border-rose-900/50 bg-rose-950/70 px-4 py-2 text-xs font-mono text-rose-300 animate-in fade-in duration-150"
        >
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span className="font-bold">⚠️ {syntaxError}</span>
        </div>
      )}

      {/* Schema Validation Warnings/Errors */}
      {!syntaxError && validationErrors.length > 0 && (
        <div className="border-b border-[#1e293b] bg-[#0d1117] px-4 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-1 text-rose-400 font-mono text-[11px]">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{err.message}</span>
              </div>
            ))}
            {warnings.map((warn, i) => (
              <div key={i} className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{warn.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Two-Way Code Editor with Line Numbers Gutter */}
      <div className="relative flex-1 flex overflow-hidden bg-[#0d1117]">
        {/* Line Numbers Gutter */}
        <div 
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 shrink-0 select-none overflow-hidden bg-[#090d13] py-4 text-right font-mono text-[11px] text-gray-600 border-r border-[#1e293b] leading-relaxed pr-2.5"
        >
          {lineNumbers.map(n => (
            <div key={n} className="leading-relaxed">{n}</div>
          ))}
        </div>

        {/* Textarea Code Editor */}
        <textarea
          ref={textareaRef}
          id="json-code-textarea"
          value={editorText}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder='{\n  "modes": [\n    ...\n  ]\n}'
          className="flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-blue-300 placeholder-gray-600 focus:outline-none selection:bg-blue-800 selection:text-white"
        />
      </div>

      {/* Editor Footer Help Strip */}
      <div className="flex items-center justify-between border-t border-[#1e293b] bg-[#161b22] px-3.5 py-1.5 text-[10px] text-gray-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Editable Code Block (2-Way Sync)</span>
          <span>•</span>
          <span>Tab: 2 spaces</span>
          <span>•</span>
          <span>Auto-sync: 300ms</span>
        </div>
        <div className="text-gray-400">
          JSON Schema v2.5
        </div>
      </div>
    </div>
  );
};
