"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme, type Theme } from "@/components/system/ThemeProvider"

import { Button } from "@/components/ui/button"


import { useTranslation } from "react-i18next";

export function ThemeSelector() {
    const { theme, setTheme } = useTheme()
    const { t } = useTranslation()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="mode-toggle-button" data-testid="theme-selector">
            <Sun className="mode-toggle-icon-sun" />
            <Moon className="mode-toggle-icon-moon" />
            <span className="mode-toggle-label-sr-only">{t('core.components.mode_toggle.label')}</span>
        </Button>
    )
}
