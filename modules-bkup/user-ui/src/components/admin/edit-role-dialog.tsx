import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type ApiError } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SiteRole = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  CONTRACTOR: 'CONTRACTOR',
} as const;

type SiteRoleType = keyof typeof SiteRole;

interface EditRoleDialogProps {
  userId: string;
  currentRole: SiteRoleType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const roleSchema = z.object({
  role: z.nativeEnum(SiteRole),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export function EditRoleDialog({
  userId,
  currentRole,
  open,
  onOpenChange,
  onSuccess,
}: EditRoleDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role: currentRole },
  });

  const onSubmit = async (values: RoleFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.user.update(userId, { role: values.role });
      onSuccess();
      onOpenChange(false);
    } catch (e: unknown) {
      const errorMessage =
        (e as ApiError).body?.error ||
        (e as ApiError).message ||
        t('user.admin.user_management.error.unexpected');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog-content">
        <DialogHeader>
          <DialogTitle>{t('user.admin.edit_role.title')}</DialogTitle>
          <DialogDescription>{t('user.admin.edit_role.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="admin-dialog-form">
          {error && <p className="admin-dialog-error">{error}</p>}
          <div className="admin-form-group">
            <Label>{t('user.admin.edit_role.role_label')}</Label>
            <Select
              onValueChange={(val) => form.setValue('role', val as SiteRoleType)}
              defaultValue={currentRole}
            >
              <SelectTrigger className="admin-select-trigger" data-testid="admin-edit-role-trigger">
                <SelectValue placeholder={t('user.admin.edit_role.role_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN" data-testid="role-option-ADMIN">
                  {t('user.admin.edit_role.roles.admin')}
                </SelectItem>
                <SelectItem value="EMPLOYEE" data-testid="role-option-EMPLOYEE">
                  {t('user.admin.edit_role.roles.employee')}
                </SelectItem>
                <SelectItem value="CONTRACTOR" data-testid="role-option-CONTRACTOR">
                  {t('user.admin.edit_role.roles.contractor')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="admin-cancel-button"
            >
              {t('user.admin.edit_role.cancel_button')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="admin-submit-button"
              data-testid="admin-edit-role-submit"
            >
              {isSubmitting
                ? t('user.admin.edit_role.submitting_button')
                : t('user.admin.edit_role.submit_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
