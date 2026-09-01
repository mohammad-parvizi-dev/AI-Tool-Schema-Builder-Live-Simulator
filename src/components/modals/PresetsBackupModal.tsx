import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  FolderHeart, 
  Copy, 
  Check, 
  Sparkles, 
  Trash2, 
  Layers, 
  RotateCcw,
  Package,
  HardDrive
} from 'lucide-react';
import { RootToolSchema, CustomPreset, PresetsBackup } from '../../types';
import { defaultBuiltinPresets } from '../../data/presets';

interface PresetsBackupModalProps {
  isOpen: boolean;
  initialTab?: 'import' | 'export';
  customPresets: CustomPreset[];
  activeSchema: RootToolSchema;
  onClose: () => void;
  onImportPresets: (importedPresets: CustomPreset[], mode: 'merge' | 'replace') => void;
  onLoadPresetDirectly: (presetSchema: RootToolSchema, presetName: string) => void;
  onDeleteCustomPreset: (id: string) => void;
}

export const PresetsBackupModal: React.FC<PresetsBackupModalProps> = ({
  isOpen,
  initialTab = 'import',
  customPresets,
  activeSchema,
  onClose,
  onImportPresets,
  onLoadPresetDirectly,
  onDeleteCustomPreset
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [includeBuiltins, setIncludeBuiltins] = useState(false);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
      setSuccessInfo(null);
      setJsonText('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Generate complete Presets Backup object
  const getPresetsBackupObject = (): PresetsBackup => {
    const listToExport: CustomPreset[] = includeBuiltins
      ? [
          ...customPresets,
          ...defaultBuiltinPresets.map(p => ({
            id: `builtin_${p.id}`,
            name: `[Official] ${p.name}`,
            description: p.description,
            icon: p.icon,
            created_at: new Date().toISOString(),
            schema: p.schema
          }))
        ]
      : customPresets.length > 0 
        ? customPresets 
        : [
            // If user has no custom presets saved, offer saving the active current schema
            {
              id: `preset_active_${Date.now().toString(36)}`,
              name: 'Current Workspace Schema',
              description: 'Active schema snapshot',
              created_at: new Date().toISOString(),
              schema: activeSchema
            }
          ];

    return {
      version: '2.5',
      backup_date: new Date().toISOString(),
      presets: listToExport
    };
  };

  const backupObject = getPresetsBackupObject();
  const backupJsonString = JSON.stringify(backupObject, null, 2);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setJsonText(text);
        setError(null);
        setSuccessInfo(`Loaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      } catch {
        setError('Failed to read selected file.');
      }
    };
    reader.readAsText(file);
  };

  // Parse and validate imported presets
  const handleExecuteImport = () => {
    try {
      if (!jsonText.trim()) {
        setError('Please paste presets backup JSON or select a backup file.');
        return;
      }

      const parsed = JSON.parse(jsonText);
      let extractedPresets: CustomPreset[] = [];

      // Case 1: Standard Presets Backup bundle { version: '...', presets: [...] }
      if (parsed && Array.isArray(parsed.presets)) {
        extractedPresets = parsed.presets.map((p: any, idx: number) => ({
          id: p.id || `preset_${Date.now()}_${idx}`,
          name: p.name || `Imported Preset ${idx + 1}`,
          description: p.description || '',
          icon: p.icon || '⚡',
          created_at: p.created_at || new Date().toISOString(),
          schema: p.schema && Array.isArray(p.schema.modes) ? p.schema : { modes: Array.isArray(p.modes) ? p.modes : [] }
        }));
      }
      // Case 2: Array of preset items [{ id, name, schema }, ...]
      else if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].schema || parsed[0].modes)) {
        extractedPresets = parsed.map((p: any, idx: number) => {
          if (p.schema && Array.isArray(p.schema.modes)) {
            return {
              id: p.id || `preset_${Date.now()}_${idx}`,
              name: p.name || `Imported Preset ${idx + 1}`,
              description: p.description || '',
              icon: p.icon || '⚡',
              created_at: p.created_at || new Date().toISOString(),
              schema: p.schema
            };
          } else if (Array.isArray(p.modes)) {
            return {
              id: `preset_${Date.now()}_${idx}`,
              name: p.name || `Imported Tool ${idx + 1}`,
              description: p.description || '',
              icon: '⚡',
              created_at: new Date().toISOString(),
              schema: { modes: p.modes }
            };
          }
          return null;
        }).filter(Boolean) as CustomPreset[];
      }
      // Case 3: Single Tool Schema { modes: [...] }
      else if (parsed && Array.isArray(parsed.modes)) {
        extractedPresets = [
          {
            id: `preset_single_${Date.now()}`,
            name: parsed.modes[0]?.title?.en || parsed.modes[0]?.title || 'Imported Tool Preset',
            description: parsed.modes[0]?.description?.en || parsed.modes[0]?.description || 'Imported single schema',
            icon: '⚡',
            created_at: new Date().toISOString(),
            schema: { modes: parsed.modes }
          }
        ];
      } else {
        setError('Unrecognized format: JSON must be a Presets Backup file, an array of presets, or a tool schema with "modes".');
        return;
      }

      if (extractedPresets.length === 0) {
        setError('No valid presets could be found in the provided JSON.');
        return;
      }

      onImportPresets(extractedPresets, importMode);
      onClose();
    } catch (err: any) {
      setError(`JSON Parsing Error: ${err.message}`);
    }
  };

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(backupJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([backupJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `trade_zone_presets_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-xl border border-[#1e293b] bg-[#161b22] shadow-2xl overflow-hidden">
        
        {/* Header & Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] bg-[#0d1117] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <FolderHeart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Presets Library Backup & Restore</span>
                <span className="rounded bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                  v2.5
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Backup, export, and restore your custom AI Tool schemas and presets across devices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center rounded-lg bg-[#161b22] p-1 border border-[#1e293b]">
              <button
                type="button"
                id="btn-tab-import-presets"
                onClick={() => {
                  setActiveTab('import');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'import'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import / Restore</span>
              </button>

              <button
                type="button"
                id="btn-tab-export-presets"
                onClick={() => {
                  setActiveTab('export');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'export'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export / Backup</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-[#1e293b] hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: IMPORT / RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Import Instructions & Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0d1117] border border-[#1e293b] p-3.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Select import strategy for incoming presets:</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 cursor-pointer rounded px-2.5 py-1 border transition text-xs font-semibold ${
                    importMode === 'merge'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                      : 'bg-[#161b22] text-gray-400 border-[#1e293b]'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="hidden"
                    />
                    <span>Merge (Add to existing)</span>
                  </label>

                  <label className={`flex items-center gap-1.5 cursor-pointer rounded px-2.5 py-1 border transition text-xs font-semibold ${
                    importMode === 'replace'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                      : 'bg-[#161b22] text-gray-400 border-[#1e293b]'
                  }`}>
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="hidden"
                    />
                    <span>Overwrite / Replace All</span>
                  </label>
                </div>
              </div>

              {/* File upload drag drop zone */}
              <div className="rounded-lg border border-dashed border-[#1e293b] hover:border-blue-500/50 bg-[#0d1117] p-5 text-center transition">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  id="presets-file-upload-input"
                  className="hidden"
                />
                <label
                  htmlFor="presets-file-upload-input"
                  className="cursor-pointer flex flex-col items-center gap-2 text-xs text-gray-300 hover:text-blue-400"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#161b22] border border-[#1e293b] text-blue-400">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-white">Upload Presets Backup File</span>
                  <span className="text-gray-500">Select <code className="text-blue-400 font-mono">trade_zone_presets_backup.json</code> or any preset JSON file</span>
                </label>
              </div>

              {/* Textarea Paste */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Or Paste Presets Backup JSON:
                </label>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setError(null);
                  }}
                  placeholder='{\n  "version": "2.5",\n  "backup_date": "2026-09-01T...",\n  "presets": [\n    {\n      "id": "custom_1",\n      "name": "My Scalper Bot",\n      "schema": { "modes": [...] }\n    }\n  ]\n}'
                  className="w-full rounded-md border border-[#1e293b] bg-[#0d1117] p-3 font-mono text-xs text-blue-300 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Success / Error alerts */}
              {successInfo && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-950/60 p-2.5 text-xs text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successInfo}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-rose-950/60 p-2.5 text-xs text-rose-300 border border-rose-500/40">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT / BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Presets Summary Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#0d1117] border border-[#1e293b] p-3.5">
                <div className="flex items-center gap-3">
                  <FolderHeart className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {backupObject.presets.length} Presets in Backup Bundle
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {customPresets.length} Custom Presets saved in LocalStorage
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBuiltins}
                      onChange={(e) => setIncludeBuiltins(e.target.checked)}
                      className="rounded border-[#1e293b] bg-[#161b22] text-blue-600 focus:ring-0"
                    />
                    <span>Include Official Built-in Presets</span>
                  </label>
                </div>
              </div>

              {/* Current Saved Presets List */}
              {customPresets.length > 0 && (
                <div className="rounded-lg bg-[#0d1117] border border-[#1e293b] p-3 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Saved Presets to be Exported:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {customPresets.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded bg-[#161b22] border border-[#1e293b] px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {p.schema?.modes?.length || 0} modes • {new Date(p.created_at || '').toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete preset "${p.name}"?`)) {
                              onDeleteCustomPreset(p.id);
                            }
                          }}
                          className="p-1 text-gray-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Backup JSON Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                  <span>Presets Backup JSON Preview:</span>
                  <span className="font-mono text-[10px] text-gray-500">
                    {backupJsonString.length} chars
                  </span>
                </div>
                <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md bg-[#0d1117] p-3 font-mono text-xs text-blue-300 border border-[#1e293b]">
                  {backupJsonString}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b] bg-[#0d1117] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#161b22] hover:bg-[#1e293b] px-4 py-1.5 text-xs font-medium text-gray-300 border border-[#1e293b] transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'import' ? (
              <button
                type="button"
                id="btn-confirm-import-presets"
                onClick={handleExecuteImport}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import & Save Presets</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  id="btn-copy-presets-backup"
                  onClick={handleCopyBackup}
                  className="flex items-center gap-1.5 rounded-md bg-[#161b22] hover:bg-[#1e293b] px-3.5 py-1.5 text-xs font-semibold text-gray-200 border border-[#1e293b] transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-download-presets-backup"
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Backup File</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
