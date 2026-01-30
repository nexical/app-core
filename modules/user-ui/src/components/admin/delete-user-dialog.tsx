import { api, type ApiError } from '@/lib/api/api';
import { useTranslation } from 'react-i18next';
import { ConfirmDeletionDialog } from '@/components/confirm-deletion-dialog';

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const { t } = useTranslation();
  const handleDelete = async () => {
    try {
      await api.user.delete(userId);
      onSuccess();
    } catch (e: unknown) {
      throw new Error((e as ApiError).body?.error || (e as ApiError).message);
    }
  };

  return (
    <ConfirmDeletionDialog
      open={open}
      onOpenChange={onOpenChange}
      itemName={userName}
      itemType={t('user.common.user')}
      onConfirm={handleDelete}
      confirmLabel={t('user.admin.user_management.delete_permanently')}
    />
  );
}
