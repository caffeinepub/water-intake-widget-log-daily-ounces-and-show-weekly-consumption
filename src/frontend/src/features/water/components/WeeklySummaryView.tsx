import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Droplets, Calendar } from 'lucide-react';
import { useWeeklySummary } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { isPaymentRequiredError } from '@/utils/paymentErrors';

interface DayData {
  dayName: string;
  dateStr: string;
  amount: number;
}

interface WeeklySummaryViewProps {
  onPaymentRequired?: () => void;
}

function WeeklySummaryView({ onPaymentRequired }: WeeklySummaryViewProps) {
  const { data: weeklyData, isLoading, error } = useWeeklySummary();

  useEffect(() => {
    if (error && isPaymentRequiredError(error)) {
      onPaymentRequired?.();
    }
  }, [error, onPaymentRequired]);

  // Calculate weekly total
  const weeklyTotal = weeklyData ? weeklyData.reduce((sum, day) => sum + Number(day), 0) : 0;
  const dailyAverage = weeklyData && weeklyData.length > 0 ? Math.round(weeklyTotal / 7) : 0;

  // Generate last 7 days with labels
  const getLast7Days = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const amount = weeklyData && weeklyData.length > i ? Number(weeklyData[i]) : 0;
      
      days.push({ dayName, dateStr, amount });
    }
    
    return days;
  };

  const days = getLast7Days();
  const maxAmount = Math.max(...days.map(d => d.amount), 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weekly Total</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Droplets className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <>
                <p className="text-4xl font-bold text-primary">{weeklyTotal}</p>
                <p className="text-sm text-muted-foreground mt-1">ounces this week</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Daily Average</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <>
                <p className="text-4xl font-bold text-accent-foreground">{dailyAverage}</p>
                <p className="text-sm text-muted-foreground mt-1">ounces per day</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Daily Breakdown</CardTitle>
          </div>
          <CardDescription>Water consumption for each day this week</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {days.map((day, index) => {
                const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                const isToday = index === days.length - 1;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-[60px]">{day.dayName}</span>
                        <span className="text-muted-foreground">{day.dateStr}</span>
                        {isToday && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-primary">{day.amount} oz</span>
                    </div>
                    <div className="relative h-8 w-full overflow-hidden rounded-lg bg-muted">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out flex items-center justify-end pr-3"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {day.amount > 0 && percentage > 15 && (
                          <span className="text-xs font-medium text-primary-foreground">
                            {day.amount} oz
                          </span>
                        )}
                      </div>
                    </div>
                    {index < days.length - 1 && <Separator className="mt-4" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hydration Tip */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Hydration Tip</h3>
              <p className="text-sm text-muted-foreground">
                The recommended daily water intake is about 64 ounces (8 cups) for most adults. 
                Adjust based on your activity level and climate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeeklySummaryView;
