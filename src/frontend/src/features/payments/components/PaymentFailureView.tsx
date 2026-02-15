import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailureView() {
  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4">
      <Card className="max-w-md w-full border-2 border-destructive/20 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Payment Cancelled</CardTitle>
            <CardDescription className="text-base mt-2">
              Your payment was not completed
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No charges were made to your account. You can try again whenever you're ready.
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={handleRetry} size="lg" className="w-full">
              Try Again
            </Button>
            <Button onClick={handleRetry} variant="outline" size="lg" className="w-full">
              Return to App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
