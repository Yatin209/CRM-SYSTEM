import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
      <Icon size={18} />
    </button>
  );
}

export default ThemeToggle;
