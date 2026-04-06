interface ThemeSelectorProps {
    currentThemeId?: string;
    ownedThemeIds?: string[];
    userLevel?: number;
    onThemeChange?: (themeId: string) => void;
}
export default function ThemeSelector({ currentThemeId, ownedThemeIds, userLevel, onThemeChange, }: ThemeSelectorProps): import("react").JSX.Element;
export {};
