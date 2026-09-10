import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Sliders, 
  ToggleLeft, 
  List, 
  Search, 
  Type, 
  AlignLeft, 
  Tag, 
  AlertCircle,
  Layers,
  Hash
} from 'lucide-react';
import { SchemaField, FieldType, FieldOption, ValueType } from '../../types';

interface FieldEditorProps {
  fields: SchemaField[];
  onChange: (updatedFields: SchemaField[]) => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ fields, onChange }) => {
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(fields[0]?.id || null);

  const addField = (presetType?: FieldType) => {
    const newId = `f_${Date.now().toString(36)}`;
    let newField: SchemaField = {
      id: newId,
      key: `field_${fields.length + 1}`,
      label: `New Field ${fields.length + 1}`,
      type: presetType || 'select',
      value_type: 'auto',
      required: true,
      default_value: '',
    };

    if (presetType === 'range_slider') {
      newField.key = 'risk_level';
      newField.label = 'Risk Level';
      newField.default_value = 5;
      newField.value_type = 'number';
      newField.slider_config = {
        min: 1,
        max: 10,
        step: 1,
        unit: '/10',
        min_label: 'Low',
        max_label: 'High'
      };
    } else if (presetType === 'number') {
      newField.key = 'limit';
      newField.label = 'Candles Limit';
      newField.default_value = 250;
      newField.value_type = 'number';
      newField.number_config = {
        min: 1,
        max: 1000,
        step: 1,
        unit: 'candles'
      };
    } else if (presetType === 'pills') {
      newField.key = 'timeframe';
      newField.label = 'Timeframe';
      newField.default_value = '15m';
      newField.options = [
        { id: `opt_${Date.now()}_1`, value: '5m', label: '5m' },
        { id: `opt_${Date.now()}_2`, value: '15m', label: '15m' },
        { id: `opt_${Date.now()}_3`, value: '1h', label: '1h' },
        { id: `opt_${Date.now()}_4`, value: '4h', label: '4h' }
      ];
    } else if (presetType === 'switch') {
      newField.key = 'enable_feature';
      newField.label = 'Enable Feature';
      newField.default_value = true;
    } else if (presetType === 'search_select') {
      newField.key = 'asset';
      newField.label = 'Asset / Pair';
      newField.default_value = 'BTC/USDT';
      newField.options = [
        { id: `opt_${Date.now()}_1`, value: 'BTC/USDT', label: 'Bitcoin (BTC)', symbol: 'BTC' },
        { id: `opt_${Date.now()}_2`, value: 'ETH/USDT', label: 'Ethereum (ETH)', symbol: 'ETH' },
        { id: `opt_${Date.now()}_3`, value: 'SOL/USDT', label: 'Solana (SOL)', symbol: 'SOL' }
      ];
    } else {
      newField.options = [
        { id: `opt_${Date.now()}_1`, value: 'option_1', label: 'Option 1' },
        { id: `opt_${Date.now()}_2`, value: 'option_2', label: 'Option 2' }
      ];
      newField.default_value = 'option_1';
    }

    const updated = [...fields, newField];
    onChange(updated);
    setExpandedFieldId(newId);
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    const updated = fields.map(f => f.id === id ? { ...f, ...updates } : f);
    onChange(updated);
  };

  const deleteField = (id: string) => {
    const updated = fields.filter(f => f.id !== id);
    onChange(updated);
  };

  const duplicateField = (field: SchemaField) => {
    const newId = `f_${Date.now().toString(36)}`;
    const cloned: SchemaField = {
      ...JSON.parse(JSON.stringify(field)),
      id: newId,
      key: `${field.key}_copy`,
      label: `${field.label} (Copy)`
    };
    const updated = [...fields, cloned];
    onChange(updated);
    setExpandedFieldId(newId);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...fields];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIndex, 0, item);
    onChange(copy);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const opts = field.options || [];
    const newOpt: FieldOption = {
      id: `opt_${Date.now().toString(36)}`,
      value: `value_${opts.length + 1}`,
      label: `Option ${opts.length + 1}`
    };
    updateField(fieldId, { options: [...opts, newOpt] });
  };

  const updateOption = (fieldId: string, optIdx: number, updates: Partial<FieldOption>) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    const opts = field.options.map((o, idx) => idx === optIdx ? { ...o, ...updates } : o);
    updateField(fieldId, { options: opts });
  };

  const deleteOption = (fieldId: string, optIdx: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    const opts = field.options.filter((_, idx) => idx !== optIdx);
    updateField(fieldId, { options: opts });
  };

  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'search_select': return <Search className="h-3.5 w-3.5 text-cyan-400" />;
      case 'pills': return <Tag className="h-3.5 w-3.5 text-blue-400" />;
      case 'select': return <List className="h-3.5 w-3.5 text-indigo-400" />;
      case 'range_slider': return <Sliders className="h-3.5 w-3.5 text-amber-400" />;
      case 'number': return <Hash className="h-3.5 w-3.5 text-cyan-400" />;
      case 'switch': return <ToggleLeft className="h-3.5 w-3.5 text-emerald-400" />;
      case 'text': return <Type className="h-3.5 w-3.5 text-purple-400" />;
      case 'textarea': return <AlignLeft className="h-3.5 w-3.5 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-blue-600/10 p-1.5 text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Mode Input Fields ({fields.length})
            </h3>
            <p className="text-[11px] text-gray-500">
              Define the inputs rendered for this mode and referenced in the prompt as <code className="text-blue-300 font-mono">{"{key}"}</code>
            </p>
          </div>
        </div>

        {/* Quick Add Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => addField('search_select')}
            className="flex items-center gap-1 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-2.5 py-1 text-[11px] font-medium text-gray-200 border border-[#334155] transition-colors"
          >
            <Search className="h-3 w-3 text-blue-400" />
            <span>+ Asset Select</span>
          </button>
          <button
            type="button"
            onClick={() => addField('pills')}
            className="flex items-center gap-1 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-2.5 py-1 text-[11px] font-medium text-gray-200 border border-[#334155] transition-colors"
          >
            <Tag className="h-3 w-3 text-blue-400" />
            <span>+ Pills (TF)</span>
          </button>
          <button
            type="button"
            onClick={() => addField('number')}
            className="flex items-center gap-1 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-2.5 py-1 text-[11px] font-medium text-gray-200 border border-[#334155] transition-colors"
          >
            <Hash className="h-3 w-3 text-cyan-400" />
            <span>+ Number</span>
          </button>
          <button
            type="button"
            onClick={() => addField('range_slider')}
            className="flex items-center gap-1 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-2.5 py-1 text-[11px] font-medium text-gray-200 border border-[#334155] transition-colors"
          >
            <Sliders className="h-3 w-3 text-amber-400" />
            <span>+ Slider</span>
          </button>
          <button
            type="button"
            onClick={() => addField('switch')}
            className="flex items-center gap-1 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-2.5 py-1 text-[11px] font-medium text-gray-200 border border-[#334155] transition-colors"
          >
            <ToggleLeft className="h-3 w-3 text-emerald-400" />
            <span>+ Switch</span>
          </button>
          <button
            type="button"
            onClick={() => addField('select')}
            className="flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1 text-[11px] font-semibold text-white transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Custom Field</span>
          </button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#1e293b] bg-[#0d1117] p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-2 text-xs font-semibold text-gray-400">No input fields added for this mode yet</p>
          <p className="text-[11px] text-gray-500">Click any preset above or "Add Custom Field" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => {
            const isExpanded = expandedFieldId === field.id;

            return (
              <div
                key={field.id}
                className={`rounded-lg border transition ${
                  isExpanded
                    ? 'border-blue-500/60 bg-[#0d1117] shadow-lg shadow-blue-950/20'
                    : 'border-[#1e293b] bg-[#0d1117] hover:border-[#334155]'
                }`}
              >
                {/* Field Header Summary Bar */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#161b22] text-[11px] font-bold text-gray-400 font-mono border border-[#1e293b]">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5 rounded-md bg-[#161b22] px-2 py-0.5 text-xs font-medium text-gray-300 border border-[#1e293b]">
                      {getFieldTypeIcon(field.type)}
                      <span className="capitalize">{field.type.replace('_', ' ')}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-blue-300">
                      {"{" + (field.key || 'key_missing') + "}"}
                    </span>
                    <span className="text-xs text-gray-400">
                      • {field.label || 'Untitled'}
                    </span>
                    {field.value_type && field.value_type !== 'auto' && (
                      <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-cyan-400 border border-cyan-500/30">
                        {field.value_type}
                      </span>
                    )}
                    {field.required && (
                      <span className="rounded bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveField(idx, 'up')}
                      className="rounded p-1 text-gray-400 hover:bg-[#161b22] hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => moveField(idx, 'down')}
                      className="rounded p-1 text-gray-400 hover:bg-[#161b22] hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateField(field)}
                      title="Duplicate Field"
                      className="rounded p-1 text-gray-400 hover:bg-[#161b22] hover:text-blue-400"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteField(field.id)}
                      title="Delete Field"
                      className="rounded p-1 text-gray-400 hover:bg-rose-950/50 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Field Editor Form */}
                {isExpanded && (
                  <div className="border-t border-[#1e293b] p-4 space-y-4 bg-[#161b22] rounded-b-lg">
                    {/* Row 1: Variable Key, Field Label, Field Type, JSON Output Type */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">
                          Variable Key in Prompt <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => updateField(field.id, { 
                            key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') 
                          })}
                          placeholder="e.g. timeframe, asset, risk"
                          className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 font-mono text-xs text-blue-300 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">
                          Field Label <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="e.g. Crypto Asset / Pair"
                          className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">
                          UI Component
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value as FieldType;
                            const updates: Partial<SchemaField> = { type: newType };
                            if (newType === 'range_slider' && !field.slider_config) {
                              updates.slider_config = { min: 1, max: 10, step: 1, unit: '/10' };
                              updates.default_value = 5;
                              updates.value_type = 'number';
                            }
                            if (newType === 'number' && !field.number_config) {
                              updates.number_config = { min: 1, step: 1 };
                              updates.default_value = typeof field.default_value === 'number' ? field.default_value : 100;
                              updates.value_type = 'number';
                            }
                            if (['select', 'pills', 'search_select'].includes(newType) && (!field.options || field.options.length === 0)) {
                              updates.options = [
                                { id: `opt_${Date.now()}_1`, value: 'opt1', label: 'Option 1' },
                                { id: `opt_${Date.now()}_2`, value: 'opt2', label: 'Option 2' }
                              ];
                              updates.default_value = 'opt1';
                            }
                            if (newType === 'switch') {
                              updates.default_value = true;
                              updates.value_type = 'boolean';
                            }
                            updateField(field.id, updates);
                          }}
                          className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="search_select">🔍 Search Select (Asset / Icon)</option>
                          <option value="pills">🏷️ Pills (Horizontal Buttons)</option>
                          <option value="select">📋 Standard Select Dropdown</option>
                          <option value="number">🔢 Number Input (Integer / Float)</option>
                          <option value="range_slider">🎚️ Range Slider (Min / Max / Step)</option>
                          <option value="switch">🔘 Boolean Switch (Toggle)</option>
                          <option value="text">✏️ Text (Single line)</option>
                          <option value="textarea">📝 Textarea (Multi-line)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-gray-300">
                            JSON Data Type
                          </label>
                          <span className="text-[9px] text-gray-500 font-mono">n8n type</span>
                        </div>
                        <select
                          value={field.value_type || 'auto'}
                          onChange={(e) => updateField(field.id, { value_type: e.target.value as ValueType })}
                          className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="auto">⚡ Auto (Smart: "250" → 250)</option>
                          <option value="number">🔢 Number (Pure number)</option>
                          <option value="string">🔤 String (Text only)</option>
                          <option value="boolean">🔘 Boolean (true/false)</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Default Value, Required Checkbox, Description/Helper, Placeholder */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">
                          Default Value
                        </label>
                        {field.type === 'switch' ? (
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => updateField(field.id, { default_value: !field.default_value })}
                              className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold ${
                                field.default_value
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0d1117] text-gray-400 border border-[#1e293b]'
                              }`}
                            >
                              <ToggleLeft className="h-4 w-4" />
                              <span>{field.default_value ? 'Enabled (True)' : 'Disabled (False)'}</span>
                            </button>
                          </div>
                        ) : field.type === 'range_slider' ? (
                          <input
                            type="number"
                            value={field.default_value ?? 0}
                            onChange={(e) => updateField(field.id, { default_value: Number(e.target.value) })}
                            className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                          />
                        ) : field.type === 'number' ? (
                          <input
                            type="number"
                            value={field.default_value ?? ''}
                            onChange={(e) => updateField(field.id, { 
                              default_value: e.target.value === '' ? '' : Number(e.target.value) 
                            })}
                            placeholder="e.g. 250"
                            className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none font-mono"
                          />
                        ) : (
                          <input
                            type="text"
                            value={field.default_value ?? ''}
                            onChange={(e) => updateField(field.id, { default_value: e.target.value })}
                            placeholder="Default value"
                            className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                          />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-gray-300">
                          Helper / Description
                        </label>
                        <input
                          type="text"
                          value={field.description || ''}
                          onChange={(e) => updateField(field.id, { description: e.target.value })}
                          placeholder="Optional helper text below input..."
                          className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-5">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="h-4 w-4 rounded border-[#1e293b] bg-[#0d1117] text-blue-600 focus:ring-blue-500"
                          />
                          <span>Required Input</span>
                        </label>
                      </div>
                    </div>

                    {/* Specific Config: Range Slider */}
                    {field.type === 'range_slider' && (
                      <div className="rounded-md border border-[#1e293b] bg-[#0d1117] p-3">
                        <div className="mb-2 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5" />
                          <span>Slider Parameters</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div>
                            <label className="text-[10px] text-gray-400">Min</label>
                            <input
                              type="number"
                              value={field.slider_config?.min ?? 1}
                              onChange={(e) => updateField(field.id, {
                                slider_config: {
                                  ...field.slider_config!,
                                  min: Number(e.target.value)
                                }
                              })}
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Max</label>
                            <input
                              type="number"
                              value={field.slider_config?.max ?? 10}
                              onChange={(e) => updateField(field.id, {
                                slider_config: {
                                  ...field.slider_config!,
                                  max: Number(e.target.value)
                                }
                              })}
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Step</label>
                            <input
                              type="number"
                              value={field.slider_config?.step ?? 1}
                              onChange={(e) => updateField(field.id, {
                                slider_config: {
                                  ...field.slider_config!,
                                  step: Number(e.target.value)
                                }
                              })}
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Unit / Suffix</label>
                            <input
                              type="text"
                              value={field.slider_config?.unit ?? ''}
                              onChange={(e) => updateField(field.id, {
                                slider_config: {
                                  ...field.slider_config!,
                                  unit: e.target.value
                                }
                              })}
                              placeholder="e.g. %, /10, pips"
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specific Config: Number Input */}
                    {field.type === 'number' && (
                      <div className="rounded-md border border-[#1e293b] bg-[#0d1117] p-3">
                        <div className="mb-2 text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5" />
                          <span>Number Input Parameters</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div>
                            <label className="text-[10px] text-gray-400">Min</label>
                            <input
                              type="number"
                              value={field.number_config?.min ?? ''}
                              onChange={(e) => updateField(field.id, {
                                number_config: {
                                  ...field.number_config,
                                  min: e.target.value === '' ? undefined : Number(e.target.value)
                                }
                              })}
                              placeholder="Optional"
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Max</label>
                            <input
                              type="number"
                              value={field.number_config?.max ?? ''}
                              onChange={(e) => updateField(field.id, {
                                number_config: {
                                  ...field.number_config,
                                  max: e.target.value === '' ? undefined : Number(e.target.value)
                                }
                              })}
                              placeholder="Optional"
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Step</label>
                            <input
                              type="number"
                              value={field.number_config?.step ?? ''}
                              onChange={(e) => updateField(field.id, {
                                number_config: {
                                  ...field.number_config,
                                  step: e.target.value === '' ? undefined : Number(e.target.value)
                                }
                              })}
                              placeholder="1, 0.1, etc."
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400">Unit / Suffix</label>
                            <input
                              type="text"
                              value={field.number_config?.unit ?? ''}
                              onChange={(e) => updateField(field.id, {
                                number_config: {
                                  ...field.number_config,
                                  unit: e.target.value
                                }
                              })}
                              placeholder="e.g. USDT, candles, x"
                              className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specific Config: Options Manager for select, pills, search_select */}
                    {['select', 'pills', 'search_select'].includes(field.type) && (
                      <div className="rounded-md border border-[#1e293b] bg-[#0d1117] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5" />
                            <span>Selectable Options ({field.options?.length || 0})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => addOption(field.id)}
                            className="flex items-center gap-1 rounded bg-blue-600 hover:bg-blue-700 px-2 py-0.5 text-[11px] font-semibold text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Option</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(field.options || []).map((opt, optIdx) => (
                            <div
                              key={opt.id || opt.value || optIdx}
                              className="flex flex-wrap items-center gap-2 rounded-md border border-[#1e293b] bg-[#161b22] p-2 text-xs"
                            >
                              <span className="font-mono text-[10px] text-gray-500">{optIdx + 1}.</span>
                              {/* Option Value */}
                              <div className="w-28 flex-1 sm:w-auto">
                                <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Value</label>
                                <input
                                  type="text"
                                  value={opt.value ?? ''}
                                  onChange={(e) => updateOption(field.id, optIdx, { value: e.target.value })}
                                  placeholder="e.g. BTC/USDT"
                                  className="w-full rounded border border-[#1e293b] bg-[#0d1117] px-2 py-1 font-mono text-[11px] text-blue-300"
                                />
                              </div>
                              {/* Option Label */}
                              <div className="w-48 flex-2 sm:w-auto">
                                <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Display Label</label>
                                <input
                                  type="text"
                                  value={typeof opt.label === 'string' ? opt.label : (opt.label ? ((opt.label as any).en || (opt.label as any).fa || '') : '')}
                                  onChange={(e) => updateOption(field.id, optIdx, { label: e.target.value })}
                                  placeholder="e.g. Bitcoin (BTC)"
                                  className="w-full rounded border border-[#1e293b] bg-[#0d1117] px-2 py-1 text-[11px] text-white"
                                />
                              </div>
                              {/* Symbol / Coin Badge */}
                              {field.type === 'search_select' && (
                                <div className="w-20">
                                  <label className="text-[9px] uppercase tracking-wider text-gray-500 block">Symbol</label>
                                  <input
                                    type="text"
                                    value={opt.symbol || ''}
                                    onChange={(e) => updateOption(field.id, optIdx, { symbol: e.target.value.toUpperCase() })}
                                    placeholder="BTC"
                                    className="w-full rounded border border-[#1e293b] bg-[#0d1117] px-2 py-1 text-[11px] font-bold text-amber-300 uppercase"
                                  />
                                </div>
                              )}
                              <div className="pt-3">
                                <button
                                  type="button"
                                  onClick={() => deleteOption(field.id, optIdx)}
                                  className="rounded p-1 text-gray-500 hover:bg-rose-950/40 hover:text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

