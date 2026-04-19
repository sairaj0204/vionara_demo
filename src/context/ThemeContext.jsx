import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getThemeApi } from '../services/api';

const DEFAULT_THEME = {
    primaryColor: '#C9A14A',
    bgColor: '#FFFFFF',
    textColor: '#121212',
    secondaryColor: '#999999',
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const applyThemeToDOM = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor || DEFAULT_THEME.primaryColor);
    root.style.setProperty('--theme-bg', theme.bgColor || DEFAULT_THEME.bgColor);
    root.style.setProperty('--theme-text', theme.textColor || DEFAULT_THEME.textColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor || DEFAULT_THEME.secondaryColor);
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [themeLoading, setThemeLoading] = useState(true);

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const { data } = await getThemeApi();
                if (data.success && data.theme) {
                    setTheme(data.theme);
                    applyThemeToDOM(data.theme);
                } else {
                    applyThemeToDOM(DEFAULT_THEME);
                }
            } catch {
                // Fail silently — use defaults
                applyThemeToDOM(DEFAULT_THEME);
            } finally {
                setThemeLoading(false);
            }
        };
        fetchTheme();
    }, []);

    const updateTheme = useCallback((newTheme) => {
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, themeLoading, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
