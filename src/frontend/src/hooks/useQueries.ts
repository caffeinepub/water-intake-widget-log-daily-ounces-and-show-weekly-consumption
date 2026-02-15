import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

const WEEKLY_SUMMARY_KEY = 'weeklySummary';

export function useWeeklySummary() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[] | null>({
    queryKey: [WEEKLY_SUMMARY_KEY],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWeeklySummary();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRecordIntake() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amountOz: number) => {
      if (!actor) throw new Error('Actor not initialized');
      if (amountOz < 0) throw new Error('Amount cannot be negative');
      if (!Number.isInteger(amountOz)) throw new Error('Amount must be a whole number');
      
      await actor.recordIntake(BigInt(amountOz));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WEEKLY_SUMMARY_KEY] });
    },
  });
}
