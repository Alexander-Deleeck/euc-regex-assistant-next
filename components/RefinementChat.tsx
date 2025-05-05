import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Trash2, Send, MessageSquarePlus } from "lucide-react";

/**
 * RefinementChat - Handles regex refinement chat UI.
 * @param {Array<{role: 'user' | 'assistant', content: string}>} chatHistory - Chat messages.
 * @param {boolean} isRefining - Whether refinement is in progress.
 * @param {string} refinementInput - Current input value.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onInputChange - Handler for input change.
 * @param {() => void} onRefine - Handler for sending refinement.
 * @param {() => void} onClear - Handler for clearing chat.
 * @param {boolean} disabled - Whether the chat is disabled.
 */
export interface RefinementChatProps {
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  isRefining: boolean;
  refinementInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefine: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const RefinementChat: React.FC<RefinementChatProps> = ({
  chatHistory,
  isRefining,
  refinementInput,
  onInputChange,
  onRefine,
  onClear,
  disabled,
}) => (
  <Accordion type="single" collapsible disabled={disabled}>
    <AccordionItem value="refine">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          <span>Refine Regex with Chat</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 space-y-4">
        {chatHistory.length === 0 && !isRefining && (
          <p className="text-sm text-muted-foreground">Ask for changes based on test results or new requirements.</p>
        )}
        {/* Chat History Display */}
        <ScrollArea className="h-[200px] w-full rounded-md border p-3 mb-4 bg-muted/40">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-900 ml-4' : 'bg-gray-100 text-gray-800 mr-4'}`}
            >
              <span className="font-bold capitalize">{msg.role}: </span>
              <pre className="whitespace-pre-wrap text-sm">{msg.content}</pre>
            </div>
          ))}
          {isRefining && (
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </ScrollArea>
        {/* Refinement Input */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Eg. It should also match numbers with commas..."
            value={refinementInput}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isRefining) onRefine();
            }}
            disabled={isRefining || disabled}
          />
          <Button onClick={onRefine} disabled={isRefining || !refinementInput.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={onClear}
                disabled={chatHistory.length === 0 || isRefining}
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Chat History</TooltipContent>
          </Tooltip>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default RefinementChat; 