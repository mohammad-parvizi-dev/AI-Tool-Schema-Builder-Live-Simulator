import { SchemaField, ValueType } from '../types';

/**
 * Checks whether a string or primitive represents a finite, pure number.
 * Correctly detects "250", "1", "0.5", "-10", "+5", "0" while ignoring:
 * "1d", "4h", "15m", "BTCUSDT", "true", "0x123", empty strings, etc.
 */
export function isPureNumeric(val: any): boolean {
  if (typeof val === 'number') {
    return !isNaN(val) && isFinite(val);
  }
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed === '') return false;
  
  // Standard integer or floating point decimal (optional +/- prefix)
  const numericPattern = /^[-+]?\d+(\.\d+)?$/;
  if (!numericPattern.test(trimmed)) return false;

  const num = Number(trimmed);
  return !isNaN(num) && isFinite(num);
}

/**
 * Casts an input value based on explicit field configuration (value_type)
 * or smart auto-detection:
 * - Pure numeric strings like "250", "1" automatically become numbers 250, 1.
 * - Non-numeric strings like "BTCUSDT", "1d" stay strings.
 * - Explicit 'number' force-casts to Number or null.
 * - Explicit 'string' force-preserves string representation.
 * - Explicit 'boolean' casts to true/false.
 */
export function castFieldValue(val: any, fieldDef?: Partial<SchemaField>): any {
  if (val === undefined || val === null) {
    if (fieldDef?.value_type === 'number' || fieldDef?.type === 'number') return null;
    if (fieldDef?.value_type === 'boolean' || fieldDef?.type === 'switch') return false;
    return '';
  }

  const explicitType: ValueType = fieldDef?.value_type || 'auto';

  // 1. Explicit Number conversion requested
  if (explicitType === 'number') {
    if (val === '' || val === null) return null;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }

  // 2. Explicit String conversion requested
  if (explicitType === 'string') {
    return String(val);
  }

  // 3. Explicit Boolean conversion requested
  if (explicitType === 'boolean') {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === 1 || val === '1') return true;
    if (val === 'false' || val === 0 || val === '0') return false;
    return Boolean(val);
  }

  // 4. AUTO mode:
  // Component types that are inherently numeric:
  if (fieldDef?.type === 'range_slider' || fieldDef?.type === 'number') {
    if (val === '' || val === null) return null;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }

  // Component types that are inherently boolean:
  if (fieldDef?.type === 'switch') {
    return Boolean(val);
  }

  // If already number or boolean:
  if (typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  // If string, check if it's purely numeric:
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (isPureNumeric(trimmed)) {
      return Number(trimmed);
    }
    return val;
  }

  return val;
}

/**
 * Sanitizes and converts a dictionary of form values for webhook / n8n transmission.
 */
export function sanitizeInputsForPayload(
  formValues: Record<string, any>,
  fields: SchemaField[] = [],
  simLanguage: string = 'en'
): Record<string, any> {
  const fieldsByKey = new Map<string, SchemaField>();
  fields.forEach(f => {
    if (f.key) fieldsByKey.set(f.key, f);
  });

  const sanitized: Record<string, any> = {};

  // Process all values in formValues
  Object.keys(formValues).forEach(key => {
    const fieldDef = fieldsByKey.get(key);
    sanitized[key] = castFieldValue(formValues[key], fieldDef);
  });

  // Ensure all schema fields have an entry
  fields.forEach(field => {
    if (field.key && sanitized[field.key] === undefined) {
      sanitized[field.key] = castFieldValue(field.default_value ?? '', field);
    }
  });

  sanitized.language = simLanguage;

  return sanitized;
}
