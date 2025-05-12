import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownRenderer from "@/components/MarkdownRenderer";

/**
 * PatternResults - Displays the generated regex, replace pattern, and explanation.
 * @param {string} findPattern - The generated find regex pattern.
 * @param {string} replacePattern - The generated replace pattern.
 * @param {string} explanation - Markdown explanation of the pattern.
 * @param {string} editedFindPattern - Editable find pattern value.
 * @param {string} editedReplacePattern - Editable replace pattern value.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onFindChange - Handler for editing find pattern.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onReplaceChange - Handler for editing replace pattern.
 * @param {boolean} caseSensitive - Whether the pattern is case sensitive (for display only).
 */
export interface PatternResultsProps {
  findPattern: string;
  replacePattern: string;
  explanation: string;
  editedFindPattern: string;
  editedReplacePattern: string;
  onFindChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReplaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  caseSensitive: boolean;
}

const PatternResults: React.FC<PatternResultsProps> = ({
  findPattern,
  replacePattern,
  explanation,
  editedFindPattern,
  editedReplacePattern,
  onFindChange,
  onReplaceChange,
  caseSensitive,
}) => (
  <div className="space-y-4">
    {/* Find Pattern */}
    <div>
      <Label htmlFor="find-pattern-edit" className="font-medium">Find Pattern (JavaScript RegExp Body)</Label>
      <Input
        id="find-pattern-edit"
        value={editedFindPattern}
        onChange={onFindChange}
        className="font-mono text-sm mt-1"
        placeholder="Generated find pattern will appear here"
      />
      {/* Optionally display with flags: */}
      {/* <code className="text-sm p-2 bg-gray-100 rounded block mt-1">/{editedFindPattern}/{caseSensitive ? 'g' : 'gi'}</code> */}
    </div>
    {/* Replace Pattern */}
    <div>
      <Label htmlFor="replace-pattern-edit" className="font-medium">Replace Pattern (JavaScript String)</Label>
      <Input
        id="replace-pattern-edit"
        value={editedReplacePattern}
        onChange={onReplaceChange}
        className="font-mono text-sm mt-1"
        placeholder="Generated replace pattern will appear here"
      />
    </div>
    {/* Explanation */}
    <div className="max-h-[400px] overflow-y-scroll"> {/* Or adjust max-h / remove if handled by outer scroll */}
      <Label className="font-medium">Explanation</Label>
      <Card className="mt-1">
        <CardContent className="p-3 text-sm max-w-none whitespace-normal"> {/* Ensure whitespace-normal */}
          <MarkdownRenderer content={explanation || "Explanation will appear here."} />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default PatternResults; 