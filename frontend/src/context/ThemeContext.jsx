import { createContext, useState, useContext } from "react";

// Step 1: create a context - think of it as a shared box of data
const ThemeContext = createContext();

// Step 2: this component puts the theme value INTO the box.
// Every page or component placed inside <ThemeProvider> can read from the box.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Step 3: a shortcut so any component can read the box in one line
export function useTheme() {
  return useContext(ThemeContext);
}
