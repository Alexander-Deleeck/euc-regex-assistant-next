import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Loader2, FileText, FileDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";

// Import subcomponents (to be created)
// import TextTest from "./TextTest";
// import FileTest from "./FileTest";

/**
 * TestTabs - Renders the test section (text/file tabs) for regex testing.
 * Accepts all state and handlers related to text/file testing and download.
 * For now, just pass all props to subcomponents.
 */
export interface TestTabsProps {
  // Text test props
  testText: string;
  onTestTextChange: (plainText: string) => void;
  onTestText: () => void;
  isTestingText: boolean;
  testResults: any[];
  substitutedText: string;
  testTextError: string;
  editedFindPattern: string;
  editedReplacePattern: string;
  // File test props
  uploadedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessFile: (action: 'test' | 'substitute') => void;
  isFileProcessing: boolean;
  fileMatches: any[];
  fileSubstitutedText: string | null;
  fileError: string;
  onDownloadSubstitutedFile: () => void;
}

const TestTabs: React.FC<TestTabsProps> = (props) => {
  // For now, render the same UI as in app/page.tsx, but will delegate to TextTest and FileTest soon
  const {
    testText,
    onTestTextChange,
    onTestText,
    isTestingText,
    testResults,
    substitutedText,
    testTextError,
    editedFindPattern,
    editedReplacePattern,
    uploadedFile,
    onFileChange,
    onProcessFile,
    isFileProcessing,
    fileMatches,
    fileSubstitutedText,
    fileError,
    onDownloadSubstitutedFile,
  } = props;

  return (
    <>
      <Tabs defaultValue="text" className="flex-shrink-0">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text Test</TabsTrigger>
          <TabsTrigger value="file">File Test</TabsTrigger>
        </TabsList>
        {/* TextTest and FileTest will be extracted next */}
        <TabsContent value="text" className="mt-4 space-y-4">
          {/* TextTest UI here (to be extracted) */}
          <RichTextEditor
            initialContent={testText}
            onChange={onTestTextChange}
            placeholder="Enter text to test the pattern against..."
            //disabled={!editedFindPattern}
          />
          {/* <Textarea
            placeholder="Enter text to test the pattern against..."
            value={testText}
            onChange={onTestTextChange}
            rows={5}
            disabled={!editedFindPattern}
          /> */}
          <Button 
            onClick={onTestText} 
            disabled={isTestingText || !editedFindPattern || !testText}
            className="rounded-lg bg-blue-50 backdrop-blur-md border border-blue-500/50 shadow-sm text-blue-900 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30"
          >
            {isTestingText ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Test on Text
          </Button>
          {testTextError && (
            <Alert variant="destructive">
              <AlertTitle>Test Error</AlertTitle>
              <AlertDescription>{testTextError}</AlertDescription>
            </Alert>
          )}
          {/* Display Text Test Results */}
          {!isTestingText && (testResults.length > 0 || substitutedText) && (
            <div className="space-y-3">
              {testResults.length > 0 && (
                <div>
                  <h4 className="font-medium">Matches Found ({testResults.length}):</h4>
                  <ScrollArea className="h-[150px] border rounded p-2 mt-1 bg-white">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left"><th className="p-1">Match</th><th className="p-1">Start</th><th className="p-1">End</th></tr></thead>
                      <tbody>
                        {testResults.map((m, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-1 font-mono bg-yellow-100">{m.match}</td>
                            <td className="p-1">{m.start}</td>
                            <td className="p-1">{m.end}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
              {testResults.length === 0 && !testTextError && <p className="text-sm text-muted-foreground">No matches found in text.</p>}
              {substitutedText && (
                <div>
                  <h4 className="font-medium">Substituted Text:</h4>
                  <ScrollArea className="h-[100px] border rounded p-2 mt-1 bg-white">
                    <div className="text-sm whitespace-pre-wrap font-mono">
                      {JSON.parse(`"${substitutedText.trim().replace(/"/g, '\"')}"`)}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="file" className="mt-4 space-y-4">
          {/* FileTest UI here (to be extracted) */}
          <label htmlFor="file-upload" className="font-medium block mb-2">Upload .txt or .docx File</label>
          <Input
            id="file-upload"
            type="file"
            accept=".txt,.docx"
            onChange={onFileChange}
            disabled={!editedFindPattern || isFileProcessing}
          />
          {uploadedFile && (
            <p className="text-sm text-muted-foreground">Selected: {uploadedFile.name}</p>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={() => onProcessFile('test')} 
              disabled={isFileProcessing || !uploadedFile || !editedFindPattern}
              className="rounded-lg bg-indigo-50 backdrop-blur-md border border-indigo-500/50 shadow-sm text-indigo-900 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30"
            >
              {isFileProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Test on File
            </Button>
            <Button 
              onClick={() => onProcessFile('substitute')} 
              disabled={isFileProcessing || !uploadedFile || !editedFindPattern || editedReplacePattern === null}
              className="rounded-lg bg-violet-50 backdrop-blur-md border border-violet-500/50 shadow-sm text-violet-900 hover:bg-violet-100 hover:text-violet-700 hover:border-violet-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30"
            >
              {isFileProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Substitute in File
            </Button>
          </div>
          {fileError && (
            <Alert variant="destructive">
              <AlertTitle>File Processing Error</AlertTitle>
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}
          {/* Display File Test Results */}
          {!isFileProcessing && fileMatches.length > 0 && (
            <div>
              <h4 className="font-medium">Matches Found in File ({fileMatches.length}):</h4>
              <ScrollArea className="h-[200px] border rounded p-2 mt-1 bg-white">
                {fileMatches.map((m, i) => (
                  <div key={i} className="mb-2 border rounded p-2 bg-yellow-50">
                    <div className="text-sm font-mono">Match: <span className="bg-yellow-200 px-1 rounded">{m.match}</span> (Index: {m.start})</div>
                    <div className="text-xs text-muted-foreground">Context: <span className="font-mono">{m.context}</span></div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
          {!isFileProcessing && fileMatches.length === 0 && !fileError && uploadedFile && (
            <p className="text-sm text-muted-foreground">No matches found in file.</p>
          )}
          {/* Download Button */}
          {!isFileProcessing && fileSubstitutedText !== null && (
            <Button 
              onClick={onDownloadSubstitutedFile} 
              className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-md border border-green-500/50 shadow-sm text-green-900 hover:from-green-100 hover:to-emerald-100 hover:text-green-700 hover:border-green-600 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white/30"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download Substituted File
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default TestTabs; 