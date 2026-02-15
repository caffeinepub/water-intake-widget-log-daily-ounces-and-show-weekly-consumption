import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets } from 'lucide-react';
import WaterIntakeWidget from './features/water/components/WaterIntakeWidget';
import WeeklySummaryView from './features/water/components/WeeklySummaryView';
import PaywallScreen from './features/paywall/PaywallScreen';
import PaymentSuccessView from './features/payments/components/PaymentSuccessView';
import PaymentFailureView from './features/payments/components/PaymentFailureView';
import { usePaidAccess } from './hooks/usePaidAccess';
import { useInternetIdentity } from './hooks/useInternetIdentity';

function App() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'water-intake-widget'
  );

  // All hooks must be called before any conditional returns
  const { identity, isInitializing } = useInternetIdentity();
  const { hasAccess, isLoading: accessLoading, isFetched: accessFetched } = usePaidAccess();
  const [showPaywall, setShowPaywall] = useState(false);

  const isAuthenticated = !!identity;
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Determine if we should show the paywall
  const shouldShowPaywall = 
    !isInitializing && 
    isAuthenticated && 
    !accessLoading && 
    accessFetched && 
    !hasAccess;

  useEffect(() => {
    if (shouldShowPaywall) {
      setShowPaywall(true);
    } else if (hasAccess) {
      setShowPaywall(false);
    }
  }, [shouldShowPaywall, hasAccess]);

  const handlePaymentRequired = () => {
    setShowPaywall(true);
  };

  // Handle payment success/failure routes after all hooks
  if (pathname === '/payment-success') {
    return <PaymentSuccessView />;
  }

  if (pathname === '/payment-failure') {
    return <PaymentFailureView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Droplets className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Hydration Tracker</h1>
              <p className="text-sm text-muted-foreground">Stay hydrated, stay healthy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showPaywall ? (
          <PaywallScreen />
        ) : (
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="daily">Daily Log</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-0">
              <WaterIntakeWidget onPaymentRequired={handlePaymentRequired} />
            </TabsContent>

            <TabsContent value="weekly" className="mt-0">
              <WeeklySummaryView onPaymentRequired={handlePaymentRequired} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="mt-16 border-t border-border/40 bg-card/30 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} · Built with{' '}
            <span className="inline-block text-primary">❤</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
