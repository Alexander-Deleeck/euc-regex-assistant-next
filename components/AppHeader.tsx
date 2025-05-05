import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";

/**
 * AppHeader - Top header bar for the app.
 * @param {() => void} onLogout - Handler for logout button.
 */
export interface AppHeaderProps {
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onLogout }) => (
  <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
    <div className="flex items-center gap-2">
      <Sparkles className="h-8 w-8 text-orange-500" />
      <h1 className="text-xl font-semibold text-blue-700">REGEX GENERATOR</h1>
    </div>
    <Button variant="outline" onClick={onLogout} size="sm">
      <LogOut className="mr-2 h-4 w-4" /> Logout
    </Button>
  </header>
);

export default AppHeader; 