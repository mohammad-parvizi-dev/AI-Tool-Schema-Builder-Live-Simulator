import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ModesManager } from './components/builder/ModesManager';
import { LiveSimulator } from './components/simulator/LiveSimulator';
import { JsonViewer } from './components/json/JsonViewer';
import { PresetsBackupModal } from './components/modals/PresetsBackupModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RootToolSchema, CustomPreset, ToolMode, ActivePresetMeta } from './types';
import { defaultBuiltinPresets, blankSchemaPreset } from './data/presets';
import { validateSchema } from './utils/validation';
import { CheckCircle2, Info } from 'lucide-react';

const STORAGE_ACTIVE_SCHEMA_KEY = 'trade_zone_active_schema_v2';
const STORAGE_CUSTOM_PRESETS_KEY = 'trade_zone_custom_presets_v2';
const STORAGE_ACTIVE_PRESET_META_KEY = 'trade_zone_active_preset_meta_v2';

export default function App() {
  // Load initial active schema from LocalStorage or default to built-in cryptoSignalBot
  const [schema, setSchema] = useState<RootToolSchema>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SCHEMA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.modes) && parsed.modes.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load active schema from localStorage', e);
    }
    return defaultBuiltinPresets[0].schema;
  });

  // Load custom presets from LocalStorage
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_PRESETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load custom presets', e);
    }
    return [];
  });

  // Track the active preset metadata (ID, name, and custom flag)
  const [activePresetMeta, setActivePresetMeta] = useState<ActivePresetMeta>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_PRESET_META_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === 'string') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load active preset meta', e);
    }
    return {
      id: defaultBuiltinPresets[0].id,
      name: defaultBuiltinPresets[0].name,
      isCustom: false
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_PRESET_META_KEY, JSON.stringify(activePresetMeta));
    } catch (e) {
      console.error('Failed to persist active preset meta', e);
    }
  }, [activePresetMeta]);

  const [activeModeId, setActiveModeId] = useState<string>(() => {
    return schema.modes?.[0]?.id || 'mode_scalp_breakout';
  });

  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [presetsModalTab, setPresetsModalTab] = useState<'import' | 'export'>('import');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Auto-sync active schema changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_SCHEMA_KEY, JSON.stringify(schema));
    } catch (e) {
      console.error('Failed to persist active schema to localStorage', e);
    }
  }, [schema]);

  // Sync custom presets to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
    } catch (e) {
      console.error('Failed to persist custom presets to localStorage', e);
    }
  }, [customPresets]);

  // Keep activeModeId valid if modes change
  useEffect(() => {
    if (!schema.modes.some((m) => m.id === activeModeId) && schema.modes.length > 0) {
      setActiveModeId(schema.modes[0].id);
    }
  }, [schema.modes, activeModeId]);

  // Compute validation errors in real-time
  const validationErrors = useMemo(() => validateSchema(schema), [schema]);

  const handleUpdateModes = (updatedModes: ToolMode[]) => {
    setSchema({
      modes: updatedModes
    });
  };

  const handleLoadPreset = (presetSchema: RootToolSchema, presetName?: string, presetId?: string, isCustom = false) => {
    const clone: RootToolSchema = JSON.parse(JSON.stringify(presetSchema));
    setSchema(clone);
    if (clone.modes?.[0]) {
      setActiveModeId(clone.modes[0].id);
    }
    const name = presetName || 'Selected Schema';
    setActivePresetMeta({
      id: presetId,
      name,
      isCustom
    });
    showToast(`Loaded preset: ${name}`);
  };

  const handleUpdateCustomPreset = (presetId: string, newName?: string) => {
    const now = new Date().toISOString();
    let updatedTitle = '';

    setCustomPresets((prev) => {
      const exists = prev.some((p) => p.id === presetId);
      if (exists) {
        return prev.map((p) => {
          if (p.id === presetId) {
            updatedTitle = newName && newName.trim() ? newName.trim() : p.name;
            return {
              ...p,
              name: updatedTitle,
              updated_at: now,
              schema: JSON.parse(JSON.stringify(schema))
            };
          }
          return p;
        });
      } else {
        // Fallback: If not found, save as new
        updatedTitle = newName && newName.trim() ? newName.trim() : 'Custom Preset';
        const newPreset: CustomPreset = {
          id: presetId,
          name: updatedTitle,
          created_at: now,
          updated_at: now,
          schema: JSON.parse(JSON.stringify(schema))
        };
        return [newPreset, ...prev];
      }
    });

    setActivePresetMeta({
      id: presetId,
      name: updatedTitle || activePresetMeta.name,
      isCustom: true,
      updated_at: now
    });

    showToast(`Saved changes to "${updatedTitle || activePresetMeta.name}"!`);
  };

  const handleSaveNewCustomPreset = (name: string) => {
    const now = new Date().toISOString();
    const newPreset: CustomPreset = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      created_at: now,
      updated_at: now,
      schema: JSON.parse(JSON.stringify(schema))
    };
    setCustomPresets((prev) => [newPreset, ...prev]);
    setActivePresetMeta({
      id: newPreset.id,
      name: newPreset.name,
      isCustom: true,
      updated_at: now
    });
    showToast(`Saved new preset "${newPreset.name}" to LocalStorage!`);
  };

  const handleDeleteCustomPreset = (id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
    if (activePresetMeta.id === id) {
      setActivePresetMeta({
        name: 'Untitled Schema',
        isCustom: false
      });
    }
    showToast('Custom preset deleted.');
  };

  const handleReset = () => {
    const fresh = JSON.parse(JSON.stringify(blankSchemaPreset));
    setSchema(fresh);
    if (fresh.modes[0]) {
      setActiveModeId(fresh.modes[0].id);
    }
    setActivePresetMeta({
      id: 'blank',
      name: 'Blank Template',
      isCustom: false
    });
    showToast('Reset to blank schema template.');
  };

  const handleOpenImportPresets = () => {
    setPresetsModalTab('import');
    setIsPresetsModalOpen(true);
  };

  const handleOpenExportPresets = () => {
    setPresetsModalTab('export');
    setIsPresetsModalOpen(true);
  };

  const handleImportPresets = (importedPresets: CustomPreset[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setCustomPresets(importedPresets);
      showToast(`Replaced custom presets with ${importedPresets.length} imported presets!`);
    } else {
      setCustomPresets((prev) => [...importedPresets, ...prev]);
      showToast(`Merged ${importedPresets.length} presets into your library!`);
    }

    // Automatically load the first imported preset into workspace if available
    if (importedPresets[0]?.schema) {
      handleLoadPreset(importedPresets[0].schema, importedPresets[0].name, importedPresets[0].id, true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans antialiased">
      {/* Header with Preset Manager & LocalStorage & Validation Counter */}
      <Header
        schema={schema}
        validationErrors={validationErrors}
        customPresets={customPresets}
        activePresetMeta={activePresetMeta}
        onLoadPreset={handleLoadPreset}
        onUpdateCustomPreset={handleUpdateCustomPreset}
        onSaveNewCustomPreset={handleSaveNewCustomPreset}
        onDeleteCustomPreset={handleDeleteCustomPreset}
        onReset={handleReset}
        onOpenImportPresets={handleOpenImportPresets}
        onOpenExportPresets={handleOpenExportPresets}
      />

      {/* Main Split Layout */}
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 max-w-[1920px] mx-auto">
          {/* Left Panel: Visual Builder (Analysis Modes & Dynamic Field Builder) */}
          <section 
            id="panel-admin-builder"
            className="lg:col-span-6 xl:col-span-6 2xl:col-span-5 space-y-4"
          >
            <ErrorBoundary fallbackTitle="Visual Builder Error">
              <ModesManager
                modes={schema.modes}
                activeModeId={activeModeId}
                onSelectMode={setActiveModeId}
                onChangeModes={handleUpdateModes}
              />
            </ErrorBoundary>
          </section>

          {/* Right Panel: Split Vertically (Live User Simulation Top + JSON Output Bottom) */}
          <section 
            id="panel-right-simulation-and-json"
            className="lg:col-span-6 xl:col-span-6 2xl:col-span-7 flex flex-col gap-5"
          >
            {/* Top Right: Interactive Live User Simulation (Trade Zone Dark UI) */}
            <div className="min-h-[580px] flex-1">
              <ErrorBoundary fallbackTitle="Simulator Error">
                <LiveSimulator
                  schema={schema}
                  activeModeId={activeModeId}
                  onSelectMode={setActiveModeId}
                />
              </ErrorBoundary>
            </div>

            {/* Bottom Right: Clean, Two-Way Live JSON Editor with 1-click Copy for Database */}
            <div className="min-h-[380px] max-h-[540px]">
              <JsonViewer
                schema={schema}
                validationErrors={validationErrors}
                onChangeSchema={setSchema}
                onResetToPreset={handleReset}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Presets Library Backup & Restore Modal */}
      <PresetsBackupModal
        isOpen={isPresetsModalOpen}
        initialTab={presetsModalTab}
        customPresets={customPresets}
        activeSchema={schema}
        onClose={() => setIsPresetsModalOpen(false)}
        onImportPresets={handleImportPresets}
        onLoadPresetDirectly={handleLoadPreset}
        onDeleteCustomPreset={handleDeleteCustomPreset}
      />

      {/* Lightweight Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-blue-500/40 bg-[#161b22] px-4 py-2.5 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

