'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, HelpCircleIcon, Edit, FileSearch, ArrowRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

/**
 * Homepage Component - Welcome screen for the EUC Regex Assistant
 * Provides navigation to the main features: Create and Modify
 */
export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
      <AppHeader isSidebarOpen={false} />
      
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
      </div>
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              EUC Regex Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent companion for creating, testing, and managing regular expressions. 
              Powered by AI to simplify complex pattern matching.
            </p>
      </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Create Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary cursor-pointer justify-between"
                  onClick={() => router.push('/create')}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
    </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
                <CardTitle className="text-2xl">Create New Pattern</CardTitle>
                <CardDescription className="text-base mt-2">
                  Generate regex patterns from natural language descriptions with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Describe your pattern in plain text</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Provide examples for better accuracy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Test patterns on sample text or files</span>
            </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Refine patterns with conversational feedback</span>
            </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Convert to .NET regex syntax</span>
            </li>
          </ul>
                <Button 
                  className="w-full mt-6 cursor-pointer " 
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/create');
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
                    </CardContent>
                  </Card>

            {/* Modify Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary cursor-pointer justify-between"
                  onClick={() => router.push('/modify')}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-2xl">Modify Existing Rules</CardTitle>
                <CardDescription className="text-base mt-2">
                  Browse and edit regex rules from the AllRules dictionary library
                </CardDescription>
              </CardHeader>
                        <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Browse rules by purpose and language</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Load pre-existing patterns instantly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Test and validate existing rules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Modify patterns to fit your needs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Export modified rule dictionaries</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 cursor-pointer" 
                  size="lg" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/modify');
                  }}
                >
                  Browse Rules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                        </CardContent>
                      </Card>
                          </div>

          {/* Info Section */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSearch className="mr-2 h-5 w-5" />
                About This Tool
              </CardTitle>
            </CardHeader>
                        <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">What is this?</h3>
                  <p className="text-muted-foreground">
                    The EUC Regex Assistant is designed to simplify the creation and management of 
                    regular expressions for text processing workflows. Whether you're creating new patterns 
                    from scratch or working with existing rule libraries, this tool streamlines your workflow.
                  </p>
                    </div>
                <div>
                  <h3 className="font-semibold mb-2">Who is it for?</h3>
                  <p className="text-muted-foreground">
                    Built for technical writers, data processors, and developers working with text transformation 
                    and validation. Perfect for teams managing large collections of regex rules across multiple 
                    languages and document types.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              <strong>Tip:</strong> Click the <HelpCircleIcon className="inline h-4 w-4 mb-1 mx-1" /> help icon in any page 
              to start an interactive walkthrough of the features.
            </p>
            </div>
          </div>
        </main>
      </div>
  );
}
