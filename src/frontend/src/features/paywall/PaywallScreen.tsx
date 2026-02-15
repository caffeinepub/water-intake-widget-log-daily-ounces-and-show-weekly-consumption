import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Droplets, AlertCircle, CreditCard } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCreateCheckoutSession } from '../payments/hooks/useCreateCheckoutSession';
import LoginButton from '../../components/auth/LoginButton';
import type { ShoppingItem } from '../../backend';

export default function PaywallScreen() {
  const { identity } = useInternetIdentity();
  const createCheckoutSession = useCreateCheckoutSession();
  const [error, setError] = useState('');

  const isAuthenticated = !!identity;

  const handlePayment = async () => {
    setError('');
    
    if (!isAuthenticated) {
      setError('Please sign in first to unlock the app');
      return;
    }

    try {
      const items: ShoppingItem[] = [
        {
          productName: 'Hydration Tracker Access',
          productDescription: 'Unlock full access to track your daily water intake',
          priceInCents: BigInt(50), // $0.50
          currency: 'usd',
          quantity: BigInt(1),
        },
      ];

      const session = await createCheckoutSession.mutateAsync(items);
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      window.location.href = session.url;
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start payment. Please try again.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-lg w-full border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Lock className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Unlock Hydration Tracker</CardTitle>
            <CardDescription className="text-base mt-2">
              Get full access to track your daily water intake and view weekly summaries
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Droplets className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Daily Water Logging</p>
                <p className="text-sm text-muted-foreground">Track your water intake throughout the day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Droplets className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Weekly Summary</p>
                <p className="text-sm text-muted-foreground">View your hydration trends and averages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Droplets className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">7-Day History</p>
                <p className="text-sm text-muted-foreground">Access your complete hydration history</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">One-time payment</p>
            <p className="text-5xl font-bold text-primary">$0.50</p>
            <p className="text-sm text-muted-foreground mt-2">Lifetime access</p>
          </div>

          {/* Auth & Payment Actions */}
          <div className="space-y-4">
            {!isAuthenticated ? (
              <>
                <p className="text-sm text-center text-muted-foreground">
                  Sign in to unlock the app
                </p>
                <LoginButton />
              </>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={createCheckoutSession.isPending}
                size="lg"
                className="w-full shadow-md"
              >
                {createCheckoutSession.isPending ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay $0.50 & Unlock
                  </>
                )}
              </Button>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
