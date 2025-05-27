import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface ConvertSyntaxResultsProps {
  dotnetFind: string;
  dotnetReplace: string;
}

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  } catch {
    toast.error(`Failed to copy ${label}.`);
  }
};

const ConvertSyntaxResults: React.FC<ConvertSyntaxResultsProps> = ({ dotnetFind, dotnetReplace }) => {
  if (!dotnetFind && !dotnetReplace) return null;
  return (
    <div className="flex flex-col p-4 space-y-4 min-w-full">
      <div className="flex flex-col ">
        
          <span className="font-medium">.NET Find Pattern</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => copyToClipboard(dotnetFind, '.NET Find Pattern')}
            disabled={!dotnetFind}
            aria-label="Copy .NET Find Pattern"
          >
            <Copy className="h-4 w-4" />
          </Button>
        
        <div className="font-mono  bg-gray-100 rounded p-2 text-sm break-all border">
          {dotnetFind || <span className="text-muted-foreground">No .NET find pattern.</span>}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">.NET Replace Pattern</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => copyToClipboard(dotnetReplace, '.NET Replace Pattern')}
            disabled={!dotnetReplace}
            aria-label="Copy .NET Replace Pattern"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="font-mono bg-gray-100 rounded p-2 text-sm break-all border">
          {dotnetReplace || <span className="text-muted-foreground">No .NET replace pattern.</span>}
        </div>
      </div>
    </div>
  );
};

export default ConvertSyntaxResults;
