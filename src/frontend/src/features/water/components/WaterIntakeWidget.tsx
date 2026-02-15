import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, Plus, AlertCircle } from 'lucide-react';
import { useWeeklySummary, useRecordIntake } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { isPaymentRequiredError, getPaymentErrorMessage } from '@/utils/paymentErrors';

interface DayData {
  dayName: string;
  dateStr: string;
  amount: number;
}

interface WaterIntakeWidgetProps {
  onPaymentRequired?: () => void;
}

function WaterIntakeWidget({ onPaymentRequired }: WaterIntakeWidgetProps) {
  const [ounces, setOunces] = useState('');
  const [error, setError] = useState('');
  
  const { data: weeklyData, isLoading } = useWeeklySummary();
  const recordIntake = useRecordIntake();

  const handleAddWater = () => {
    setError('');
    
    const amount = parseInt(ounces, 10);
    
    if (isNaN(amount)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (amount < 0) {
      setError('Amount cannot be negative');
      return;
    }
    
    if (amount === 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    recordIntake.mutate(amount, {
      onSuccess: () => {
        setOunces('');
      },
      onError: (err) => {
        if (isPaymentRequiredError(err)) {
          onPaymentRequired?.();
        } else {
          setError(getPaymentErrorMessage(err));
        }
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWater();
    }
  };

  // Get today's total (first element in array)
  const todayTotal = weeklyData && weeklyData.length > 0 ? Number(weeklyData[0]) : 0;

  // Generate last 7 days with labels
  const getLast7Days = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const amount = weeklyData && weeklyData.length > i ? Number(weeklyData[i]) : 0;
      
      days.push({ dayName, dateStr, amount });
    }
    
    return days;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Today's Intake Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Today's Water Intake</CardTitle>
              <CardDescription>Track your daily hydration goal</CardDescription>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-md">
              <Droplets className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Total Display */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Consumed</p>
            {isLoading ? (
              <Skeleton className="h-12 w-32 mx-auto" />
            ) : (
              <p className="text-5xl font-bold text-primary">{todayTotal}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">ounces</p>
          </div>

          {/* Add Water Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ounces" className="text-base font-medium">
                Add Water (oz)
              </Label>
              <div className="flex gap-3">
                <Input
                  id="ounces"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter ounces"
                  value={ounces}
                  onChange={(e) => setOunces(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg h-12"
                  disabled={recordIntake.isPending}
                />
                <Button
                  onClick={handleAddWater}
                  disabled={recordIntake.isPending || !ounces}
                  size="lg"
                  className="px-8 shadow-md"
                >
                  {recordIntake.isPending ? (
                    'Adding...'
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last 7 Days Table */}
      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days</CardTitle>
          <CardDescription>Your daily water intake history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Day</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount (oz)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getLast7Days().map((day, index) => (
                    <TableRow key={index} className={index === 0 ? 'bg-accent/5' : ''}>
                      <TableCell className="font-medium">
                        {day.dayName}
                        {index === 0 && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Current
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{day.dateStr}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-semibold text-primary">{day.amount}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WaterIntakeWidget;
