"use client";

import { useState } from 'react';
import SelectRuleDropdown from '@/components/SelectRuleDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rule } from '@/lib/rules';
import AppHeader from '@/components/AppHeader';
import XmlRuleMenu from '@/components/XmlRuleMenu';

interface SelectedRuleInfo extends Rule {
    purpose: string;
    language: string;
    dictionaryFile: string;
    dictionaryName: string;
}
export default function RegexTester() {
    const [selectedRule, setSelectedRule] = useState<SelectedRuleInfo | null>(null);
    const [findPattern, setFindPattern] = useState('');
    const [replacePattern, setReplacePattern] = useState('');

    const loadRuleIntoTester = (rule: SelectedRuleInfo) => {
        setSelectedRule(rule);
        setFindPattern(rule.find);
        setReplacePattern(rule.replace);
    };

    const handleRuleChange = (updatedRule: Rule) => {
        if (!selectedRule) return;
        
        const updated: SelectedRuleInfo = {
            ...selectedRule,
            ...updatedRule,
        };
        setSelectedRule(updated);
        setFindPattern(updated.find);
        setReplacePattern(updated.replace);
    };

    return (
        <div className="flex-1 flex flex-col h-full w-full">
            <AppHeader isSidebarOpen={false} />
            <div className="flex-1 flex flex-col content-center w-full p-4 md:p-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-16">
            {/* Left Column: Rule Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Load Rule from AllRules</CardTitle>
                </CardHeader>
                <CardContent>
                    <SelectRuleDropdown onRuleSelect={loadRuleIntoTester} />

                    {selectedRule && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">Loaded:</p>
                            <p className="text-xs text-muted-foreground">
                                {selectedRule.id} - {selectedRule.description}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right Column: Regex Tester */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Find Pattern</label>
                            <input
                                type="text"
                                value={findPattern}
                                onChange={(e) => setFindPattern(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Replace Pattern</label>
                            <input
                                type="text"
                                value={replacePattern}
                                onChange={(e) => setReplacePattern(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-md"
                            />
                        </div>
                        <Button className="w-full">Test Pattern</Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Rule Details Section - Full Width */}
        {selectedRule && (
            <div className="mt-6 px-16">
                <XmlRuleMenu 
                    rule={selectedRule} 
                    onRuleChange={handleRuleChange}
                />
            </div>
        )}
            </div>
        </div>
    );
}
