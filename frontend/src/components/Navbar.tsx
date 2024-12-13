import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import logo from "../assets/memedlogo2.png";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg transition-all duration-300">
      <div className="container flex h-24 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Memed Logo" 
              className="h-20 w-auto transition-transform duration-200 hover:scale-110" 
            />           
          </a>
        </div>

        <div className="flex items-center gap-4">
          <div className="transition-transform duration-200 hover:scale-110">
            <ConnectButton />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-2 transition-transform duration-200 hover:scale-110"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500 transition-colors duration-200" />
            ) : (
              <Moon className="h-5 w-5 text-blue-500 transition-colors duration-200" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
} 