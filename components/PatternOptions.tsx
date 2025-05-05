import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

/**
 * PatternOptions - Renders regex options (prefix, suffix, flags, etc).
 * @param {string} prefix - Regex prefix.
 * @param {string} suffix - Regex suffix.
 * @param {boolean} caseSensitive - Case sensitivity flag.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onPrefixChange
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onSuffixChange
 * @param {(checked: boolean) => void} onCaseSensitiveChange
 */
export interface PatternOptionsProps {
  prefix: string;
  suffix: string;
  caseSensitive: boolean;
  onPrefixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuffixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCaseSensitiveChange: (checked: boolean) => void;
}

const PatternOptions: React.FC<PatternOptionsProps> = ({
  prefix,
  suffix,
  caseSensitive,
  onPrefixChange,
  onSuffixChange,
  onCaseSensitiveChange,
}) => (
  <div>
    <Label className="font-medium">Options</Label>
    <div className="grid grid-cols-2 gap-4">
      <Input placeholder="Prefix (regex)" value={prefix} onChange={onPrefixChange} />
      <Input placeholder="Suffix (regex)" value={suffix} onChange={onSuffixChange} />
    </div>
    <div className="flex items-center space-x-2 mt-2">
      <Switch id="case-sensitive" checked={caseSensitive} onCheckedChange={onCaseSensitiveChange} />
      <Label htmlFor="case-sensitive">Case-sensitive</Label>
    </div>
    <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 mt-4">
      <Info className="h-4 w-4 !text-blue-700" />
      <AlertTitle className="text-sm">Note on Flags</AlertTitle>
      <AlertDescription className="text-xs">
        Generated patterns use JavaScript RegExp. The global 'g' flag is used by default for testing/replacement. The case-insensitive 'i' flag is controlled by the 'Case-sensitive' switch. {/* Start/end of paragraph options influence the pattern directly. */}<br />
        <span className="block mt-1">JavaScript's <code>^</code> and <code>$</code> typically match start/end of <em>string</em> by default, unless the multiline <code>m</code> flag is used (which isn't automatically added here currently).</span>
      </AlertDescription>
    </Alert>
  </div>
);

export default PatternOptions; 