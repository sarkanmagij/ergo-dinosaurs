import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { applyTheme, readTheme, DEFAULT_THEME, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  useEffect(() => setTheme(readTheme()), []);

  const next: Theme = theme === "night" ? "day" : "night";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      {theme === "night" ? <Sun /> : <Moon />}
    </Button>
  );
}
