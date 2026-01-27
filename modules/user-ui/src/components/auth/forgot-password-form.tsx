import "@/lib/core/i18n-client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type ApiError } from "@/lib/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { config } from "@/lib/core/config";

const forgotSchema = (t: (key: string) => string) => z.object({
    email: z.string().email(t("user.auth.forgot_password.validation.email_invalid")),
});

type ForgotFormValues = z.infer<ReturnType<typeof forgotSchema>>;

export function ForgotPasswordForm() {
    const { t } = useTranslation();
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    const schema = forgotSchema(t);

    const form = useForm<ForgotFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: ForgotFormValues) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            await api.user.auth.requestPasswordReset({ email: values.email });
            // Success (or faked success)
            setSuccess(true);

        } catch (err: unknown) {
            const errorMessage = (err as ApiError).body?.error || (err as ApiError).message || t("user.auth.forgot_password.error.unexpected");
            setServerError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <Card className="auth-card">
                <CardHeader>
                    <CardTitle className="auth-card-title">{t("user.auth.forgot_password.success_title")}</CardTitle>
                    <CardDescription className="auth-card-description" data-testid="forgot-password-success">
                        {t("user.auth.forgot_password.success_description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="auth-success-message-container">
                    <a href="/login">
                        <Button variant="outline" className="auth-return-button">
                            {t("user.auth.forgot_password.return_to_login")}
                        </Button>
                    </a>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle className="auth-card-title">{t("user.auth.forgot_password.title")}</CardTitle>
                <CardDescription className="auth-card-description">
                    {t("user.auth.forgot_password.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form-container" method="POST">
                    {serverError && (
                        <div className="auth-form-message auth-form-message-error" data-testid="forgot-password-error">
                            {serverError}
                        </div>
                    )}
                    <div className="auth-form-group">
                        <Label htmlFor="email">{t("user.auth.forgot_password.email_label")}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("user.auth.forgot_password.email_placeholder", { domain: config.PUBLIC_PRIMARY_DOMAIN })}
                            className="auth-input"
                            data-testid="forgot-password-email"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="auth-form-input-error">{form.formState.errors.email.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="auth-submit-button"
                        data-testid="forgot-password-submit"
                        disabled={!hydrated || isSubmitting}
                    >
                        {isSubmitting ? t("user.auth.forgot_password.submitting_button") : t("user.auth.forgot_password.submit_button")}
                    </Button>

                    <div className="auth-back-link-container">
                        <a href="/login" className="auth-link" data-testid="forgot-password-back-link">
                            {t("user.auth.forgot_password.back_to_login")}
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
