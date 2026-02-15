import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function usePaidAccess() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['paidAccess'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasPaidAccess();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    hasAccess: query.data === true,
  };
}
