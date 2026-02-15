import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useConfirmPurchase } from '../hooks/useConfirmPurchase';

export default function PaymentSuccessView() {
  const confirmPurchase = useConfirmPurchase();
  const [status, setStatus] = useState<'confirming' | 'success' | 'error'>('confirming');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No payment session found. Please try again.');
      return;
    }

    confirmPurchase.mutate(sessionId, {
      onSuccess: (confirmed) => {
        if (confirmed) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage('Payment verification failed. Please contact support.');
        }
      },
      onError: (err) => {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to confirm payment');
      },
    });
  }, []);

  const handleContinue = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-2 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            {status === 'confirming' && (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {status === 'confirming' && 'Confirming Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'error' && 'Payment Failed'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {status === 'confirming' && 'Please wait while we verify your payment'}
              {status === 'success' && 'Your account has been unlocked'}
              {status === 'error' && 'There was a problem with your payment'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <>
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You now have full access to the Hydration Tracker. Start logging your water intake!
                </p>
              </div>
              <Button onClick={handleContinue} size="lg" className="w-full">
                Continue to App
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <Button onClick={handleContinue} variant="outline" size="lg" className="w-full">
                Return to App
              </Button>
            </>
          )}

          {status === 'confirming' && (
            <div className="text-center text-sm text-muted-foreground">
              This may take a few moments...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
