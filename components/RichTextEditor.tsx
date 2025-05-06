// components/RichTextEditor.tsx
'use client';

import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Superscript as SuperscriptIcon, Subscript as SubscriptIcon, Sigma } from 'lucide-react'; // Or another icon for special chars

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle'; // Good for toggle states like sup/sub
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils'; // For conditional classes

// --- Toolbar Component ---
interface ToolbarProps {
    editor: Editor | null;
}

const specialCharacterGroups = [
    {
        label: "Currency",
        chars: [
            '£', '€', '¥', '₽', '₹', '₴', '₦', '₱', '₪', '₫', '₲', '₵', '₡', '₢', '₭', '₮', '₠', '₯', '₤', '₳', '₰', '$', '¢', '₣', '₧', '₨', '₩', '₸', '₺', '₼', '₾', '₿'
        ],
    },
    {
        label: "Math & Science",
        chars: [
            '±', '×', '÷', '≠', '≈', '≡', '≤', '≥', '∞', '∑', '∏', '∫', '√', '∇', '∂', '∈', '∉', '∋', '∅', '∩', '∪', '⊂', '⊃', '⊆', '⊇', '⊕', '⊗', '∃', '∀', '∴', '∵', '∝', '∠', '∟', '∥', '∦', '∧', '∨'
        ],
    },
    {
        label: "Punctuation & Typography",
        chars: [
            '…', '–', '—', '•', '·', '‣', '†', '‡', '′', '″', '‴', '‹', '›', '«', '»', '„', '“', '”', '‘', '’', '‚', '‛', '‐', '‑', '‒', '―'
        ],
    },
    {
        label: "Legal & Copyright",
        chars: [
            '©', '®', '™', '§', '¶', '℗', '℠', '№'
        ],
    },
    {
        label: "Other Symbols",
        chars: [
            '°', 'µ', '†', '‡', '¶', '§', '¤', '¡', '¿', '☑', '☐', '☒', '☼', '☽', '☾', '☁', '☂', '☃', '☄', '★', '☆', '♠', '♣', '♥', '♦', '♭', '♯', '♮', '♂', '♀', '⚥', '⚲', '⚡', '☠', '☢', '☣', '☮', '☯', '☸'
        ],
    },
];

const accentedCharacterGroups = [
    {
        accentedlabel: "Grave Accents",
        chars: ['à', 'è', 'ì', 'ò', 'ù', 'À', 'È', 'Ì', 'Ò', 'Ù'],
    },
    {
        accentedlabel: "Acute Accents",
        chars: ['á', 'é', 'í', 'ó', 'ú', 'ý', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ý'],
    },
    {
        accentedlabel: "Circumflex",
        chars: ['â', 'ê', 'î', 'ô', 'û', 'Â', 'Ê', 'Î', 'Ô', 'Û'],
    },
    {
        accentedlabel: "Tilde",
        chars: ['ã', 'ñ', 'õ', 'Ã', 'Ñ', 'Õ'],
    },
    {
        accentedlabel: "Umlaut/Diaeresis",
        chars: ['ä', 'ë', 'ï', 'ö', 'ü', 'ÿ', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü', 'Ÿ'],
    },
    {
        accentedlabel: "Ring",
        chars: ['å', 'Å'],
    },
    {
        accentedlabel: "Ligatures",
        chars: ['æ', 'Æ', 'œ', 'Œ'],
    },
    {
        accentedlabel: "Other Letters",
        chars: ['ç', 'Ç', 'ð', 'Ð', 'ø', 'Ø', 'ß'],
    },
    {
        accentedlabel: "Punctuation & Misc",
        chars: ['¿', '¡'],
    },
    {
        accentedlabel: "Macron",
        chars: ['Ā', 'ā', 'Ē', 'ē', 'Ī', 'ī', 'Ō', 'ō', 'Ū', 'ū'],
    },
];

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const insertSpecialCharacter = (char: string) => {
        editor.chain().focus().insertContent(char).run();
    };

    return (
        <div className="border border-input bg-transparent rounded-md p-1 flex items-center gap-1 mb-1 flex-wrap">
            {/* Superscript Button */}
            <Toggle
                size="sm"
                pressed={editor.isActive('superscript')}
                onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
                aria-label="Toggle superscript"
            >
                <SuperscriptIcon className="h-4 w-4" />
            </Toggle>

            {/* Subscript Button */}
            <Toggle
                size="sm"
                pressed={editor.isActive('subscript')}
                onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
                aria-label="Toggle subscript"
            >
                <SubscriptIcon className="h-4 w-4" />
            </Toggle>

            {/* Non-breaking Space Button */}
            <div className="relative group">
                <Button
                    variant="outline"
                    size="sm"
                    aria-label="Insert non-breaking space"
                    type="button"
                    onClick={() => insertSpecialCharacter('\u00A0')}
                >
                    nbsp
                </Button>
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-6 mt-1 w-max px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Insert non-breaking space
                </span>
            </div>

            {/* Special Characters Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Insert special character">
                        <Sigma className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-96 overflow-y-auto w-64">
                    {specialCharacterGroups.map((group) => (
                        <div key={group.label} className="mb-2">
                            <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">{group.label}</div>
                            <div className="grid grid-cols-8 gap-1 p-1">
                                {group.chars.map((char) => (
                                    <DropdownMenuItem
                                        key={char}
                                        className="flex items-center justify-center p-1 text-center cursor-pointer hover:bg-accent focus:bg-accent"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            insertSpecialCharacter(char);
                                        }}
                                    >
                                        {char}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Insert accented character">
                        <span className="font-bold">Á</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-96 overflow-y-auto w-64">
                    {accentedCharacterGroups.map((group) => (
                        <div key={group.accentedlabel} className="mb-2">
                            <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">{group.accentedlabel}</div>
                            <div className="grid grid-cols-8 gap-1 p-1">
                                {group.chars.map((char) => (
                                    <DropdownMenuItem
                                        key={char}
                                        className="flex items-center justify-center p-1 text-center cursor-pointer hover:bg-accent focus:bg-accent"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            insertSpecialCharacter(char);
                                        }}
                                    >
                                        {char}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </div>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add other Tiptap buttons (bold, italic, etc.) here if needed from StarterKit */}
            {/* Example:
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      > B </Toggle>
      */}
        </div>
    );
};


// --- Main RichTextEditor Component ---
interface RichTextEditorProps {
    initialContent?: string; // Expecting plain text initially
    onChange: (plainText: string) => void; // Callback with plain text
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent = '', onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable default heading, bold, italic etc. if not needed, or configure them
                heading: false,
                bold: false,
                italic: false,
                strike: false,
                // Keep paragraph, text, document, history etc.
            }),
            Superscript,
            Subscript,
            // Placeholder extension (optional, if using tiptap's placeholder)
            // Placeholder.configure({ placeholder: placeholder || 'Enter description...' })
        ],
        content: initialContent, // Initialize with plain text
        editorProps: {
            attributes: {
                // Apply Tailwind classes for styling the editor area
                class: cn(
                    "prose dark:prose-invert prose-sm sm:prose-base", // Basic prose styling
                    "min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                ),
            },
        },
        onUpdate: ({ editor }) => {
            // Convert editor content (HTML) to plain text for the parent state
            const plainText = editor.getText();
            onChange(plainText);
        },
    });

    return (
        <div className="flex flex-col">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;