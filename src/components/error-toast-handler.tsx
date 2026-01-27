import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function ErrorToastHandler() {
    const { t } = useTranslation();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        if (error === "unauthorized") {
            toast.error(t("core.errors.unauthorized.title"), {
                description: t("core.errors.unauthorized.description"),
            });
            // Clean URL
            window.history.replaceState({}, "", "/");
        }
    }, [t]);

    return null;
}
