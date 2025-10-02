"use client";

import { useState } from 'react';
import SelectRuleDropdown from '@/components/SelectRuleDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rule } from '@/lib/rules';

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    );
}
