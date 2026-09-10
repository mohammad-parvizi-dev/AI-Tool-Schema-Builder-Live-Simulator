export type SupportedLanguage = 'en' | 'fa' | 'ar' | 'zh' | 'es' | 'tr';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRtl: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRtl: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', isRtl: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRtl: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRtl: false },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isRtl: false },
];

export type FieldType = 
  | 'search_select'
  | 'pills'
  | 'select'
  | 'range_slider'
  | 'switch'
  | 'text'
  | 'textarea';

export interface LocalizedString {
  en: string;
  fa: string;
  ar?: string;
  zh?: string;
  es?: string;
  tr?: string;
  [key: string]: string | undefined;
}

export interface FieldOption {
  id?: string;
  value: string;
  label: string;
  symbol?: string;
  icon_url?: string;
  badge?: string;
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  unit: string;
  min_label?: string;
  max_label?: string;
}

export interface SchemaField {
  id: string;
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  required: boolean;
  default_value: any;
  placeholder?: string;
  options?: FieldOption[];
  slider_config?: SliderConfig;
}

export interface ToolMode {
  id: string;
  mode_id: string;
  title: LocalizedString;
  description: LocalizedString;
  prompt_template?: string;
  display_template?: string;
  icon?: string;
  badge_color?: string;
  fields: SchemaField[];
}

export interface RootToolSchema {
  modes: ToolMode[];
}

// Clean JSON export format
export interface ExportedToolMode {
  mode_id: string;
  title: LocalizedString;
  description: LocalizedString;
  prompt_template?: string;
  display_template?: string;
  fields: Array<{
    key: string;
    label: string;
    type: FieldType;
    required: boolean;
    default_value: any;
    placeholder?: string;
    description?: string;
    options?: Array<{
      value: string;
      label: string;
      symbol?: string;
      icon_url?: string;
      badge?: string;
    }>;
    slider_config?: SliderConfig;
  }>;
}

export interface ExportedRootSchema {
  modes: ExportedToolMode[];
}

export interface PresetItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  schema: RootToolSchema;
}

export type CustomPreset = PresetItem;

export interface PresetsBackup {
  version: string;
  backup_date: string;
  active_preset_id?: string;
  presets: PresetItem[];
}


export interface ValidationError {
  path: string;
  message: string;
  type: 'error' | 'warning';
}

export interface N8nWebhookPayload {
  mode_id: string;
  display_title: string;
  display_summary: string;
  compiled_prompt: string;
  inputs: Record<string, any>;
}

export interface SimulationResult {
  timestamp: string;
  mode_id: string;
  mode_title: string;
  display_summary: string;
  form_values: Record<string, any>;
  compiled_prompt: string;
  language: SupportedLanguage;
  n8n_payload: N8nWebhookPayload;
  ai_mock_response: {
    signal_type: 'BUY' | 'SELL' | 'NEUTRAL' | 'ACCUMULATION' | 'BREAKOUT';
    confidence: number;
    summary: string;
    entry_zone: string;
    targets: string[];
    stop_loss: string;
    risk_reward: string;
    indicators_breakdown: Array<{ name: string; status: string; sentiment: 'bullish' | 'bearish' | 'neutral' }>;
    detailed_notes: string;
  };
}

