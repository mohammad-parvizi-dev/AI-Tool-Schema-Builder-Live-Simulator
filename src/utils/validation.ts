import { RootToolSchema, ValidationError } from '../types';
import { extractPlaceholders } from './promptCompiler';

export function validateSchema(schema: RootToolSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!schema.modes || schema.modes.length === 0) {
    errors.push({
      path: 'modes',
      message: 'At least one analysis mode is required',
      type: 'error'
    });
    return errors;
  }

  schema.modes.forEach((mode, mIdx) => {
    const modePath = `modes[${mIdx}]`;
    const modeName = mode.title?.en || mode.title?.fa || `Mode ${mIdx + 1}`;

    if (!mode.title?.en?.trim() && !mode.title?.fa?.trim()) {
      errors.push({
        path: `${modePath}.title`,
        message: `${modeName}: English or Persian title is required`,
        type: 'error'
      });
    }

    if (!mode.prompt_template || mode.prompt_template.trim() === '') {
      errors.push({
        path: `${modePath}.prompt_template`,
        message: `${modeName}: Prompt template is required`,
        type: 'error'
      });
    }

    // Check placeholder variables in prompt template
    const placeholders = extractPlaceholders(mode.prompt_template || '');
    const fieldKeys = new Set((mode.fields || []).map(f => (f.key || '').trim()));
    // built-in keys
    const validKeys = new Set([...Array.from(fieldKeys), 'language']);

    placeholders.forEach(placeholder => {
      if (!validKeys.has(placeholder)) {
        errors.push({
          path: `${modePath}.prompt_template.${placeholder}`,
          message: `${modeName}: Placeholder {${placeholder}} in prompt template is not defined in any field key`,
          type: 'warning'
        });
      }
    });

    // Check duplicate field keys strictly per mode
    const seenKeysInThisMode = new Set<string>();
    (mode.fields || []).forEach((field, fIdx) => {
      const fieldPath = `${modePath}.fields[${fIdx}]`;
      const fKey = (field.key || '').trim();

      if (!fKey) {
        errors.push({
          path: `${fieldPath}.key`,
          message: `${modeName} Field #${fIdx + 1}: Variable key is required`,
          type: 'error'
        });
      } else if (!/^[a-zA-Z0-9_-]+$/.test(fKey)) {
        errors.push({
          path: `${fieldPath}.key`,
          message: `${modeName} Field "${fKey}": Key must contain only letters, numbers, and underscores`,
          type: 'error'
        });
      } else if (seenKeysInThisMode.has(fKey)) {
        errors.push({
          path: `${fieldPath}.key`,
          message: `${modeName}: Duplicate field variable key "${fKey}" in this mode`,
          type: 'error'
        });
      } else {
        seenKeysInThisMode.add(fKey);
      }

      if (!field.label || field.label.trim() === '') {
        errors.push({
          path: `${fieldPath}.label`,
          message: `${modeName} Field "${fKey || fIdx + 1}": Field label is required`,
          type: 'error'
        });
      }

      // Check options for select/pills/search_select
      if (['select', 'pills', 'search_select'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          errors.push({
            path: `${fieldPath}.options`,
            message: `${modeName} Field "${fKey || fIdx + 1}": Options list cannot be empty for ${field.type.replace('_', ' ')}`,
            type: 'error'
          });
        }
      }
    });
  });

  return errors;
}

