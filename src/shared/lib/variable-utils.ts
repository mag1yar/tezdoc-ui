export interface VariableDefinition {
  id: string; // dot.notation.path
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  value?: any;
}

export function extractVariables(data: Record<string, any>, prefix = ''): VariableDefinition[] {
  const variables: VariableDefinition[] = [];

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      const path = prefix ? `${prefix}.${key}` : key;
      const type = getType(value);

      variables.push({
        id: path,
        label: path, // Use full path as label so editor shows 'client.name' instead of 'name'
        type,
        value,
      });

      if (type === 'object' && value !== null) {
        variables.push(...extractVariables(value, path));
      } else if (type === 'array' && value.length > 0) {
        // For arrays, we just look at the first item to infer schema
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          variables.push(...extractVariables(firstItem, `${path}[]`));
        }
      }
    }
  }

  return variables;
}

function getType(value: any): VariableDefinition['type'] {
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object' && value !== null) return 'object';

  // Check if string is a date
  if (typeof value === 'string' && value.length >= 10) {
    // ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value)) {
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) return 'date';
    }
  }

  return 'string';
}
