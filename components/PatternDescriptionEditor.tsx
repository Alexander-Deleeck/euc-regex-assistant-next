import React from "react";
import RichTextEditor from "@/components/RichTextEditor";

/**
 * PatternDescriptionEditor - Wrapper for the pattern description input.
 * @param {string} initialContent - Initial plain text content.
 * @param {(plainText: string) => void} onChange - Handler for content change.
 * @param {string} placeholder - Placeholder text for the editor.
 */
export interface PatternDescriptionEditorProps {
  initialContent: string;
  onChange: (plainText: string) => void;
  placeholder?: string;
}

const PatternDescriptionEditor: React.FC<PatternDescriptionEditorProps> = ({ initialContent, onChange, placeholder }) => (
  <RichTextEditor
    initialContent={initialContent}
    onChange={onChange}
    placeholder={placeholder}
  />
);

export default PatternDescriptionEditor; 