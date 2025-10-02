'use client';

import Joyride from '@/components/ClientJoyride';
import { useState, useEffect } from 'react';
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Loader2, Sparkles } from 'lucide-react';
import PatternResults from "@/components/PatternResults";
import AppHeader from "@/components/AppHeader";
import TestTabs from "@/components/TestTabs";
import dynamic from 'next/dynamic';
import ConvertSyntaxButton from '@/components/ConvertSyntaxButton';
import ConvertSyntaxResults from '@/components/ConvertSyntaxResults';
import Sidebar from '@/components/Sidebar';
import { createPageJoyrideSteps, joyrideStyles } from '@/config/joyrideSteps';
import { useJoyride } from '@/hooks/useJoyride';

// Dynamically import the Tiptap-based component (client-side only)
const PatternDescriptionEditor = dynamic(
  () => import('@/components/PatternDescriptionEditor'),
  {
    ssr: false,
    loading: () => <div className="h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 animate-pulse"></div>
  }
);

// Type definitions
type ExampleTuple = [string, string];

/**
 * CreatePatternPage - Main page for creating new regex patterns
 * 
 * This page provides an AI-powered interface for generating regex patterns from
 * natural language descriptions. Users can:
 * - Describe patterns in plain text
 * - Provide examples and counter-examples
 * - Configure pattern options (case sensitivity, word boundaries)
 * - Test patterns on text or files
 * - Refine patterns through conversational feedback
 * - Convert patterns to .NET syntax
 */
export default function CreatePatternPage() {
  // --- Sidebar State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // --- Pattern Configuration State ---
  const [description, setDescription] = useState('');
  const [patternExamples, setPatternExamples] = useState<ExampleTuple[]>([['', '']]);
  const [patternNotExamples, setPatternNotExamples] = useState<ExampleTuple[]>([['', '']]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [partOfWord, setPartOfWord] = useState(true);

  // --- Generated Pattern State ---
  const [isLoading, setIsLoading] = useState(false);
  const [findPattern, setFindPattern] = useState('');
  const [replacePattern, setReplacePattern] = useState('');
  const [explanation, setExplanation] = useState('');
  const [basePrompt, setBasePrompt] = useState('');

  // --- Editable Pattern State ---
  const [editedFindPattern, setEditedFindPattern] = useState('');
  const [editedReplacePattern, setEditedReplacePattern] = useState('');

  // --- Text Testing State ---
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [substitutedText, setSubstitutedText] = useState('');
  const [isTestingText, setIsTestingText] = useState(false);
  const [testTextError, setTestTextError] = useState('');

  // --- File Testing State ---
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [fileMatches, setFileMatches] = useState<any[]>([]);
  const [fileSubstitutedText, setFileSubstitutedText] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  // --- Refinement State ---
  const [refinementInput, setRefinementInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  // --- .NET Conversion State ---
  const [dotnetFind, setDotnetFind] = useState('');
  const [dotnetReplace, setDotnetReplace] = useState('');

  // --- Joyride (Tutorial) Hook ---
  const { run: joyrideRun, stepIndex: joyrideStepIndex, startTutorial, handleJoyrideCallback } = useJoyride();


  // --- Effects ---

  /**
   * Sync edited patterns with generated patterns
   */
  useEffect(() => {
    setEditedFindPattern(findPattern);
  }, [findPattern]);

  useEffect(() => {
    setEditedReplacePattern(replacePattern);
  }, [replacePattern]);


  // --- Event Handlers ---

  /**
   * Handler for description changes from the RichTextEditor
   */
  const handleDescriptionChange = (plainText: string) => {
    setDescription(plainText);
  };

  /**
   * Handler for test text changes from the RichTextEditor
   */
  const handleTestTextChange = (plainText: string) => {
    setTestText(plainText);
  };

  /**
   * Add a new example row
   */
  const addExample = (type: 'pattern' | 'not_pattern') => {
    if (type === 'pattern') {
      setPatternExamples([...patternExamples, ['', '']]);
    } else {
      setPatternNotExamples([...patternNotExamples, ['', '']]);
    }
  };

  /**
   * Remove an example row by index
   */
  const removeExample = (type: 'pattern' | 'not_pattern', index: number) => {
    if (type === 'pattern') {
      setPatternExamples(patternExamples.filter((_, i) => i !== index));
    } else {
      setPatternNotExamples(patternNotExamples.filter((_, i) => i !== index));
    }
  };

  /**
   * Update an example row by index
   */
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

  /**
   * Generate regex patterns from AI based on user input
   */
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

  /**
   * Test the regex pattern on sample text
   */
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
      
      if (!testResponse.ok) {
        throw new Error(`Match Test Failed: ${testData.details || testData.error}`);
      }
      setTestResults(testData.matches || []);

      // Substitute Text
      const subResponse = await fetch('/api/substitute-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          findPattern: editedFindPattern, 
          replacePattern: editedReplacePattern, 
          text: testText, 
          caseSensitive 
        }),
      });
      const subData = await subResponse.json();
      
      if (!subResponse.ok) {
        throw new Error(`Substitution Failed: ${subData.details || subData.error}`);
      }
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

  /**
   * Handle file upload change
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileMatches([]);
      setFileSubstitutedText(null);
      setFileError('');
    }
  };

  /**
   * Process uploaded file (test or substitute)
   */
  const handleProcessFile = async (action: 'test' | 'substitute') => {
    if (!uploadedFile || !editedFindPattern) {
      toast.error("Missing Input", {
        description: "Please upload a file and ensure a find pattern exists.",
      });
      return;
    }
    
    if (action === 'substitute' && editedReplacePattern === null) {
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
        body: formData,
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

  /**
   * Download substituted file
   */
  const handleDownloadSubstitutedFile = () => {
    if (!fileSubstitutedText || !uploadedFile) return;

    const blob = new Blob([fileSubstitutedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `substituted_${uploadedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Refine pattern based on user feedback
   */
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
    setRefinementInput('');

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

      setFindPattern(data.findPattern);
      setReplacePattern(data.replacePattern);
      setExplanation(data.explanation);

      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Pattern updated based on your feedback. See the 'Generated JavaScript RegEx' tab for an explanation of the new regex patterns." 
      }]);

      toast.success("Refinement Successful", {
        description: "Pattern refined and updated!",
      });

    } catch (error: any) {
      console.error("Refinement Error:", error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Error refining: ${error.message}` 
      }]);
      toast.error("Refinement Failed", {
        description: error.message,
      });
    } finally {
      setIsRefining(false);
    }
  };

  /**
   * Clear chat history
   */
  const clearChatHistory = () => {
    setChatHistory([]);
    toast.success("Chat History Cleared");
  };

  /**
   * Handler for conversion result
   */
  const handleConvertResult = (result: { dotnetFind: string; dotnetReplace: string }) => {
    setDotnetFind(result.dotnetFind);
    setDotnetReplace(result.dotnetReplace);
  };

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);


  // --- Render ---
  
  return (
    <TooltipProvider>
      <Joyride
        steps={createPageJoyrideSteps}
        run={joyrideRun}
        stepIndex={joyrideStepIndex}
        continuous
        showSkipButton
        showProgress
        styles={joyrideStyles}
        callback={handleJoyrideCallback}
      />
      
      <div className="flex flex-col h-screen">
        <AppHeader 
          isSidebarOpen={sidebarOpen} 
          onToggleSidebar={toggleSidebar} 
          onHelpClick={startTutorial} 
        />
        
        <main className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={sidebarOpen}
            toggle={toggleSidebar}
            description={description}
            onDescriptionChange={handleDescriptionChange}
            patternExamples={patternExamples}
            onPatternExampleChange={(id, value) => updateExample('pattern', id, value)}
            onPatternExampleRemove={(id) => removeExample('pattern', id)}
            onPatternExampleAdd={() => addExample('pattern')}
            patternNotExamples={patternNotExamples}
            onPatternNotExampleChange={(id, value) => updateExample('not_pattern', id, value)}
            onPatternNotExampleRemove={(id) => removeExample('not_pattern', id)}
            onPatternNotExampleAdd={() => addExample('not_pattern')}
            caseSensitive={caseSensitive}
            partOfWord={partOfWord}
            onCaseSensitiveChange={setCaseSensitive}
            onPartOfWordChange={setPartOfWord}
            onGenerate={handleGenerate}
            isLoadingGenerate={isLoading}
            chatHistory={chatHistory}
            isRefining={isRefining}
            refinementInput={refinementInput}
            onRefinementInputChange={setRefinementInput}
            onRefine={handleRefinement}
            onClearChat={clearChatHistory}
            isPatternGenerated={!!findPattern}
            className="joyride-sidebar"
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-3">
            <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden">
              
              {/* Left Column: Pattern Results */}
              <ScrollArea className="h-full">
                <div className="space-y-4 p-1 joyride-pattern-results">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-red-600">Generated JavaScript RegEx</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                      
                      {/* Placeholder for Joyride tutorial */}
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
                      
                      {!isLoading && !findPattern && !joyrideRun && (
                        <p className="text-muted-foreground text-center py-10">
                          Configure and generate a pattern.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Right Column: Test and Convert */}
              <div className="h-full overflow-y-auto joyride-test-tabs">
                <div className="space-y-6 p-1">
                  {(!isLoading && findPattern) && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl text-violet-700">Test Pattern</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <TestTabs
                            testText={testText} 
                            onTestTextChange={handleTestTextChange} 
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
                        </CardContent>
                      </Card>
                      
                      <div className="flex flex-col gap-2">
                        <ConvertSyntaxButton
                          findPattern={editedFindPattern} 
                          replacePattern={editedReplacePattern} 
                          description={description}
                          onResult={handleConvertResult} 
                          disabled={!editedFindPattern}
                        />
                        <div className="flex rounded-lg border border-gray-200 p-2">
                          <ConvertSyntaxResults 
                            dotnetFind={dotnetFind} 
                            dotnetReplace={dotnetReplace} 
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Placeholder for Joyride tutorial */}
                  {(!isLoading && !findPattern && joyrideRun) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-violet-700">Test Pattern</CardTitle>
                      </CardHeader>
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
