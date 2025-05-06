// app/page.tsx
'use client'; // Mark as Client Component

import { useState, useEffect } from 'react';
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
//import { useToast } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Trash2, FileText, FileDown, MessageSquarePlus, Sparkles, LogIn, LogOut, Info, Send } from 'lucide-react'; // Icons
import MarkdownRenderer from "@/components/MarkdownRenderer";
import RichTextEditor from '@/components/RichTextEditor'; // <-- Import the new component
//import PatternDescriptionEditor from "@/components/PatternDescriptionEditor";
import ExampleList from "@/components/ExampleList";
import PatternOptions from "@/components/PatternOptions";
import PatternResults from "@/components/PatternResults";
import AppHeader from "@/components/AppHeader";
import RefinementChat from "@/components/RefinementChat";
import TestTabs from "@/components/TestTabs";
import dynamic from 'next/dynamic'; // <-- Import dynamic

// --- Dynamically import the component using Tiptap ---
const PatternDescriptionEditor = dynamic(
  () => import('@/components/PatternDescriptionEditor'),
  {
    ssr: false, // <-- Disable SSR for this component
    loading: () => <div className="h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 animate-pulse"></div> // Optional loading skeleton
  }
);

// Example Component for dynamic inputs
type ExampleTuple = [string, string];

interface ExampleInputProps {
  id: number;
  value: ExampleTuple;
  onChange: (id: number, value: ExampleTuple) => void;
  onRemove: (id: number) => void;
  labelPrefix: string;
  icon: React.ReactNode;
  isFirst: boolean;
}

function ExampleInput({ id, value, onChange, onRemove, labelPrefix, icon, isFirst }: ExampleInputProps) {
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
      {isFirst && <div className="w-9"></div>} {/* Placeholder for alignment */}
    </div>
  );
}


// Main Page Component
export default function Home() {
  // --- State Variables ---
/*   const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false); */

  const [description, setDescription] = useState(''); // State now holds PLAIN TEXT
  const [patternExamples, setPatternExamples] = useState<ExampleTuple[]>([['', '']]);
  const [patternNotExamples, setPatternNotExamples] = useState<ExampleTuple[]>([['', '']]);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [findPattern, setFindPattern] = useState('');
  const [replacePattern, setReplacePattern] = useState('');
  const [explanation, setExplanation] = useState('');
  const [basePrompt, setBasePrompt] = useState(''); // Store base prompt for refinement

  // Editable patterns in results
  const [editedFindPattern, setEditedFindPattern] = useState('');
  const [editedReplacePattern, setEditedReplacePattern] = useState('');

  // --- Testing State ---
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [substitutedText, setSubstitutedText] = useState('');
  const [isTestingText, setIsTestingText] = useState(false);
  const [testTextError, setTestTextError] = useState('');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [fileMatches, setFileMatches] = useState<any[]>([]);
  const [fileSubstitutedText, setFileSubstitutedText] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  // --- Refinement State ---
  const [refinementInput, setRefinementInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  //const { toast } = useToast();

  // --- Effects ---
  // Update edited patterns when generated patterns change
  useEffect(() => {
    setEditedFindPattern(findPattern);
  }, [findPattern]);

  useEffect(() => {
    setEditedReplacePattern(replacePattern);
  }, [replacePattern]);


  // --- Handlers ---

  // Handler for RichTextEditor changes
  const handleDescriptionChange = (plainText: string) => {
    setDescription(plainText);
  };

  


  const addExample = (type: 'pattern' | 'not_pattern') => {
    if (type === 'pattern') {
      setPatternExamples([...patternExamples, ['', '']]);
    } else {
      setPatternNotExamples([...patternNotExamples, ['', '']]);
    }
  };

  const removeExample = (type: 'pattern' | 'not_pattern', index: number) => {
    if (type === 'pattern') {
      setPatternExamples(patternExamples.filter((_, i) => i !== index));
    } else {
      setPatternNotExamples(patternNotExamples.filter((_, i) => i !== index));
    }
  };

  const updateExample = (type: 'pattern' | 'not_pattern', index: number, value: ExampleTuple) => {
    if (type === 'pattern') {
      const updated = [...patternExamples];
      updated[index] = value;
      setPatternExamples(updated);
    } else {
      const updated = [...patternNotExamples];
      updated[index] = value;
      setPatternNotExamples(updated);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setFindPattern('');
    setReplacePattern('');
    setExplanation('');
    setTestResults([]);
    setSubstitutedText('');
    setChatHistory([]); // Reset chat on new generation
    setBasePrompt('');
    setTestTextError('');
    setFileError('');
    
    console.log("Sending description to API:", description); // For debugging
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description, // Send the plain text description
          examples: patternExamples.filter(ex => ex[0].trim() !== ''), // Send only non-empty examples
          notExamples: patternNotExamples.filter(ex => ex[0].trim() !== ''),
          prefix,
          suffix,
          caseSensitive
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Attempt to parse potential Zod error details
        let errorDetails = data.details || data.error || 'Generation failed';
        if (typeof errorDetails === 'object') {
          try {
            // Try to format Zod errors nicely if they are passed in 'details'
            errorDetails = Object.entries(errorDetails._errors || {})
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            if (!errorDetails) errorDetails = JSON.stringify(data.details); // Fallback
          } catch {
            errorDetails = JSON.stringify(data.details); // Fallback
          }
        }
        throw new Error(String(errorDetails)); // Ensure error message is a string
      }

      setFindPattern(data.findPattern);
      setReplacePattern(data.replacePattern);
      setExplanation(data.explanation);
      setBasePrompt(data.basePrompt); // Store for refinement

      toast.success("Regular expression generated.");

    } catch (error: any) {
      console.error("Generation Error:", error);
      toast.error("Generation Failed", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestText = async () => {
    if (!editedFindPattern || !testText) {
      toast.error("Missing Input", {
        description: "Please provide a find pattern and text to test.",
      });
      return;
    }
    setIsTestingText(true);
    setTestResults([]);
    setSubstitutedText('');
    setTestTextError('');

    try {
      // Test Matches
      const testResponse = await fetch('/api/test-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findPattern: editedFindPattern, testText, caseSensitive }),
      });
      const testData = await testResponse.json();
      if (!testResponse.ok) throw new Error(`Match Test Failed: ${testData.details || testData.error}`);
      setTestResults(testData.matches || []);

      // Substitute Text
      const subResponse = await fetch('/api/substitute-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findPattern: editedFindPattern, replacePattern: editedReplacePattern, text: testText, caseSensitive }),
      });
      const subData = await subResponse.json();
      if (!subResponse.ok) throw new Error(`Substitution Failed: ${subData.details || subData.error}`);
      setSubstitutedText(subData.substitutedText ?? '');

    } catch (error: any) {
      console.error("Text Test Error:", error);
      setTestTextError(error.message);
      toast.error("Text Test Failed", {
        description: error.message,
      });
    } finally {
      setIsTestingText(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileMatches([]);
      setFileSubstitutedText(null);
      setFileError('');
      // Optionally trigger processing immediately or wait for button press
    }
  };

  const handleProcessFile = async (action: 'test' | 'substitute') => {
    if (!uploadedFile || !editedFindPattern) {
      toast.error("Missing Input", {
        description: "Please upload a file and ensure a find pattern exists.",
      });
      return;
    }
    if (action === 'substitute' && editedReplacePattern === null) { // Check specifically for null if needed
      toast.error("Missing Input", {
        description: "Replace pattern is required for substitution.",
      });
      return;
    }

    setIsFileProcessing(true);
    setFileMatches([]);
    setFileSubstitutedText(null);
    setFileError('');

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('findPattern', editedFindPattern);
    formData.append('replacePattern', editedReplacePattern);
    formData.append('caseSensitive', String(caseSensitive));
    formData.append('action', action);


    try {
      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed for FormData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'File processing failed');
      }

      if (action === 'test') {
        setFileMatches(data.matches || []);
        toast.success("File Test Complete", {
          description: `Found ${data.matches?.length || 0} matches.`,
        });
      } else {
        setFileSubstitutedText(data.substitutedText ?? '');
        toast.success("File Substitution Complete", {
          description: "You can now download the result.",
        });
      }

    } catch (error: any) {
      console.error("File Processing Error:", error);
      setFileError(error.message);
      toast.error("File Processing Failed", {
        description: error.message,
      });
    } finally {
      setIsFileProcessing(false);
    }
  };

  const handleDownloadSubstitutedFile = () => {
    if (!fileSubstitutedText || !uploadedFile) return;

    const blob = new Blob([fileSubstitutedText], { type: 'text/plain' }); // Adjust type if needed
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `substituted_${uploadedFile.name}`; // Create a new filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleRefinement = async () => {
    if (!refinementInput.trim() || !basePrompt || !editedFindPattern) {
      toast.error("Missing Input", {
        description: "Please enter feedback and ensure a pattern has been generated.",
      });
      return;
    }

    setIsRefining(true);
    const currentUserInput = refinementInput.trim();
    setChatHistory([...chatHistory, { role: 'user', content: currentUserInput }]);
    setRefinementInput(''); // Clear input field immediately

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt,
          currentFind: editedFindPattern,
          currentReplace: editedReplacePattern,
          feedback: currentUserInput,
          caseSensitive, // Pass current options if refinement should respect them
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Refinement failed');
      }

      setFindPattern(data.findPattern); // Update main patterns
      setReplacePattern(data.replacePattern);
      // Re-generate explanation for the refined pattern
      const explanationResponse = await fetch('/api/explain', { // Assuming an /api/explain route exists
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrompt, findPattern: data.findPattern, replacePattern: data.replacePattern }),
      });
      const explanationData = await explanationResponse.json();
      if (explanationResponse.ok) {
        setExplanation(explanationData.explanation);
      } else {
        setExplanation('Could not generate explanation for the refined pattern.');
      }

      // Add assistant response (just indicating success, actual pattern is updated)
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Pattern updated based on your feedback." }]);


      toast.success("Refinement Successful", {
        description: "Pattern updated.",
      });

    } catch (error: any) {
      console.error("Refinement Error:", error);
      // Add error message to chat? Or just toast
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Error refining: ${error.message}` }]);
      toast.error("Refinement Failed", {
        description: error.message,
      });
    } finally {
      setIsRefining(false);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    toast.success("Chat History Cleared");
  }

  // --- Handlers for modular components ---
  const handlePatternExampleChange = (id: number, value: ExampleTuple) => updateExample('pattern', id, value);
  const handlePatternExampleRemove = (id: number) => removeExample('pattern', id);
  const handlePatternExampleAdd = () => addExample('pattern');
  const handlePatternNotExampleChange = (id: number, value: ExampleTuple) => updateExample('not_pattern', id, value);
  const handlePatternNotExampleRemove = (id: number) => removeExample('not_pattern', id);
  const handlePatternNotExampleAdd = () => addExample('not_pattern');
  const handleRefinementInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setRefinementInput(e.target.value);
  const handleRefinementSend = () => handleRefinement();
  const handleClearChat = () => clearChatHistory();

  // Main Application UI
  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <AppHeader />
        {/* Main Content */}
        <main className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left Column: Inputs & Refinement */}
            <ScrollArea className="max-h-[48vw] pr-3">
              <div className="space-y-6">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>1. Describe Your Pattern</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PatternDescriptionEditor
                      initialContent={description}
                      onChange={handleDescriptionChange}
                      placeholder="Eg. Replace 'one' with '1' followed by a non-breaking space..."
                    />
                    {/* Match Examples */}
                    <ExampleList
                      examples={patternExamples}
                      onChange={handlePatternExampleChange}
                      onRemove={handlePatternExampleRemove}
                      onAdd={handlePatternExampleAdd}
                      labelPrefix="Match"
                      icon="✔️"
                      addButtonLabel="Add Match Example"
                    />
                    {/* No Match Examples */}
                    <ExampleList
                      examples={patternNotExamples}
                      onChange={handlePatternNotExampleChange}
                      onRemove={handlePatternNotExampleRemove}
                      onAdd={handlePatternNotExampleAdd}
                      labelPrefix="No Match"
                      icon="❌"
                      addButtonLabel="Add No Match Example"
                    />
                    <Separator />
                    <PatternOptions
                      prefix={prefix}
                      suffix={suffix}
                      caseSensitive={caseSensitive}
                      onPrefixChange={(e) => setPrefix(e.target.value)}
                      onSuffixChange={(e) => setSuffix(e.target.value)}
                      onCaseSensitiveChange={setCaseSensitive}
                    />
                    <Button onClick={handleGenerate} disabled={isLoading || !description} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Generate Regular Expression
                    </Button>
                  </CardContent>
                </Card>
                {/* Refinement Section */}
                <RefinementChat
                  chatHistory={chatHistory}
                  isRefining={isRefining}
                  refinementInput={refinementInput}
                  onInputChange={handleRefinementInputChange}
                  onRefine={handleRefinementSend}
                  onClear={handleClearChat}
                  disabled={!findPattern && !isLoading}
                />
              </div>
            </ScrollArea>
            {/* Right Column: Results & Testing */}
            <div className="max-h-[48vw] overflow-y-scroll bg-gray-50/50 border rounded-lg p-4 md:p-6 flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Results</h2>
              <ScrollArea className="flex-1 pr-3 -mr-3 mb-6">
                {isLoading && (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoading && findPattern && (
                  <PatternResults
                    findPattern={findPattern}
                    replacePattern={replacePattern}
                    explanation={explanation}
                    editedFindPattern={editedFindPattern}
                    editedReplacePattern={editedReplacePattern}
                    onFindChange={(e) => setEditedFindPattern(e.target.value)}
                    onReplaceChange={(e) => setEditedReplacePattern(e.target.value)}
                    caseSensitive={caseSensitive}
                  />
                )}
                {!isLoading && !findPattern && (
                  <p className="text-muted-foreground text-center py-10">Generate a pattern to see results here.</p>
                )}
              </ScrollArea>
              {/* Test Section */}
              <TestTabs
                testText={testText}
                onTestTextChange={(e) => setTestText(e.target.value)}
                onTestText={handleTestText}
                isTestingText={isTestingText}
                testResults={testResults}
                substitutedText={substitutedText}
                testTextError={testTextError}
                editedFindPattern={editedFindPattern}
                editedReplacePattern={editedReplacePattern}
                uploadedFile={uploadedFile}
                onFileChange={handleFileChange}
                onProcessFile={handleProcessFile}
                isFileProcessing={isFileProcessing}
                fileMatches={fileMatches}
                fileSubstitutedText={fileSubstitutedText}
                fileError={fileError}
                onDownloadSubstitutedFile={handleDownloadSubstitutedFile}
              />
              {/* TODO: Further modularize TextTest, FileTest, DownloadButton as subcomponents of TestTabs */}
            </div>
          </div>
        </main>
        {/* <Toaster /> */}
      </div>
    </TooltipProvider>
  );
}