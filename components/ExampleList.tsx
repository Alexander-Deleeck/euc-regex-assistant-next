import React from "react";
import ExampleInput, { ExampleInputProps } from "./ExampleInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * ExampleList - Renders a list of ExampleInput components with an add button.
 * @param {Array<[string, string]>} examples - List of [example, description] tuples.
 * @param {(index: number, value: [string, string]) => void} onChange - Handler for changing an example.
 * @param {(index: number) => void} onRemove - Handler for removing an example.
 * @param {() => void} onAdd - Handler for adding a new example.
 * @param {string} labelPrefix - Prefix for accessibility labels.
 * @param {React.ReactNode} icon - Icon to display (for future use).
 * @param {string} addButtonLabel - Label for the add button.
 */
export interface ExampleListProps {
  examples: [string, string][];
  onChange: (index: number, value: [string, string]) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  labelPrefix: string;
  icon: React.ReactNode;
  addButtonLabel?: string;
}

const ExampleList: React.FC<ExampleListProps> = ({ examples, onChange, onRemove, onAdd, labelPrefix, icon, addButtonLabel }) => (
  <div className="flex flex-col gap-2 w-full">
    <Label className="font-medium flex items-center gap-1 ">{icon} {labelPrefix} Examples</Label>
    <div className="flex w-full">
      
      <div className="w-full">
        {examples.map((ex, i) => (
          
            <ExampleInput
              key={`${labelPrefix.toLowerCase()}-${i}`}
              id={i}
              value={ex}
              onChange={onChange}
              onRemove={onRemove}
              labelPrefix={labelPrefix}
              icon={icon}
              isFirst={i === 0}
            />
        ))}
      </div>
    
    <div className="flex ">
      <Button variant="outline"  onClick={onAdd}>
        + 
      </Button>
    </div>
    </div>
  </div>
);

export default ExampleList; 