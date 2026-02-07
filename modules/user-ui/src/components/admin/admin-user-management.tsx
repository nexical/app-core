/* eslint-disable */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api, type ApiError } from '@/lib/api/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { I18nProvider } from '@/components/system/I18nProvider';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Search, RefreshCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { UserActionsMenu } from './user-actions-menu';
import { isSingleMode } from '@modules/user-api/src/config';

import { type User, SiteRole } from '@modules/user-api/src/sdk';
import { Permission } from '@modules/user-api/src/permissions';

function AdminUserManagementContent({ currentUser }: { currentUser?: User }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Invite State
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<SiteRole>(SiteRole.EMPLOYEE);
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.user.list();
      const usersList = Array.isArray(result) ? result : result.data || [];
      setUsers(usersList);
    } catch (e: unknown) {
      console.error('[AdminUserManagement] fetchUsers error:', e);
      const errorMessage =
        (e as ApiError).body?.error ||
        (e as ApiError).message ||
        t('user.admin.user_management.error.unexpected');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await api.user.auth.inviteUser({
        email: inviteEmail,
        role: inviteRole,
      });

      toast.success(t('user.admin.user_management.invite.dialog.success'));
      setInviteOpen(false);
      setInviteEmail('');
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError).body?.error ||
        (err as ApiError).message ||
        t('user.admin.user_management.error.unexpected');
      toast.error(errorMessage);
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();
    return (
      (user.name?.toLowerCase() || '').includes(term) ||
      (user.email?.toLowerCase() || '').includes(term)
    );
  });

  // Ensure we have current user role for permission check
  const role = currentUser?.role || 'ANONYMOUS';
  const canInvite = Permission.check('user:invite', role);
  const isSingleUserMode = isSingleMode();

  return (
    <div className="space-y-6" data-testid="admin-user-management">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-heading-md">{t('user.admin.user_management.title')}</h3>
          <p className="text-subtle">{t('user.admin.user_management.description')}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {!isSingleUserMode && canInvite && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button
                  className="admin-invite-button bg-primary/10 text-primary hover:bg-primary/20 shadow-none py-2 px-4 h-9 font-medium border-none"
                  data-testid="admin-invite-user-button"
                >
                  <UserPlus className="admin-icon-left mr-2 h-4 w-4" />
                  {t('user.admin.user_management.invite.button')}
                </Button>
              </DialogTrigger>
              <DialogContent className="admin-dialog-content" data-testid="admin-invite-dialog">
                <DialogHeader>
                  <DialogTitle data-testid="admin-invite-dialog-title">
                    {t('user.admin.user_management.invite.dialog.title')}
                  </DialogTitle>
                  <DialogDescription>
                    {t('user.admin.user_management.invite.dialog.description')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="admin-form">
                  <div className="admin-form-group">
                    <Label htmlFor="inviteEmail">
                      {t('user.admin.user_management.invite.dialog.email_label')}
                    </Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder={t('user.admin.user_management.invite.dialog.email_placeholder', {
                        domain: import.meta.env.PRIMARY_DOMAIN || 'example.com',
                      })}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="admin-input"
                      data-testid="admin-invite-email"
                    />
                  </div>
                  <div className="admin-form-group">
                    <Label htmlFor="inviteRole">
                      {t('user.admin.user_management.invite.dialog.role_label')}
                    </Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value) => setInviteRole(value as SiteRole)}
                    >
                      <SelectTrigger
                        className="admin-select-trigger"
                        data-testid="admin-invite-role-trigger"
                      >
                        <SelectValue
                          placeholder={t(
                            'user.admin.user_management.invite.dialog.role_placeholder',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">
                          {t('user.admin.user_management.invite.dialog.roles.employee')}
                        </SelectItem>
                        <SelectItem value="CONTRACTOR">
                          {t('user.admin.user_management.invite.dialog.roles.contractor')}
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          {t('user.admin.user_management.invite.dialog.roles.admin')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={inviteLoading}
                      data-testid="admin-invite-submit"
                      className="w-full sm:w-auto"
                    >
                      {inviteLoading
                        ? t('user.admin.user_management.invite.dialog.submitting_button')
                        : t('user.admin.user_management.invite.dialog.submit_button')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={fetchUsers}
            className="admin-refresh-button h-9 w-9"
            data-testid="admin-refresh-button"
          >
            <RefreshCcw className={`admin-refresh-icon h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="admin-search-container max-w-sm w-full">
          <Search className="admin-search-icon left-3 h-4 w-4" />
          <Input
            placeholder={t('user.admin.user_management.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input pl-9"
            data-testid="admin-search-input"
          />
        </div>
      </div>

      {error && <div className="admin-error-alert">Error: {error}</div>}

      <div className="border rounded-md">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="admin-table-row">
              <TableHead className="text-left px-4 py-3 h-11" data-testid="admin-header-username">
                {t('user.admin.user_management.table.username')}
              </TableHead>
              <TableHead className="text-left px-4 py-3 h-11" data-testid="admin-header-email">
                {t('user.admin.user_management.table.email')}
              </TableHead>
              <TableHead className="text-left px-4 py-3 h-11" data-testid="admin-header-name">
                {t('user.admin.user_management.table.name')}
              </TableHead>
              <TableHead className="text-left px-4 py-3 h-11" data-testid="admin-header-role">
                {t('user.admin.user_management.table.role')}
              </TableHead>
              <TableHead className="text-left px-4 py-3 h-11" data-testid="admin-header-status">
                {t('user.admin.user_management.table.status')}
              </TableHead>
              <TableHead className="text-left px-4 py-3 h-11" data-testid="admin-header-joined">
                {t('user.admin.user_management.table.joined')}
              </TableHead>
              <TableHead
                className="admin-cell-actions text-left px-4 py-3 h-11"
                data-testid="admin-header-actions"
              >
                {t('user.admin.user_management.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="admin-table-empty">
                  {t('user.admin.user_management.table.loading')}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="admin-table-empty">
                  {t('user.admin.user_management.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="admin-table-row hover:bg-muted/50"
                  data-testid={`admin-user-row-${user.email}`}
                >
                  <TableCell className="px-4 py-3 text-foreground">
                    {user.username || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {user.name || t('user.admin.user_management.table.na')}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                      className={user.role === 'ADMIN' ? 'admin-badge-role-admin' : ''}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={user.status === 'ACTIVE' ? 'outline' : 'destructive'}
                      className={user.status === 'ACTIVE' ? 'admin-badge-status-active' : ''}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 admin-cell-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 admin-cell-actions">
                    <UserActionsMenu user={user} currentUser={currentUser} onRefresh={fetchUsers} />
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

export function AdminUserManagement({ currentUser }: { i18nData?: any; currentUser?: User }) {
  return <AdminUserManagementContent currentUser={currentUser} />;
}
