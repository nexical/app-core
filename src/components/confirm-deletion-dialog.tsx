"use client"

import * as React from "react"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { useTranslation, Trans } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ConfirmDeletionDialogProps {
    trigger?: React.ReactNode
    itemName: string
    itemType: string
    onConfirm: () => Promise<void>
    open?: boolean
    onOpenChange?: (open: boolean) => void
    confirmLabel?: string
}

export function ConfirmDeletionDialog({
    trigger,
    itemName,
    itemType,
    onConfirm,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    confirmLabel,
}: ConfirmDeletionDialogProps) {
    const { t } = useTranslation()
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = controlledOpen !== undefined

    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = React.useCallback((value: boolean) => {
        if (controlledOnOpenChange) {
            controlledOnOpenChange(value)
        } else {
            setInternalOpen(value)
        }
    }, [controlledOnOpenChange])

    const [isPending, startTransition] = React.useTransition()
    const [confirmName, setConfirmName] = React.useState("")
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (open) {
            setConfirmName("")
            setError(null)
        }
    }, [open])

    const handleDelete = () => {
        if (confirmName !== itemName) return;

        setError(null);
        startTransition(async () => {
            try {
                await onConfirm();
                setOpen(false); // Close on success/completion
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
            }
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (confirmName === itemName) {
                handleDelete();
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="confirm-dialog-content" data-testid="confirm-deletion-dialog-content">
                <DialogHeader>
                    <DialogTitle>{t('core.components.confirm_deletion.title', { itemType })}</DialogTitle>
                    <DialogDescription>
                        <Trans
                            i18nKey="core.components.confirm_deletion.description"
                            values={{ itemName, itemType }}
                            components={{ 0: <span className="confirm-highlight" /> }}
                        />
                    </DialogDescription>
                </DialogHeader>

                <div className="confirm-body">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t('core.common.error')}</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Alert variant="destructive">
                        <AlertTriangle className="confirm-dialog-icon" />
                        <AlertTitle>{t('core.common.warning')}</AlertTitle>
                        <AlertDescription>
                            {t('core.components.confirm_deletion.warning', { itemType })}
                        </AlertDescription>
                    </Alert>

                    <div className="confirm-input-wrapper">
                        <Label className="confirm-instruction" htmlFor="confirm-name">
                            <Trans
                                i18nKey="core.components.confirm_deletion.instruction"
                                values={{ itemName }}
                                components={{ 0: <strong className="confirm-code" /> }}
                            />
                        </Label>
                        <Input
                            id="confirm-name"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={itemName}
                            className="confirm-input"
                            autoComplete="off"
                            data-testid="confirm-deletion-input"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        {t('core.common.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={confirmName !== itemName || isPending}
                        data-testid="confirm-deletion-submit"
                    >
                        {isPending ? (
                            <Loader2 className="confirm-loader" />
                        ) : (
                            <Trash2 className="confirm-button-icon" />
                        )}
                        {confirmLabel || t('core.components.confirm_deletion.confirm', { itemType })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
