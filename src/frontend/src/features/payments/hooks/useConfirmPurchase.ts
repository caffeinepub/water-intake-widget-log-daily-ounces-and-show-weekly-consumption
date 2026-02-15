import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../../hooks/useActor';

export function useConfirmPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPurchase(sessionId);
    },
    onSuccess: () => {
      // Invalidate paid access query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['paidAccess'] });
    },
  });
}
