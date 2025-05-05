import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";

/**
 * ExampleInput - A reusable input row for pattern examples.
 * @param {number} id - The index of the example.
 * @param {[string, string]} value - The [example, description] tuple.
 * @param {(id: number, value: [string, string]) => void} onChange - Handler for value change.
 * @param {(id: number) => void} onRemove - Handler for removing the example.
 * @param {string} labelPrefix - Prefix for accessibility labels.
 * @param {React.ReactNode} icon - Icon to display (not used in UI, but available for future use).
 * @param {boolean} isFirst - If true, disables remove button for the first row.
 */
export interface ExampleInputProps {
  id: number;
  value: [string, string];
  onChange: (id: number, value: [string, string]) => void;
  onRemove: (id: number) => void;
  labelPrefix: string;
  icon: React.ReactNode;
  isFirst: boolean;
}

const ExampleInput: React.FC<ExampleInputProps> = ({ id, value, onChange, onRemove, labelPrefix, icon, isFirst }) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="flex-1">
        <Label htmlFor={`example-${id}`} className="sr-only">{`${labelPrefix} Example ${id + 1}`}</Label>
        <Input
          id={`example-${id}`}
          placeholder="Example text"
          value={value[0]}
          onChange={(e) => onChange(id, [e.target.value, value[1]])}
          aria-label={`${labelPrefix} Example ${id + 1}`}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor={`desc-${id}`} className="sr-only">{`${labelPrefix} Description ${id + 1}`}</Label>
        <Input
          id={`desc-${id}`}
          placeholder="Description (optional)"
          value={value[1]}
          onChange={(e) => onChange(id, [value[0], e.target.value])}
          aria-label={`${labelPrefix} Description ${id + 1}`}
        />
      </div>
      {!isFirst && (
        <Button variant="ghost" size="icon" onClick={() => onRemove(id)} aria-label={`Remove ${labelPrefix} ${id + 1}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {isFirst && <div className="w-9"></div>}
    </div>
  );
};

export default ExampleInput; 