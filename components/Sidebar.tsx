// components/Sidebar.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

// Import your input components (or define them here if they are small)
import PatternDescriptionEditor from './PatternDescriptionEditor'; // Assuming path
import ExampleList from './ExampleList';
import PatternOptions from './PatternOptions';
import RefinementChat from './RefinementChat';

// Props for the sidebar content
interface SidebarContentProps {
    description: string;
    onDescriptionChange: (text: string) => void;
    patternExamples: [string, string][];
    onPatternExampleChange: (id: number, value: [string, string]) => void;
    onPatternExampleRemove: (id: number) => void;
    onPatternExampleAdd: () => void;
    patternNotExamples: [string, string][];
    onPatternNotExampleChange: (id: number, value: [string, string]) => void;
    onPatternNotExampleRemove: (id: number) => void;
    onPatternNotExampleAdd: () => void;
    caseSensitive: boolean;
    partOfWord: boolean;
    onCaseSensitiveChange: (checked: boolean) => void;
    onPartOfWordChange: (checked: boolean) => void;
    onGenerate: () => void;
    isLoadingGenerate: boolean;
    chatHistory: { role: 'user' | 'assistant'; content: string }[];
    isRefining: boolean;
    refinementInput: string;
    onRefinementInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRefine: () => void;
    onClearChat: () => void;
    isPatternGenerated: boolean;
    descriptionPlaceholder?: string;
}

const defaultDescriptionPlaceholder = `Pattern to replace "a digit followed by either regular space or a nonbreaking space or no space, and then the ° character followed by either a lowercase or capital C" with "the digit from the match followed by a non breaking space and the degree Celsius character ℃".`;


const SidebarContent: React.FC<SidebarContentProps> = ({ descriptionPlaceholder = defaultDescriptionPlaceholder, ...props }) => (
    <div className="space-y-6 p-2">
        <Card className="joyride-description-section">
            <CardHeader>
                <CardTitle>1. Describe Your Pattern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <PatternDescriptionEditor
                    initialContent={props.description}
                    onChange={props.onDescriptionChange}
                    placeholder={descriptionPlaceholder}
                />
                <ExampleList
                    examples={props.patternExamples}
                    onChange={props.onPatternExampleChange}
                    onRemove={props.onPatternExampleRemove}
                    onAdd={props.onPatternExampleAdd}
                    labelPrefix="Match" icon="✔️" addButtonLabel="Add Match Example"
                />
                <ExampleList
                    examples={props.patternNotExamples}
                    onChange={props.onPatternNotExampleChange}
                    onRemove={props.onPatternNotExampleRemove}
                    onAdd={props.onPatternNotExampleAdd}
                    labelPrefix="No Match" icon="❌" addButtonLabel="Add No Match Example"
                />
                <Separator />
                <div className="joyride-options-generate">
                  <PatternOptions
                      caseSensitive={props.caseSensitive}
                      partOfWord={props.partOfWord}
                      onCaseSensitiveChange={props.onCaseSensitiveChange}
                      onPartOfWordChange={props.onPartOfWordChange}
                  />
                  <div className="mt-4 ">
                        <Button onClick={props.onGenerate} disabled={props.isLoadingGenerate || !props.description} className="w-full">
                            {props.isLoadingGenerate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Regular Expression
                        </Button>

                  </div>
                  
                </div>
            </CardContent>
        </Card>
        <RefinementChat
            chatHistory={props.chatHistory}
            isRefining={props.isRefining}
            refinementInput={props.refinementInput}
            onInputChange={props.onRefinementInputChange}
            onRefine={props.onRefine}
            onClear={props.onClearChat}
            disabled={!props.isPatternGenerated && !props.isLoadingGenerate}
        />
    </div>
);

interface SidebarProps extends SidebarContentProps {
    isOpen: boolean;
    toggle: () => void;
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, className, ...contentProps }) => {
    return (
        <>
            {/* Overlay for mobile (optional, shown when sidebar is open) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={toggle}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside
                className={`joyride-sidebar fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r
          transition-transform duration-300 ease-in-out 
          md:static md:translate-x-0 
          ${isOpen ? 'translate-x-0 w-full max-w-xs sm:max-w-sm md:w-80 lg:w-96' : '-translate-x-full md:w-0'}`}
            >
                <div className="flex items-center justify-between p-2 border-b md:hidden">
                    <span className="font-semibold">Configure Pattern</span>
                    <Button variant="ghost" size="icon" onClick={toggle}>
                        <PanelLeftClose className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 h-full overflow-y-auto">
                    <ScrollArea className="flex-1"> {/* Scroll area for the content */}
                        {isOpen && <SidebarContent {...contentProps} />}
                    </ScrollArea>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;