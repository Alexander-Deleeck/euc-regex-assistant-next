// components/AppHeader.tsx
'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, PanelLeftOpen, PanelLeftClose } from "lucide-react"; // Added sidebar icons
import { handleLogout } from "@/app/actions/auth.actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AppHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onHelpClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ isSidebarOpen, onToggleSidebar, onHelpClick }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger  onClick={onToggleSidebar} className="mr-2 hidden md:flex">
                  {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                
              </TooltipTrigger>
                <TooltipContent>
                  <p>Open/Close the Sidebar</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
        )}
        
        <Sparkles className="h-8 w-8 text-orange-500" />
        <h1 className="text-xl font-semibold text-blue-700">REGEX GENERATOR</h1>

        <Button type="button" variant="outline" size="sm" className="ml-4 bg-emerald-800/80 text-white hover:bg-emerald-600/80" onClick={onHelpClick}>
          Help
        </Button>
      </div>
      <form action={handleLogout}>
        <Button type="submit" variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </form>
    </header>
  );
};

export default AppHeader;