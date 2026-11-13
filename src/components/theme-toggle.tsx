import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { applyTheme, readTheme, DEFAULT_THEME, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  useEffect(() => setTheme(readTheme()), []);

  const next: Theme = theme === "night" ? "day" : "night";
  const label = next === "day" ? t.switchToDay : t.switchToNight;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      {theme === "night" ? <Sun /> : <Moon />}
    </Button>
  );
}
