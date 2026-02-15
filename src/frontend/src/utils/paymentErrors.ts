export function isPaymentRequiredError(error: unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for payment-required patterns from backend
  return (
    errorMessage.includes('Access denied') ||
    errorMessage.includes('Please pay to unlock') ||
    errorMessage.includes('payment required') ||
    errorMessage.includes('Payment required')
  );
}

export function getPaymentErrorMessage(error: unknown): string {
  if (isPaymentRequiredError(error)) {
    return 'Please unlock the app to use this feature';
  }
  
  return error instanceof Error ? error.message : 'An error occurred';
}
