import { FormField, Formula, ParsedSnippet } from '@/types';

export function parseSnippetContent(content: string): ParsedSnippet {
  const fields: FormField[] = [];
  const formulas: Formula[] = [];
  
  // Parse form fields: {formtext: name=fieldName; default=defaultValue; label=Label}
  const formFieldRegex = /\{(formtext|formparagraph|formtoggle|formdropdown):\s*([^}]+)\}/g;
  let fieldMatch;
  
  while ((fieldMatch = formFieldRegex.exec(content)) !== null) {
    const fieldType = fieldMatch[1] as FormField['type'];
    const attributes = fieldMatch[2];
    
    const field: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type: fieldType,
      name: extractAttribute(attributes, 'name') || `field_${fields.length}`,
      label: extractAttribute(attributes, 'label'),
      defaultValue: extractAttribute(attributes, 'default') || (fieldType === 'formtoggle' ? false : ''),
      required: extractAttribute(attributes, 'required') === 'yes'
    };
    
    if (fieldType === 'formdropdown') {
      const options = extractAttribute(attributes, 'options');
      field.options = options ? options.split(',').map(o => o.trim()) : [];
    }
    
    fields.push(field);
  }
  
  // Parse formulas: {= expression}
  const formulaRegex = /\{=\s*([^}]+)\}/g;
  let formulaMatch;
  
  while ((formulaMatch = formulaRegex.exec(content)) !== null) {
    formulas.push({
      id: Math.random().toString(36).substr(2, 9),
      expression: formulaMatch[1].trim()
    });
  }
  
  return { content, fields, formulas };
}

function extractAttribute(attributes: string, name: string): string | undefined {
  const regex = new RegExp(`${name}=([^;]+)(?:;|$)`);
  const match = attributes.match(regex);
  return match ? match[1].trim() : undefined;
}

export function processSnippetContent(content: string, fieldValues: Record<string, any>): string {
  let processedContent = content;
  
  // Replace form fields with their values
  const formFieldRegex = /\{(formtext|formparagraph|formtoggle|formdropdown):\s*([^}]+)\}/g;
  processedContent = processedContent.replace(formFieldRegex, (match, fieldType, attributes) => {
    const fieldName = extractAttribute(attributes, 'name') || 'unnamed';
    const value = fieldValues[fieldName];
    
    if (fieldType === 'formtoggle') {
      return value ? extractAttribute(attributes, 'truetext') || 'Yes' : extractAttribute(attributes, 'falsetext') || '';
    }
    
    return String(value || '');
  });
  
  // Replace variable references: {name} with field values
  processedContent = processedContent.replace(/\{(\w+)\}/g, (match, varName) => {
    return fieldValues[varName] !== undefined ? String(fieldValues[varName]) : match;
  });
  
  // Process formulas
  const formulaRegex = /\{=\s*([^}]+)\}/g;
  processedContent = processedContent.replace(formulaRegex, (match, expression) => {
    try {
      // Replace variables in formula with their values
      let processedExpression = expression;
      Object.entries(fieldValues).forEach(([key, value]) => {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : Number(value);
        processedExpression = processedExpression.replace(new RegExp(key, 'g'), String(numValue));
      });
      
      // Basic formula evaluation (safe subset)
      const result = evaluateFormula(processedExpression);
      return String(result);
    } catch (error) {
      return `[Formula Error: ${expression}]`;
    }
  });
  
  return processedContent;
}

function evaluateFormula(expression: string): number {
  // Basic safe formula evaluation
  // Only allow numbers, basic operators, and common math functions
  const safeExpression = expression
    .replace(/[^0-9+\-*/().\s]/g, '')
    .replace(/(\d+)\s*\*\s*(\d+)/g, '$1*$2')
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2')
    .replace(/(\d+)\s*\+\s*(\d+)/g, '$1+$2')
    .replace(/(\d+)\s*\-\s*(\d+)/g, '$1-$2');
  
  try {
    return Function(`"use strict"; return (${safeExpression})`)();
  } catch {
    return 0;
  }
}