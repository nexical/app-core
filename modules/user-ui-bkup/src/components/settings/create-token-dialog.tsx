/* eslint-disable */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, type ApiError } from '@/lib/api/api';
import { type PersonalAccessToken as AccessToken } from '@modules/user-api/src/sdk';
type CreateTokenResponse = { token: AccessToken; rawKey: string };
import { Copy, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner'; // Assuming sonner or use alert

interface CreateTokenDialogProps {
  onTokenCreated: (token: AccessToken) => void;
}

export function CreateTokenDialog({ onTokenCreated }: CreateTokenDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.user.createToken({ name });
      const data = (result as any).data || result;

      setRawKey(data.rawKey);
      // Construct a temporary AccessToken object for UI update
      const newToken: AccessToken = {
        ...(data.token || data),
        prefix: 'pat', // Default prefix if not returned or known
        lastUsedAt: null,
        expiresAt: null,
      };
      onTokenCreated(newToken);
      toast.success('Token created successfully');
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as ApiError).body?.error || 'Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (rawKey) {
      navigator.clipboard.writeText(rawKey);
      toast.success('Token copied to clipboard');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setRawKey(null);
    setName('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button data-testid="create-token-trigger">
          <Plus className="w-4 h-4 mr-2" />
          {t('user.tokens.create_button', 'Create Token')}
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="create-token-dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="create-token-dialog-title">
            {t('user.tokens.create_dialog.title', 'Create Personal Access Token')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'user.tokens.create_dialog.description',
              'Create a token to access the API. You will only see it once.',
            )}
          </DialogDescription>
        </DialogHeader>

        {!rawKey ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">{t('user.tokens.name_label', 'Token Name')}</Label>
              <Input
                id="tokenName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CLI Laptop"
                required
                data-testid="create-token-name"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('core.common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={loading} data-testid="create-token-submit">
                {loading
                  ? t('core.common.creating', 'Creating...')
                  : t('core.common.create', 'Create')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                {t(
                  'user.tokens.warning_copy',
                  "Make sure to copy your personal access token now. You won't be able to see it again!",
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('user.tokens.your_token', 'Your Token')}</Label>
              <div className="flex gap-2">
                <Input
                  value={rawKey || ''}
                  readOnly
                  className="font-mono"
                  data-testid="create-token-value"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  data-testid="create-token-copy"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} data-testid="create-token-done">
                {t('core.common.done', 'Done')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
