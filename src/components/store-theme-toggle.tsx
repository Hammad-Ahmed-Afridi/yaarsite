"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreTheme } from "@/components/store-theme-provider"; // Use the new store theme hook

export function StoreThemeToggle() {
  const { storeTheme, setStoreTheme } = useStoreTheme();

  const toggleTheme = () => {
    if (storeTheme === "light") {
      setStoreTheme("dark");
    } else {
      setStoreTheme("light");
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle store theme</span>
    </Button>
  );
}