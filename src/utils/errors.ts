import * as t from 'io-ts';

export const createFieldRequirement = (
  fieldName: string,
  requirement: string,
  allowedValues?: readonly string[]
): string => {
  const base = `"${fieldName}" ${requirement}`;
  return allowedValues
    ? `${base}. Allowed values are: ${allowedValues.map((v) => `"${v}"`).join(', ')}`
    : base;
};

export class ValidationError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly details: ValidationErrorDetail[]
  ) {
    const messages = details.map((detail) => {
      const fieldPath = detail.path.join('.');
      return `- ${fieldPath}: ${detail.message}`;
    });
    super(
      `Validation failed for ${filePath}:\n${messages.join('\n')}\n` +
        `Please ensure all required fields are present with valid values.`
    );
    this.name = 'ValidationError';
  }
}

export interface ValidationErrorDetail {
  path: string[];
  message: string;
  value: unknown;
}

export type ValidationErrors = t.Errors;
