"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "../../design/baseComponents/IconButton";

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <IconButton disabled><Sun className="h-5 w-5 opacity-50" /></IconButton>;
    }

    const isDark = theme === "dark";

    return (
        <IconButton
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
            {isDark ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </IconButton>
    );
}
