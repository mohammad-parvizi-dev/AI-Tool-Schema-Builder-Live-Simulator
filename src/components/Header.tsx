import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown,
  BookmarkPlus,
  Trash2,
  FolderHeart,
  Plus
} from 'lucide-react';
import { RootToolSchema, ValidationError, CustomPreset } from '../types';
import { defaultBuiltinPresets } from '../data/presets';

interface HeaderProps {
  schema: RootToolSchema;
  validationErrors: ValidationError[];
  customPresets: CustomPreset[];
  onLoadPreset: (presetSchema: RootToolSchema, presetName?: string) => void;
  onSaveCustomPreset: (name: string) => void;
  onDeleteCustomPreset: (id: string) => void;
  onReset: () => void;
  onOpenImportPresets: () => void;
  onOpenExportPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schema,
  validationErrors,
  customPresets,
  onLoadPreset,
  onSaveCustomPreset,
  onDeleteCustomPreset,
  onReset,
  onOpenImportPresets,
  onOpenExportPresets
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const totalFields = (schema.modes || []).reduce((acc, m) => acc + (m.fields?.length || 0), 0);

  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveCustomPreset(newPresetName.trim());
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#1e293b] bg-[#0d1117] px-4 sm:px-6 flex items-center justify-between shrink-0">
      <div className="mx-auto flex w-full max-w-full items-center justify-between gap-3">
        {/* Logo & App Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Trade Zone <span className="text-blue-500 font-medium">Schema Builder</span>
              </h1>
              <span className="hidden rounded-md bg-[#161b22] border border-[#1e293b] px-2 py-0.5 text-[11px] font-semibold text-blue-400 sm:inline-block">
                v2.5
              </span>
            </div>
          </div>
        </div>

        {/* Center: Validation Status Chip */}
        <div className="hidden lg:flex items-center gap-2">
          {errorCount === 0 ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Valid Schema ({(schema.modes || []).length} Modes • {totalFields} Fields)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-rose-950/40 px-3 py-1 text-xs font-medium text-rose-300 border border-rose-500/30">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>{errorCount} Schema {errorCount === 1 ? 'Error' : 'Errors'}</span>
            </div>
          )}

          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-300 border border-amber-500/30">
              <span>{warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}</span>
            </div>
          )}
        </div>

        {/* Right Actions & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              id="preset-dropdown-btn"
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="flex items-center gap-2 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-3.5 py-1.5 text-xs font-semibold text-gray-200 border border-[#334155] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Presets & Library</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>

            {showPresetsMenu && (
              <div 
                id="preset-menu"
                className="absolute right-0 mt-2 w-80 rounded-xl border border-[#1e293b] bg-[#161b22] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto"
              >
                {/* Built-in Presets Header */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Built-in Official Presets
                </div>

                <div className="space-y-1">
                  {defaultBuiltinPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onLoadPreset(preset.schema, preset.name);
                        setShowPresetsMenu(false);
                      }}
                      className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition hover:bg-[#1e293b] text-gray-200"
                    >
                      <span className="mt-0.5 text-base">{preset.icon || '⚡'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{preset.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{preset.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Saved Presets Section */}
                <div className="my-2 border-t border-[#1e293b] pt-2">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <FolderHeart className="h-3 w-3" />
                      <span>My Saved Presets ({customPresets.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSavingPreset(true)}
                      className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Save Current</span>
                    </button>
                  </div>

                  {/* Inline Save Form */}
                  {isSavingPreset && (
                    <form onSubmit={handleSavePresetSubmit} className="p-2 mb-2 rounded-lg bg-[#0d1117] border border-[#1e293b] space-y-2">
                      <label className="text-[11px] font-semibold text-gray-300 block">
                        Preset Name:
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="e.g. My Crypto Arbitrage Bot"
                        className="w-full rounded border border-[#1e293b] bg-[#161b22] px-2.5 py-1 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsSavingPreset(false)}
                          className="px-2 py-1 text-[10px] text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {customPresets.length === 0 ? (
                    <div className="px-2 py-2 text-[11px] text-gray-500 italic">
                      No custom presets saved yet. Click "Save Current" to store your schema to LocalStorage.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {customPresets.map((preset) => (
                        <div
                          key={preset.id}
                          className="group flex items-center justify-between gap-2 rounded-lg p-2 transition hover:bg-[#1e293b] text-gray-200"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onLoadPreset(preset.schema, preset.name);
                              setShowPresetsMenu(false);
                            }}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className="font-semibold text-white text-xs truncate">{preset.name}</div>
                            <div className="text-[10px] font-mono text-gray-400">
                              {preset.schema.modes?.length || 0} modes • {new Date(preset.created_at).toLocaleDateString()}
                            </div>
                          </button>
                          <button
                            type="button"
                            title="Delete Preset"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete custom preset "${preset.name}"?`)) {
                                onDeleteCustomPreset(preset.id);
                              }
                            }}
                            className="p-1 text-gray-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                  {/* Presets Backup & Restore Section inside Menu */}
                  <div className="my-2 border-t border-[#1e293b] pt-2 space-y-1">
                    <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Backup & Restore
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPresetsMenu(false);
                          onOpenImportPresets();
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0d1117] hover:bg-[#1e293b] p-2 text-xs text-gray-200 border border-[#1e293b] transition"
                      >
                        <Upload className="h-3.5 w-3.5 text-blue-400" />
                        <span>Import</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPresetsMenu(false);
                          onOpenExportPresets();
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0d1117] hover:bg-[#1e293b] p-2 text-xs text-gray-200 border border-[#1e293b] transition"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Reset Section */}
                  <div className="my-1 border-t border-[#1e293b]" />
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to reset to a clean blank schema?')) {
                        onReset();
                        setShowPresetsMenu(false);
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs text-rose-400 transition hover:bg-rose-950/40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset to Blank Template</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Save Custom Preset Button */}
            <button
              type="button"
              id="quick-save-preset-btn"
              onClick={() => {
                const name = prompt('Enter a name for this custom preset:', 'My Trading AI Tool');
                if (name && name.trim()) {
                  onSaveCustomPreset(name.trim());
                }
              }}
              title="Save current schema to Custom Presets"
              className="flex items-center gap-1.5 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-3 py-1.5 text-xs font-semibold text-gray-200 border border-[#334155] transition-colors"
            >
              <BookmarkPlus className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Save Preset</span>
            </button>

            {/* Import Presets Button */}
            <button
              type="button"
              id="import-presets-btn"
              onClick={onOpenImportPresets}
              title="Import and restore presets from backup file"
              className="flex items-center gap-1.5 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-3 py-1.5 text-xs font-semibold text-gray-200 border border-[#334155] transition-colors"
            >
              <Upload className="h-3.5 w-3.5 text-blue-400" />
              <span>Import Presets</span>
            </button>

            {/* Export Presets Button */}
            <button
              type="button"
              id="export-presets-btn"
              onClick={onOpenExportPresets}
              title="Export all presets backup JSON"
              className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Presets</span>
            </button>
          </div>
        </div>
      </header>
    );
  };

