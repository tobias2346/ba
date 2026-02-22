
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle('dark', isSystemDark);
    document.documentElement.classList.toggle('light', !isSystemDark);
    setIsDarkMode(isSystemDark);
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', newIsDarkMode);
    document.documentElement.classList.toggle('light', !newIsDarkMode);
    setIsDarkMode(newIsDarkMode);
  }

  if (!mounted) {
    return (
        <div className="w-10 h-10 flex justify-center items-center bg-secondary rounded-lg">
            <Sun className="h-5 w-5" />
        </div>
    )
  }

  return (
    <button className="w-10 h-10 flex justify-center items-center bg-secondary rounded-lg" onClick={toggleTheme}>
      {
        isDarkMode ?
          <Moon color="#2DAFCF" className="h-5 w-5" />
          :
          <Sun className="h-5 w-5" />
      }
    </button>
  )
}
