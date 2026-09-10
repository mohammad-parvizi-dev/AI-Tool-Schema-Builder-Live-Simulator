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
  Plus,
  Save,
  RefreshCw,
  Check
} from 'lucide-react';
import { RootToolSchema, ValidationError, CustomPreset, ActivePresetMeta } from '../types';
import { defaultBuiltinPresets } from '../data/presets';
import { SavePresetModal } from './modals/SavePresetModal';

interface HeaderProps {
  schema: RootToolSchema;
  validationErrors: ValidationError[];
  customPresets: CustomPreset[];
  activePresetMeta: ActivePresetMeta;
  onLoadPreset: (presetSchema: RootToolSchema, presetName?: string, presetId?: string, isCustom?: boolean) => void;
  onUpdateCustomPreset: (presetId: string, newName?: string) => void;
  onSaveNewCustomPreset: (name: string) => void;
  onDeleteCustomPreset: (id: string) => void;
  onReset: () => void;
  onOpenImportPresets: () => void;
  onOpenExportPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  schema,
  validationErrors,
  customPresets,
  activePresetMeta,
  onLoadPreset,
  onUpdateCustomPreset,
  onSaveNewCustomPreset,
  onDeleteCustomPreset,
  onReset,
  onOpenImportPresets,
  onOpenExportPresets
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const totalFields = (schema.modes || []).reduce((acc, m) => acc + (m.fields?.length || 0), 0);

  const activeCustomPreset = customPresets.find(p => p.id === activePresetMeta.id);
  const isCustomActive = Boolean(activePresetMeta.isCustom && activeCustomPreset);

  const handleQuickSave = () => {
    if (isCustomActive && activeCustomPreset) {
      onUpdateCustomPreset(activeCustomPreset.id);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2200);
    } else {
      setIsSaveModalOpen(true);
    }
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

        {/* Center: Validation Status Chip & Active Preset Indicator */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Active Preset Tag */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#161b22] px-3 py-1 text-xs border border-[#1e293b]">
            <span className="text-gray-400 text-[11px]">Preset:</span>
            <span className="font-semibold text-white truncate max-w-[190px]">
              {activePresetMeta.name}
            </span>
            {isCustomActive ? (
              <span className="rounded bg-cyan-950/60 px-1.5 py-0.2 text-[9px] font-mono text-cyan-400 border border-cyan-500/30">
                Custom
              </span>
            ) : (
              <span className="rounded bg-gray-800 px-1.5 py-0.2 text-[9px] font-mono text-gray-400">
                Built-in
              </span>
            )}
          </div>

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
                className="absolute right-0 mt-2 w-84 rounded-xl border border-[#1e293b] bg-[#161b22] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto"
              >
                {/* Built-in Presets Header */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Built-in Official Presets
                </div>

                <div className="space-y-1">
                  {defaultBuiltinPresets.map((preset) => {
                    const isSelected = !activePresetMeta.isCustom && activePresetMeta.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onLoadPreset(preset.schema, preset.name, preset.id, false);
                          setShowPresetsMenu(false);
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition ${
                          isSelected ? 'bg-blue-600/20 border border-blue-500/30 text-white' : 'hover:bg-[#1e293b] text-gray-200'
                        }`}
                      >
                        <span className="mt-0.5 text-base">{preset.icon || '⚡'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white flex items-center justify-between">
                            <span className="truncate">{preset.name}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">{preset.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Saved Presets Section */}
                <div className="my-2 border-t border-[#1e293b] pt-2">
                  <div className="flex items-center justify-between px-2 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <FolderHeart className="h-3 w-3" />
                      <span>My Saved Presets ({customPresets.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPresetsMenu(false);
                        setIsSaveModalOpen(true);
                      }}
                      className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Save Current</span>
                    </button>
                  </div>

                  {/* Active Custom Preset Quick Update banner inside dropdown */}
                  {isCustomActive && activeCustomPreset && (
                    <div className="mx-1 mb-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase">Active Preset:</div>
                        <div className="text-xs font-semibold text-white truncate">"{activeCustomPreset.name}"</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCustomPreset(activeCustomPreset.id);
                          setShowPresetsMenu(false);
                        }}
                        className="flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white shadow-sm transition shrink-0"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}

                  {customPresets.length === 0 ? (
                    <div className="px-2 py-2 text-[11px] text-gray-500 italic">
                      No custom presets saved yet. Click "Save Current" to store your schema to LocalStorage.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {customPresets.map((preset) => {
                        const isCurrentActive = activePresetMeta.id === preset.id;
                        return (
                          <div
                            key={preset.id}
                            className={`group flex items-center justify-between gap-2 rounded-lg p-2 transition ${
                              isCurrentActive 
                                ? 'bg-cyan-950/30 border border-cyan-500/30 text-white' 
                                : 'hover:bg-[#1e293b] text-gray-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onLoadPreset(preset.schema, preset.name, preset.id, true);
                                setShowPresetsMenu(false);
                              }}
                              className="flex-1 text-left min-w-0"
                            >
                              <div className="font-semibold text-white text-xs flex items-center gap-1.5 truncate">
                                <span className="truncate">{preset.name}</span>
                                {isCurrentActive && (
                                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/30 shrink-0">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-gray-400">
                                {preset.schema.modes?.length || 0} modes • {new Date(preset.updated_at || preset.created_at || '').toLocaleDateString()}
                              </div>
                            </button>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title={`Overwrite "${preset.name}" with current schema changes`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Overwrite "${preset.name}" with current workspace schema?`)) {
                                    onUpdateCustomPreset(preset.id);
                                    setShowPresetsMenu(false);
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-emerald-400 opacity-70 group-hover:opacity-100 transition"
                              >
                                <Save className="h-3.5 w-3.5" />
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
                          </div>
                        );
                      })}
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

          {/* Quick Save Custom Preset Button: Direct In-place Overwrite vs Modal */}
          {isCustomActive && activeCustomPreset ? (
            <div className="inline-flex items-center rounded-md shadow-sm">
              <button
                type="button"
                id="quick-save-preset-btn"
                onClick={handleQuickSave}
                title={`Directly overwrite & save changes to "${activeCustomPreset.name}"`}
                className={`flex items-center gap-1.5 rounded-l-md px-3 py-1.5 text-xs font-semibold border transition-all ${
                  justSaved
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {justSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Save</span>
                  </>
                )}
              </button>
              <button
                type="button"
                id="save-as-preset-btn"
                onClick={() => setIsSaveModalOpen(true)}
                title="Save As / More Options..."
                className="rounded-r-md border-y border-r border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/70 px-2 py-1.5 text-xs text-emerald-300 transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="quick-save-preset-btn"
              onClick={() => setIsSaveModalOpen(true)}
              title="Save current schema to Custom Presets"
              className="flex items-center gap-1.5 rounded-md bg-[#1e293b] hover:bg-[#2d3748] px-3 py-1.5 text-xs font-semibold text-gray-200 border border-[#334155] transition-colors"
            >
              <BookmarkPlus className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Save Preset</span>
            </button>
          )}

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

      {/* Save Preset Dialog Modal */}
      <SavePresetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        activePresetMeta={activePresetMeta}
        customPresets={customPresets}
        onUpdatePreset={onUpdateCustomPreset}
        onSaveNewPreset={onSaveNewCustomPreset}
      />
    </header>
  );
};

