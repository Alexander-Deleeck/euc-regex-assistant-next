// components/AppHeader.tsx
'use client'; // Ensure this is present

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";
import { handleLogout } from "@/app/actions/auth.actions"; // <-- Import the server action

const AppHeader = () => {
  // NO inline 'logoutAction' function here

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Sparkles className="h-8 w-8 text-orange-500" />
        <h1 className="text-xl font-semibold text-blue-700">REGEX GENERATOR</h1>
      </div>
      {/* Use the imported server action directly in the form */}
      <form action={handleLogout}>
        <Button type="submit" variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </form>
    </header>
  );
};

export default AppHeader;