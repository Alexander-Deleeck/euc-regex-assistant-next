"use client";

import { useState } from 'react';
import SelectRuleDropdown from './SelectRuleDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rule } from '@/lib/rules';

interface SelectedRuleInfo extends Rule {
  purpose: string;
  language: string;
  dictionaryFile: string;
  dictionaryName: string;
}

export default function RuleSelector() {
  const [selectedRule, setSelectedRule] = useState<SelectedRuleInfo | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select a Rule from AllRules</CardTitle>
        </CardHeader>
        <CardContent>
          <SelectRuleDropdown onRuleSelect={setSelectedRule} />
        </CardContent>
      </Card>

      {selectedRule && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Rule Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">ID:</span>{' '}
                <code className="bg-muted px-2 py-0.5 rounded">{selectedRule.id}</code>
              </div>
              <div>
                <span className="font-semibold">Dictionary:</span> {selectedRule.dictionaryName}
              </div>
              <div>
                <span className="font-semibold">Location:</span>{' '}
                {selectedRule.purpose} / {selectedRule.language} / {selectedRule.dictionaryFile}
              </div>
              <div>
                <span className="font-semibold">Description:</span> {selectedRule.description}
              </div>
              <div>
                <span className="font-semibold">Find Pattern:</span>{' '}
                <code className="bg-muted px-2 py-0.5 rounded block mt-1 font-mono text-xs">
                  {selectedRule.find}
                </code>
              </div>
              <div>
                <span className="font-semibold">Replace Pattern:</span>{' '}
                <code className="bg-muted px-2 py-0.5 rounded block mt-1 font-mono text-xs">
                  {selectedRule.replace}
                </code>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="font-semibold">Active:</span>{' '}
                  {selectedRule.active ? '✓' : '✗'}
                </div>
                <div>
                  <span className="font-semibold">Case Sensitive:</span>{' '}
                  {selectedRule.caseSensitive ? '✓' : '✗'}
                </div>
                <div>
                  <span className="font-semibold">Whole Word:</span>{' '}
                  {selectedRule.wholeWord ? '✓' : '✗'}
                </div>
                <div>
                  <span className="font-semibold">Wildcard:</span>{' '}
                  {selectedRule.wildcard ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

