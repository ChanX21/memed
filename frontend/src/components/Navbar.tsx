import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";
import { Moon, Sun, Swords, Trophy } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from "../assets/memedlogo2.png";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoMdMenu } from "react-icons/io";

const BNBBranding = () => (
  <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
    <span className="text-sm">Powered by</span>
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#F3BA2F]/10 hover:bg-[#F3BA2F]/20 transition-colors">
      <img
        src="https://cryptologos.cc/logos/bnb-bnb-logo.png"
        alt="BNB Chain"
        className="w-5 h-5"
      />
      <span className="text-[#F3BA2F] font-medium">BNB</span>
    </div>
  </div>
);

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: "Battles", href: "/battles", icon: Swords },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg transition-all duration-300">
      <div className="container flex h-24 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          {/* Logo as home button */}
          <Link
            to="/"
            className="flex items-center gap-2 animate-levitate-slow"
          >
            <img
              src={logo}
              alt="Memed Logo"
              className="h-20 w-auto transition-transform duration-200 hover:scale-110"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Add BNB Chain branding here */}
          <BNBBranding />

          <div className="transition-transform duration-200 hover:scale-105">
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-2 transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:text-primary"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 transition-colors duration-200" />
            ) : (
              <Moon className="h-5 w-5 transition-colors duration-200" />
            )}
          </Button>

          <div className="fixed top-28 right-2 bg-background lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="border p-1 rounded-md  outline-none">
                <IoMdMenu size={30} />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="border-none shadow-xl ">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`p-3 rounded-full transition-all duration-200
                      ${
                        location.pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      }
                    `}
                  >
                    <DropdownMenuItem>
                      {" "}
                      <item.icon className="w-5 h-5" /> {item.name}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {/* <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/95 backdrop-blur-lg rounded-full border border-border/40 shadow-lg">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`p-3 rounded-full transition-all duration-200
              ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }
            `}
          >
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
      </div> */}
    </nav>
  );
}
