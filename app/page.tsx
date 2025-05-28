// app/page.tsx
'use client'; // Mark as Client Component

import Joyride from '@/components/ClientJoyride';
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
import ConvertSyntaxButton from '@/components/ConvertSyntaxButton';
import ConvertSyntaxResults from '@/components/ConvertSyntaxResults';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'; // Added sidebar icons
import Sidebar from '@/components/Sidebar'; // NEW
import { Step } from 'react-joyride';

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

  const [sidebarOpen, setSidebarOpen] = useState(true); // State for sidebar visibility
  const [description, setDescription] = useState(''); // State now holds PLAIN TEXT
  const [patternExamples, setPatternExamples] = useState<ExampleTuple[]>([['', '']]);
  const [patternNotExamples, setPatternNotExamples] = useState<ExampleTuple[]>([['', '']]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [partOfWord, setPartOfWord] = useState(true); // Default to true for part-of-word matching

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

  // .NET regex conversion state
  const [dotnetFind, setDotnetFind] = useState('');
  const [dotnetReplace, setDotnetReplace] = useState('');

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

  const handleTestTextChange = (plainText: string) => {
    setTestText(plainText);
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
    if (!description) return;
    setIsLoading(true);
    setFindPattern('');
    setReplacePattern('');
    setExplanation('');
    setBasePrompt('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          examples: patternExamples,
          notExamples: patternNotExamples,
          caseSensitive,
          partOfWord,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate regex');
      }
      setFindPattern(data.findPattern);
      setReplacePattern(data.replacePattern);
      setExplanation(data.explanation);
      setBasePrompt(data.basePrompt);
      setEditedFindPattern(data.findPattern);
      setEditedReplacePattern(data.replacePattern);
    } catch (error: any) {
      toast.error('Generation Error', { description: error.message });
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
          currentFindPattern: editedFindPattern,
          currentReplacePattern: editedReplacePattern,
          userMessage: currentUserInput,
          caseSensitive,
          partOfWord,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Refinement failed');
      }

      setFindPattern(data.findPattern); // Update main patterns
      setReplacePattern(data.replacePattern);
      setExplanation(data.explanation);
      // Re-generate explanation for the refined pattern
      /* const explanationResponse = await fetch('/api/explain', { // Assuming an /api/explain route exists
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrompt, findPattern: data.findPattern, replacePattern: data.replacePattern }),
      });
      const explanationData = await explanationResponse.json();
      if (explanationResponse.ok) {
        setExplanation(explanationData.explanation);
      } else {
        setExplanation('Could not generate explanation for the refined pattern.');
      } */

      // Add assistant response (just indicating success, actual pattern is updated)
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Pattern updated based on your feedback. See the 'Generated JavaScript RegEx' tab for an explanation of the new regex patterns." }]);


      toast.success("Refinement Successful", {
        description: "Pattern refined and updated!",
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
  const handleRefinementInputChange = (plainText: string) => setRefinementInput(plainText);
  const handleRefinementSend = () => handleRefinement();
  const handleClearChat = () => clearChatHistory();

  // Handler for conversion result
  const handleConvertResult = (result: { dotnetFind: string; dotnetReplace: string }) => {
    setDotnetFind(result.dotnetFind);
    setDotnetReplace(result.dotnetReplace);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [joyrideRun, setJoyrideRun] = useState(false);
  const [joyrideStepIndex, setJoyrideStepIndex] = useState(0);
  const joyrideSteps: Step[] = [
    {
      target: '.joyride-sidebar',
      content: 'This is the sidebar where you configure your pattern.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.joyride-description-section',
      title: (
        <div className="text-cyan-800">
          <h2><strong>Describe your pattern here</strong></h2>
        </div>
      ),
      content: (
        <div className="text-left space-y-2">
            <p>
              Describe your pattern here using plain text or rich text. Try to be as specific as possible.
            
          </p>
          <p>
            For example, if you want to replace short dates (<code>D/M/YY</code>) with long dates (<code>DD/MM/YYYY</code>), but want to ensure that unrelated things in a similar format are matched, you might state your descriptions as follows:
          </p>
          <ul className="pt-2 list-disc pl-5">
            <li>
              <i>"I want a regex pattern that matches short dates in the format <code>D/M/YY</code> or <code>DD/M/YY</code> with long dates <code>DD/MM/YYYY</code>, but ensure that if a similar thing is used with a similar format, but a period <code>'.'</code> as separator, it will not be matched."</i>
            </li>
            <li>
              <i>The pattern should also match short dates with a dash <code>'-'</code> as a separator.</i>
            </li>
            <li>
              <i>The replacement pattern should always use the <code>'/'</code> as a separator.</i>
            </li>
          </ul>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.joyride-options-generate',
      content: 'Select your options and click the button to generate the RegEx patterns.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.joyride-pattern-results',
      content: 'In this section, the generated RegEx patterns will appear, and below you will find a detailed explanation of how the patterns work.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '.joyride-test-tabs',
      content: 'Here you can test the newly generated RegEx patterns on a sample text or on a file you upload.',
      placement: 'left',
      disableBeacon: true,
    },
  ];

  // Main Application UI
  return (
    <TooltipProvider>
      <Joyride
        steps={joyrideSteps}
        run={joyrideRun}
        stepIndex={joyrideStepIndex}
        continuous
        showSkipButton
        showProgress
        styles={{ options: { zIndex: 10000 } }}
        callback={(data) => {
          const { action, index, status, type } = data;
          if (status === 'finished' || status === 'skipped') {
            setJoyrideRun(false);
            setJoyrideStepIndex(0);
          } else if (type === 'step:after' || type === 'error:target_not_found') {
            // User clicked next/prev, so update stepIndex
            if (action === 'next') setJoyrideStepIndex((prev) => prev + 1);
            if (action === 'prev') setJoyrideStepIndex((prev) => prev - 1);
          }
        }}
      />
      <div className="flex flex-col h-screen"> {/* Parent takes full screen height */}
        <AppHeader isSidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} onHelpClick={() => setJoyrideRun(true)} /> {/* Fixed height */}
        <main className="flex flex-1 overflow-hidden"> {/* Main content area is flex now */}
          <Sidebar
            isOpen={sidebarOpen}
            toggle={toggleSidebar}
            description={description}
            onDescriptionChange={handleDescriptionChange}
            patternExamples={patternExamples}
            onPatternExampleChange={handlePatternExampleChange}
            onPatternExampleRemove={handlePatternExampleRemove}
            onPatternExampleAdd={handlePatternExampleAdd}
            patternNotExamples={patternNotExamples}
            onPatternNotExampleChange={handlePatternNotExampleChange}
            onPatternNotExampleRemove={handlePatternNotExampleRemove}
            onPatternNotExampleAdd={handlePatternNotExampleAdd}
            caseSensitive={caseSensitive}
            partOfWord={partOfWord}
            onCaseSensitiveChange={setCaseSensitive}
            onPartOfWordChange={setPartOfWord}
            onGenerate={handleGenerate}
            isLoadingGenerate={isLoading}
            chatHistory={chatHistory}
            isRefining={isRefining}
            refinementInput={refinementInput}
            onRefinementInputChange={handleRefinementInputChange}
            onRefine={handleRefinementSend}
            onClearChat={clearChatHistory}
            isPatternGenerated={!!findPattern}
            className="joyride-sidebar"
          />

          {/* Main Content Area (Right side of sidebar) */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-3">
            {/* Button to toggle sidebar (visible on md screens and up) */}
            <div className="mb-2 md:hidden"> {/* Only show on mobile if sidebar is closed, or always show toggle */}
              <Button variant="outline" size="icon" onClick={toggleSidebar} className="mb-2">
                {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </Button>
            </div>
            {/* If you want a persistent toggle button on desktop in the header,
                 pass toggleSidebar to AppHeader and implement it there.
                 Or place a toggle button here for desktop if sidebar is not static */}

            <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              {/* Left part of the main content (Results) */}
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1 joyride-pattern-results">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-red-600">Generated JavaScript RegEx</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading && <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
                      {!isLoading && findPattern && (
                        <PatternResults
                          findPattern={findPattern} replacePattern={replacePattern} explanation={explanation}
                          editedFindPattern={editedFindPattern} editedReplacePattern={editedReplacePattern}
                          onFindChange={(e) => setEditedFindPattern(e.target.value)}
                          onReplaceChange={(e) => setEditedReplacePattern(e.target.value)}
                          caseSensitive={caseSensitive}
                        />
                      )}
                      {/* Show placeholder if Joyride is running and no pattern yet */}
                      {!isLoading && !findPattern && joyrideRun && (
                        <PatternResults
                          findPattern="\\d+"
                          replacePattern="$1"
                          explanation="This is a placeholder regex and explanation for the walkthrough."
                          editedFindPattern="\\d+"
                          editedReplacePattern="$1"
                          onFindChange={() => {}}
                          onReplaceChange={() => {}}
                          caseSensitive={false}
                        />
                      )}
                      {!isLoading && !findPattern && !joyrideRun && <p className="text-muted-foreground text-center py-10">Configure and generate a pattern.</p>}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Right part of the main content (Test and Convert) */}
              <div className="h-full overflow-y-auto joyride-test-tabs">
                <div className="space-y-6 p-1">
                  {(!isLoading && findPattern) && (
                    <>
                      <Card>
                        <CardHeader><CardTitle className="text-xl text-violet-700">Test Pattern</CardTitle></CardHeader>
                        <CardContent>
                          <TestTabs
                            testText={testText} 
                            onTestTextChange={handleTestTextChange} 
                            onTestText={handleTestText}
                            isTestingText={isTestingText} testResults={testResults} substitutedText={substitutedText} testTextError={testTextError}
                            editedFindPattern={editedFindPattern} editedReplacePattern={editedReplacePattern}
                            uploadedFile={uploadedFile} onFileChange={handleFileChange} onProcessFile={handleProcessFile}
                            isFileProcessing={isFileProcessing} fileMatches={fileMatches} fileSubstitutedText={fileSubstitutedText} fileError={fileError}
                            onDownloadSubstitutedFile={handleDownloadSubstitutedFile}
                          />
                        </CardContent>
                      </Card>
                      <div className="flex flex-col gap-2">
                          <ConvertSyntaxButton
                            findPattern={editedFindPattern} replacePattern={editedReplacePattern} description={description}
                            onResult={handleConvertResult} disabled={!editedFindPattern}
                          />
                          <div className="flex rounded-lg border border-gray-200 p-2">
                            <ConvertSyntaxResults dotnetFind={dotnetFind} dotnetReplace={dotnetReplace} />
                          </div>
                      </div>
                      {/* <Card>
                        <CardHeader><CardTitle className="text-xl text-blue-700">Convert Syntax</CardTitle></CardHeader>
                        <CardContent>
                          <ConvertSyntaxButton
                            findPattern={editedFindPattern} replacePattern={editedReplacePattern} description={description}
                            onResult={handleConvertResult} disabled={!editedFindPattern}
                          />
                          <ConvertSyntaxResults dotnetFind={dotnetFind} dotnetReplace={dotnetReplace} />
                        </CardContent>
                      </Card> */}
                    </>
                  )}
                  {/* Show placeholder if Joyride is running and no pattern yet */}
                  {(!isLoading && !findPattern && joyrideRun) && (
                    <Card>
                      <CardHeader><CardTitle className="text-xl text-violet-700">Test Pattern</CardTitle></CardHeader>
                      <CardContent>
                        <TestTabs
                          testText="Sample text"
                          onTestTextChange={() => {}}
                          onTestText={() => {}}
                          isTestingText={false}
                          testResults={[]}
                          substitutedText=""
                          testTextError=""
                          editedFindPattern="\\d+"
                          editedReplacePattern="$1"
                          uploadedFile={null}
                          onFileChange={() => {}}
                          onProcessFile={() => {}}
                          isFileProcessing={false}
                          fileMatches={[]}
                          fileSubstitutedText={null}
                          fileError=""
                          onDownloadSubstitutedFile={() => {}}
                        />
                      </CardContent>
                    </Card>
                  )}
                  {(!isLoading && !findPattern && !joyrideRun) && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Sparkles className="h-16 w-16 mt-10 mb-4 opacity-50" />
                      <p>Generate a pattern to enable testing and conversion tools.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </TooltipProvider>
  );
}