import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export function LanguageSelector() {
    const { i18n } = useTranslation();

    // safe access to supportedLngs
    const languages = Array.isArray(i18n.options?.supportedLngs)
        ? i18n.options.supportedLngs.filter((l) => l !== 'cimode')
        : ['en'];

    const handleLanguageChange = (value: string) => {
        i18n.changeLanguage(value);
        document.cookie = `i18next=${value}; path=/; max-age=31536000`;
    };

    if (languages.length <= 1) return null;

    return (
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="language-select-trigger" data-testid="language-selector-trigger">
                <Globe className="language-select-icon" />
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                {languages.map((lang) => (
                    <SelectItem key={lang} value={lang} data-testid={`language-selector-item-${lang}`}>
                        {lang.toUpperCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
