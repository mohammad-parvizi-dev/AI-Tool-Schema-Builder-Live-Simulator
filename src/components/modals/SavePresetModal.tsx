import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  BookmarkPlus, 
  RefreshCw, 
  FolderHeart, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Copy,
  Edit2
} from 'lucide-react';
import { CustomPreset, ActivePresetMeta } from '../../types';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetMeta: ActivePresetMeta;
  customPresets: CustomPreset[];
  onUpdatePreset: (presetId: string, newName?: string) => void;
  onSaveNewPreset: (name: string) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  isOpen,
  onClose,
  activePresetMeta,
  customPresets,
  onUpdatePreset,
  onSaveNewPreset
}) => {
  const activeCustomPreset = customPresets.find(p => p.id === activePresetMeta.id);
  const isEditingExistingCustom = Boolean(activePresetMeta.isCustom && activeCustomPreset);

  // States
  const [updateName, setUpdateName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedOverwriteId, setSelectedOverwriteId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'update' | 'new' | 'overwrite_other'>('update');

  useEffect(() => {
    if (isOpen) {
      if (isEditingExistingCustom && activeCustomPreset) {
        setUpdateName(activeCustomPreset.name);
        setNewPresetName(`${activeCustomPreset.name} (Copy)`);
        setActiveTab('update');
      } else {
        setNewPresetName(
          activePresetMeta.name && activePresetMeta.name !== 'Blank Template' 
            ? `${activePresetMeta.name} (Custom)` 
            : 'My Trading AI Tool'
        );
        setActiveTab('new');
      }
      setIsRenaming(false);
      setSelectedOverwriteId(customPresets[0]?.id || '');
    }
  }, [isOpen, isEditingExistingCustom, activeCustomPreset, activePresetMeta, customPresets]);

  if (!isOpen) return null;

  const handleUpdateActive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomPreset) return;
    const finalName = updateName.trim() || activeCustomPreset.name;
    onUpdatePreset(activeCustomPreset.id, finalName !== activeCustomPreset.name ? finalName : undefined);
    onClose();
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveNewPreset(newPresetName.trim());
    onClose();
  };

  const handleOverwriteOther = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOverwriteId) return;
    const target = customPresets.find(p => p.id === selectedOverwriteId);
    if (!target) return;
    onUpdatePreset(target.id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="save-preset-modal"
        className="w-full max-w-lg rounded-xl border border-[#1e293b] bg-[#161b22] text-gray-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] px-5 py-3.5 bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Save className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Save Preset</h3>
              <p className="text-[11px] text-gray-400">
                {isEditingExistingCustom 
                  ? `Active Preset: "${activeCustomPreset?.name}"` 
                  : `Template: "${activePresetMeta.name}"`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1e293b] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Case 1: An existing custom preset is currently loaded */}
          {isEditingExistingCustom && activeCustomPreset ? (
            <div className="space-y-4">
              {/* Option A: Overwrite Active Preset (Primary) */}
              <div className="rounded-lg border-2 border-emerald-500/40 bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-300">
                        Overwrite & Update Active Preset
                      </h4>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        Saves your current changes directly into{' '}
                        <strong className="text-white">"{activeCustomPreset.name}"</strong> in LocalStorage.
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Recommended
                  </span>
                </div>

                {isRenaming ? (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-medium text-gray-300">Preset Name:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={updateName}
                        onChange={(e) => setUpdateName(e.target.value)}
                        className="flex-1 rounded-md border border-[#1e293b] bg-[#0d1117] px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsRenaming(false)}
                        className="text-xs text-gray-400 hover:text-white px-2"
                      >
                        Keep original
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-gray-400 bg-[#0d1117] px-3 py-1.5 rounded border border-[#1e293b]">
                    <span className="truncate font-medium text-white">{activeCustomPreset.name}</span>
                    <button
                      type="button"
                      onClick={() => setIsRenaming(true)}
                      className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Rename</span>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  id="btn-confirm-overwrite-preset"
                  onClick={handleUpdateActive}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[0.99]"
                >
                  <Save className="h-4 w-4" />
                  <span>Update & Overwrite "{activeCustomPreset.name}"</span>
                </button>
              </div>

              {/* Option B: Save as New Preset */}
              <div className="rounded-lg border border-[#1e293b] bg-[#0d1117] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-blue-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Save as a New Preset</h4>
                    <p className="text-[11px] text-gray-400">
                      Keep "{activeCustomPreset.name}" intact and create a new separate copy.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveNew} className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-300">New Preset Name:</label>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g. My Custom Trend Bot"
                      className="w-full rounded-md border border-[#1e293b] bg-[#161b22] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newPresetName.trim()}
                    id="btn-confirm-save-new-preset"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1e293b] hover:bg-[#2d3748] border border-[#334155] py-2 text-xs font-bold text-gray-200 transition disabled:opacity-40"
                  >
                    <BookmarkPlus className="h-4 w-4 text-blue-400" />
                    <span>Save as New Preset</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Case 2: Editing a Built-in Preset or new blank schema */
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-950/20 border border-blue-500/30 p-3 text-xs text-blue-200 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  You are editing <strong className="text-white">"{activePresetMeta.name}"</strong>. Save your modifications into your custom presets library to easily reload or update them later.
                </p>
              </div>

              {/* Form to Save as New Custom Preset */}
              <form onSubmit={handleSaveNew} className="rounded-lg border border-[#1e293b] bg-[#0d1117] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BookmarkPlus className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">Save as Custom Preset</h4>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-300">Preset Name:</label>
                  <input
                    type="text"
                    autoFocus
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g. My Crypto Arbitrage Bot"
                    className="w-full rounded-md border border-[#1e293b] bg-[#161b22] px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  id="btn-confirm-save-new-from-builtin"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-40"
                >
                  <Save className="h-4 w-4" />
                  <span>Save to My Presets</span>
                </button>
              </form>

              {/* Option to overwrite an existing custom preset if any exist */}
              {customPresets.length > 0 && (
                <form onSubmit={handleOverwriteOther} className="rounded-lg border border-[#1e293b] bg-[#0d1117] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Or Overwrite an Existing Preset</h4>
                      <p className="text-[11px] text-gray-400">
                        Replace one of your previously saved presets with this current schema.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <select
                      value={selectedOverwriteId}
                      onChange={(e) => setSelectedOverwriteId(e.target.value)}
                      className="w-full rounded-md border border-[#1e293b] bg-[#161b22] px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {customPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.schema.modes?.length || 0} modes)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    id="btn-confirm-overwrite-selected"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1e293b] hover:bg-[#2d3748] border border-[#334155] py-2 text-xs font-bold text-amber-300 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Overwrite Selected Preset</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-[#1e293b] bg-[#0d1117] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3.5 py-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
