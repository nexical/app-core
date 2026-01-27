import "@/lib/core/i18n-client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type ApiError } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import type { User } from "@prisma/client";

const profileSchema = (t: (key: string) => string) => z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    email: z.string().email(t("user.settings.validation.email_invalid")).optional(),
});

type ProfileFormValues = z.infer<ReturnType<typeof profileSchema>>;

interface ProfileFormProps {
    user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema(t)),
        defaultValues: {
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
        },
    });

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            await api.user.updateMe({
                id: user.id,
                ...values,
            });
            toast.success(t("user.settings.profile.success_title"), {
                description: t("user.settings.profile.success_message"),
            });
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = (error as ApiError).body?.error || (error as ApiError).message || t("user.settings.profile.error_message");
            toast.error(t("user.settings.profile.error_title"), {
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("user.settings.profile.title")}</CardTitle>
                <CardDescription>{t("user.settings.profile.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("user.settings.profile.name_label")}</Label>
                        <Input id="name" {...form.register("name")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">{t("user.settings.profile.username_label")}</Label>
                        <Input id="username" {...form.register("username")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t("user.settings.profile.email_label")}</Label>
                        <Input id="email" {...form.register("email")} />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? t("user.auth.login.submitting_button") : t("user.settings.profile.save_button")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
