import "@/lib/core/i18n-client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "auth-astro/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@modules/user-ui/src/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { config } from "@/lib/core/config";

const loginSchema = (t: (key: string) => string) => z.object({
    identifier: z.string().min(1, t("user.auth.login.validation.identifier_required")),
    password: z.string().min(1, t("user.auth.login.validation.password_required")),
});

type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;

interface LoginFormProps {
    isPublic?: boolean;
}

export function LoginForm({ isPublic }: LoginFormProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const errorParam = params.get("error");

        const mapError = (code: string | null) => {
            if (!code) return t("user.auth.login.error.generic");
            if (code === "CredentialsSignin" || code === "credentials") return t("user.auth.login.error.invalid_credentials");
            if (code === "AccountDeactivated" || code === "AccessDenied" || code === "CallbackRouteError") return t("user.auth.login.error.account_deactivated");
            if (code === "UnverifiedEmail") return t("user.auth.login.error.unverified_email");
            return code;
        };

        if (code || errorParam) {
            setError(mapError(code || errorParam));
        }
    }, [t]);

    const schema = loginSchema(t);
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const params = new URLSearchParams(window.location.search);
            const callbackUrl = params.get("callbackUrl") || "/";

            await signIn("credentials", {
                identifier: values.identifier,
                password: values.password,
                redirect: true,
                callbackUrl,
            } as Record<string, unknown>);
            // Browser redirects on success
        } catch (err: unknown) {
            console.error("Login Error:", err);
            let message = "An unexpected error occurred.";
            try {
                message = t("user.auth.login.error.unexpected");
            } catch (e) {
                // Fallback if i18n fails
            }
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="auth-card">
            <CardHeader>
                <CardTitle className="auth-card-title">{t("user.auth.login.title")}</CardTitle>
                <CardDescription className="auth-card-description">
                    {t("user.auth.login.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form-container" method="POST">
                    {error && (
                        <div id="error-message" className="auth-form-message auth-form-message-error" data-testid="login-error">
                            {error}
                        </div>
                    )}
                    <div className="auth-form-group">
                        <Label htmlFor="identifier">{t("user.auth.login.identifier_label")}</Label>
                        <Input
                            id="identifier"
                            type="text"
                            placeholder={t("user.auth.login.identifier_placeholder", { domain: config.PUBLIC_PRIMARY_DOMAIN })}
                            className="auth-input"
                            data-testid="login-identifier"
                            {...form.register("identifier")}
                        />
                        {form.formState.errors.identifier && (
                            <p className="auth-form-input-error">{form.formState.errors.identifier.message}</p>
                        )}
                    </div>

                    <div className="auth-form-group">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t("user.auth.login.password_label")}</Label>
                            <a href="/forgot-password" className="auth-forgot-password-link">
                                {t("user.auth.login.forgot_password")}
                            </a>
                        </div>
                        <PasswordInput
                            id="password"
                            placeholder="********"
                            className="auth-input"
                            data-testid="login-password"
                            {...form.register("password")}
                        />
                        {form.formState.errors.password && (
                            <p className="auth-form-input-error">{form.formState.errors.password.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="auth-submit-button"
                        data-testid="login-submit"
                        disabled={!hydrated || isSubmitting}
                    >
                        {isSubmitting ? t("user.auth.login.submitting_button") : t("user.auth.login.submit_button")}
                    </Button>

                    <div className="auth-register-link-container">
                        <span className="auth-register-text">{t("user.auth.login.register_text")}</span>
                        <a href="/register" className="auth-link">
                            {t("user.auth.login.register_link")}
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
