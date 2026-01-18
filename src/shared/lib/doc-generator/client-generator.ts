// We need a lightweight way to traverse and replace JSON
// Or we can use Tiptap's schema to generate HTML, but we need to resolve variables *before* or *during* generation.

// Simpler approach for Phase 1:
// 1. Traverse JSON tree.
// 2. If node.type === 'variable', find value in data, replace node with { type: 'text', text: value }.
// 3. Return new JSON.
// 4. Use generateHTML(newJSON, extensions) to get final HTML.

export function generatePreviewJson(
  docJson: Record<string, any>,
  data: Record<string, any>,
): Record<string, any> {
  if (!docJson || !data) return docJson;
  return traverseAndReplace(JSON.parse(JSON.stringify(docJson)), data);
}

function traverseAndReplace(node: any, data: Record<string, any>): any {
  if (!node) return node;

  if (Array.isArray(node)) {
    return node.map((child) => traverseAndReplace(child, data));
  }

  if (node.type === 'variable') {
    const value = resolvePath(data, node.attrs?.id);
    // If value is found, return a Text node
    // If not, keep variable node or return placeholder?
    // Let's return text node with value or empty string
    const textValue = formatValue(value, node.attrs?.type); // TODO: Apply formatting
    return {
      type: 'text',
      text: textValue,
      marks: node.marks, // Preserve marks like bold, italic
    };
  }

  if (node.content) {
    node.content = traverseAndReplace(node.content, data);
  }

  return node;
}

function resolvePath(data: any, path: string): any {
  if (!path || !data) return undefined;
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), data);
}

function formatValue(value: any, type?: string): string {
  if (value === undefined || value === null) return '___'; // Placeholder for missing data

  if (type === 'date' && (typeof value === 'string' || value instanceof Date)) {
    try {
      return new Date(value).toLocaleDateString('ru-RU'); // Default format for MVP
    } catch (e) {
      return String(value);
    }
  }

  if (type === 'number' && typeof value === 'number') {
    return value.toLocaleString('ru-RU');
  }

  return String(value);
}
