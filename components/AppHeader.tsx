// components/AppHeader.tsx
'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, HelpCircleIcon , LogOutIcon, PanelLeftOpen, PanelLeftClose, Home } from "lucide-react";
import { handleLogout } from "@/app/actions/auth.actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * AppHeader Component - Application header with navigation and controls
 * 
 * Features:
 * - Sidebar toggle button (only shown if onToggleSidebar is provided)
 * - Application branding (clickable link to homepage)
 * - Help button (only shown if onHelpClick is provided)
 * - Home button (only shown when not on homepage)
 * - Logout button
 */
interface AppHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar?: () => void;
  onHelpClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ isSidebarOpen, onToggleSidebar, onHelpClick }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={onToggleSidebar} className="mr-2 hidden md:flex">
                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </TooltipTrigger>
              <TooltipContent>
                <p>Open/Close the Sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Application Branding */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Sparkles className="h-8 w-8 text-orange-500" />
          <h1 className="text-xl font-semibold text-blue-700">REGEX GENERATOR</h1>
        </Link>

        {/* Help Button - Only show if onHelpClick is provided */}
        {onHelpClick && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            // className="ml-4 bg-emerald-800/80 text-white hover:bg-emerald-600/80 hover:text-emerald-800/80 cursor-pointer " 
            className="ml-4 bg-purple-50 text-purple-900/80 border-purple-500 hover:bg-purple-200/60 hover:text-purple-700/80 cursor-pointer backdrop-blur-md group hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BF5A4F]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30 transition-all duration-300" 
            onClick={onHelpClick}
          >
            <HelpCircleIcon/> Help
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Home Button - Only show when not on homepage */}
        {!isHomePage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/">
                  <Button
                    type="button"
                    variant="ghost"
                    
                    className="rounded-lg bg-white/60 backdrop-blur-md border border-white/30 shadow-sm text-gray-700 hover:text-blue-600 hover:bg-white/70 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30 cursor-pointer group hover:shadow-lg hover:scale-105"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to Home</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      {/* Logout Button */}
      <form action={handleLogout} className="rounded-xl">
        <Button
          variant="ghost"
          type="submit"
          className="rounded-lg bg-white/60 backdrop-blur-md border border-white/30 shadow-sm text-gray-700 hover:text-red-600 hover:bg-white/70 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BF5A4F]/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30 cursor-pointer group hover:shadow-lg hover:scale-105"
        >
          <LogOutIcon className="h-5 w-5 mr-1" />
            Logout
          </Button>
        </form>
      </div>
    </header>
  );
};

export default AppHeader;