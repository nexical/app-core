/* eslint-disable */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api, type ApiError } from '@/lib/api/api';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateTokenDialog } from './create-token-dialog';
import { toast } from 'sonner';
import { I18nProvider } from '@/components/system/I18nProvider';
import { type PersonalAccessToken as AccessToken } from '@modules/user-api/src/sdk';

interface TokenListProps {
  tokens: AccessToken[];
  i18nData?: any;
}

function TokenListContent({ tokens: initialTokens }: { tokens: AccessToken[] }) {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<AccessToken[]>(initialTokens || []);
  const [loading, setLoading] = useState(!initialTokens?.length);

  useEffect(() => {
    if (tokens.length === 0 && loading) {
      api.user
        .listTokens()
        .then((result: any) => {
          // Handle both envelope ({ data: [] }) and direct array ([]) responses
          const tokensList = Array.isArray(result) ? result : result.data || [];
          setTokens(tokensList);
        })
        .catch((err: any) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [tokens.length, loading]);

  const handleTokenCreated = (newToken: AccessToken) => {
    setTokens([newToken, ...tokens]);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm(t('user.tokens.revoke_confirm', 'Are you sure you want to revoke this token?')))
      return;

    try {
      await api.user.deleteToken(id);
      setTokens(tokens.filter((tok) => tok.id !== id));
      toast.success(t('user.tokens.revoked_success', 'Token revoked'));
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as ApiError).body?.error || 'Failed to revoke token');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-heading-md">{t('user.tokens.title', 'Personal Access Tokens')}</h3>
          <p className="text-subtle">
            {t('user.tokens.subtitle', 'Manage tokens that access the API on your behalf.')}
          </p>
        </div>
        <div className="shrink-0">
          <CreateTokenDialog onTokenCreated={handleTokenCreated} />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('user.tokens.table.name', 'Name')}</TableHead>
              <TableHead>{t('user.tokens.table.last_used', 'Last Used')}</TableHead>
              <TableHead>{t('user.tokens.table.created', 'Created')}</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t('user.tokens.empty', 'No active tokens found.')}
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id} data-testid={`token-row-${token.name}`}>
                  <TableCell className="font-medium px-4 py-4">{token.name}</TableCell>
                  <TableCell className="px-4 py-4">
                    {token.lastUsedAt
                      ? new Date(token.lastUsedAt).toLocaleDateString()
                      : t('user.tokens.never', 'Never')}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRevoke(token.id)}
                      data-testid="token-revoke-button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function TokenList({ tokens }: TokenListProps) {
  return <TokenListContent tokens={tokens} />;
}
