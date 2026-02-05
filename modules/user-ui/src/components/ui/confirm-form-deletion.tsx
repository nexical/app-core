import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface ConfirmFormDeletionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resourceName: string;
  resourceIdentifier: string;
  onConfirm: () => void;
}

export function ConfirmFormDeletion({
  isOpen,
  onOpenChange,
  resourceName,
  resourceIdentifier,
  onConfirm,
}: ConfirmFormDeletionProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const isMatch =
    confirmationInput.trim() === resourceIdentifier || confirmationInput.trim() === 'DELETE';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {resourceName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This action cannot be undone. This will permanently delete the{' '}
              <span className="font-medium text-foreground">{resourceName}</span> with identifier{' '}
              <span className="font-mono text-destructive">{resourceIdentifier}</span>.
            </p>
            <p>
              Please type{' '}
              <span className="font-mono font-bold select-all">{resourceIdentifier}</span> (or
              &apos;DELETE&apos;) to confirm.
            </p>
            <Input
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={`Type ${resourceIdentifier} to confirm`}
              className="mt-2"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmationInput('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              if (!isMatch) {
                e.preventDefault();
                return;
              }
              onConfirm();
              setConfirmationInput('');
            }}
            disabled={!isMatch}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
