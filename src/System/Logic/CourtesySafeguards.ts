export function validateAICourtesy(apiKey?: string): { valid: boolean; isValid: boolean; message: string; errorReason?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, isValid: false, message: 'API key not provided.', errorReason: 'API key not provided.' };
  }
  return { valid: true, isValid: true, message: 'Courtesy validation passed.' };
}
