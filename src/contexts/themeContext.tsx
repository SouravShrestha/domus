import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themeColors } from "@themes/colors";
import { ThemeMode, ThemeSelection } from "@/types/common";

interface ThemeContextType {
  currentTheme: ThemeMode;
  selectedTheme: ThemeSelection;
  setTheme: (theme: ThemeSelection) => Promise<void>;
  themedColors: typeof themeColors.light;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = "theme";

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeSelection>("system");

  const currentTheme = useMemo<ThemeMode>(() => {
    if (selectedTheme === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return selectedTheme;
  }, [selectedTheme, systemScheme]);

  const themedColors = themeColors[currentTheme];

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setSelectedTheme(stored);
        }
      } catch (err) {
        console.warn("Failed to load theme:", err);
      }
    })();
  }, []);

  const setTheme = useCallback(async (theme: ThemeSelection) => {
    try {
      setSelectedTheme(theme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      console.warn("Failed to save theme:", err);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{ currentTheme, selectedTheme, setTheme, themedColors }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
