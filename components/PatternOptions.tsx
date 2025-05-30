import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

/**
 * PatternOptions - Renders regex options (prefix, suffix, flags, etc).
 * @param {boolean} caseSensitive - Case sensitivity flag.
 * @param {boolean} partOfWord - Part of word flag.
 * @param {(checked: boolean) => void} onCaseSensitiveChange
 * @param {(checked: boolean) => void} onPartOfWordChange
 */
export interface PatternOptionsProps {
  caseSensitive: boolean;
  partOfWord: boolean;
  onCaseSensitiveChange: (checked: boolean) => void;
  onPartOfWordChange: (checked: boolean) => void;
}

const PatternOptions: React.FC<PatternOptionsProps> = ({
  caseSensitive,
  partOfWord,
  onCaseSensitiveChange,
  onPartOfWordChange,
}) => (
  <div>
    <Label className="font-medium">Options</Label>
    <div className="flex items-center space-x-4 mt-2">
      <div className="flex items-center space-x-2">
        <Switch id="case-sensitive" checked={caseSensitive} onCheckedChange={onCaseSensitiveChange} />
        <Label htmlFor="case-sensitive">Case-sensitive</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="part-of-word" checked={partOfWord} onCheckedChange={onPartOfWordChange} />
        <Label htmlFor="part-of-word">{partOfWord ? 'Part of Word' : 'Entire Word'}</Label>
      </div>
    </div>
   {/*  <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 mt-4">
      <Info className="h-4 w-4 !text-blue-700" />
      <AlertTitle className="text-sm">Note on Generated Regex Patterns</AlertTitle>
      <AlertDescription className="mt-1 text-sm">
        The generated regex patterns use the JavaScript RegEx Syntax, while OJ-formatter and other EUC tools work with .NET RegEx Syntax.
        <br />
        <br />
        Therefore, if you want to use the generated regex pattern with OJ-formatter or other EUC tools, you will need to convert the pattern to .NET RegEx Syntax by pressing the "Convert to .NET RegEx" button.
        The global 'g' flag is used by default for testing/replacement. The case-insensitive 'i' flag is controlled by the 'Case-sensitive' switch. 
        <span className="block mt-1">JavaScript's <code>^</code> and <code>$</code> typically match start/end of <em>string</em> by default, unless the multiline <code>m</code> flag is used (which isn't automatically added here currently).</span><br />
        <span className="block mt-1 font-semibold">Word Matching:</span>
        <span className="block">Toggle "Part of Word" to allow matches inside words. Toggle off for entire word matches only (using <code>\b</code> word boundaries in regex).</span>
      </AlertDescription>
    </Alert> */}
  </div>
);

export default PatternOptions; 