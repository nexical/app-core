import { useNavData } from '@/lib/ui/nav-context';

export function useAuth() {
  const { context } = useNavData();
  return {
    user: context?.user as { id: string; role: string; email: string; name?: string } | undefined,
  };
}
