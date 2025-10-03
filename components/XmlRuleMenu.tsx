import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Rule } from '@/lib/rules';

interface XmlRuleMenuProps {
  rule: Rule & {
    purpose: string;
    language: string;
    dictionaryFile: string;
    dictionaryName: string;
  };
  onRuleChange?: (updatedRule: Rule) => void;
}

/**
 * XmlRuleMenu Component
 * 
 * Displays a loaded XML rule with all its attributes and patterns.
 * Allows users to view and modify:
 * - Rule patterns (find/replace, normalised versions)
 * - Boolean attributes (active, caseSensitive, wildcard, etc.)
 * - Metadata (id, description, style)
 */
export default function XmlRuleMenu({ rule, onRuleChange }: XmlRuleMenuProps) {
  const [editedRule, setEditedRule] = useState<Rule>(rule);

  // Update local state when prop changes
  useEffect(() => {
    setEditedRule(rule);
  }, [rule]);

  // Handle text input changes
  const handleInputChange = (field: keyof Rule, value: string) => {
    const updated = { ...editedRule, [field]: value };
    setEditedRule(updated);
    onRuleChange?.(updated);
  };

  // Handle boolean toggle changes
  const handleToggleChange = (field: keyof Rule, value: boolean) => {
    const updated = { ...editedRule, [field]: value };
    setEditedRule(updated);
    onRuleChange?.(updated);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Rule Details</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {rule.purpose}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {rule.language}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {rule.dictionaryName}
              </Badge>
            </div>
          </div>
          <Badge 
            variant={editedRule.active ? "default" : "secondary"}
            className={editedRule.active ? "bg-green-600" : "bg-gray-400"}
          >
            {editedRule.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metadata Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Metadata
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="rule-id" className="text-sm font-medium">
                Rule ID
              </Label>
              <Input
                id="rule-id"
                value={editedRule.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="rule-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="rule-description"
                value={editedRule.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 text-sm min-h-[60px]"
                placeholder="Enter rule description..."
              />
            </div>

            <div>
              <Label htmlFor="rule-style" className="text-sm font-medium">
                Style
              </Label>
              <Input
                id="rule-style"
                value={editedRule.style || ''}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className="mt-1 text-sm"
                placeholder="e.g., All"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Patterns Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Patterns
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="rule-find" className="text-sm font-medium">
                Find Pattern
              </Label>
              <Textarea
                id="rule-find"
                value={editedRule.find}
                onChange={(e) => handleInputChange('find', e.target.value)}
                className="mt-1 font-mono text-sm bg-amber-50/50 min-h-[60px]"
                placeholder="Enter find pattern..."
              />
            </div>

            <div>
              <Label htmlFor="rule-replace" className="text-sm font-medium">
                Replace Pattern
              </Label>
              <Textarea
                id="rule-replace"
                value={editedRule.replace}
                onChange={(e) => handleInputChange('replace', e.target.value)}
                className="mt-1 font-mono text-sm bg-green-50/50 min-h-[60px]"
                placeholder="Enter replace pattern..."
              />
            </div>

            {editedRule.normalisedFind && (
              <div>
                <Label htmlFor="rule-normalised-find" className="text-sm font-medium">
                  Normalised Find Pattern
                </Label>
                <Textarea
                  id="rule-normalised-find"
                  value={editedRule.normalisedFind}
                  onChange={(e) => handleInputChange('normalisedFind', e.target.value)}
                  className="mt-1 font-mono text-sm bg-amber-50/30 min-h-[50px]"
                  placeholder="Enter normalised find pattern..."
                />
              </div>
            )}

            {editedRule.normalisedReplace && (
              <div>
                <Label htmlFor="rule-normalised-replace" className="text-sm font-medium">
                  Normalised Replace Pattern
                </Label>
                <Textarea
                  id="rule-normalised-replace"
                  value={editedRule.normalisedReplace}
                  onChange={(e) => handleInputChange('normalisedReplace', e.target.value)}
                  className="mt-1 font-mono text-sm bg-green-50/30 min-h-[50px]"
                  placeholder="Enter normalised replace pattern..."
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Boolean Attributes Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Attributes
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-active" className="text-sm font-medium cursor-pointer">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable/disable this rule
                </p>
              </div>
              <Switch
                id="attr-active"
                checked={editedRule.active}
                onCheckedChange={(checked) => handleToggleChange('active', checked)}
              />
            </div>

            {/* Case Sensitive */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-case" className="text-sm font-medium cursor-pointer">
                  Case Sensitive
                </Label>
                <p className="text-xs text-muted-foreground">
                  Match case exactly
                </p>
              </div>
              <Switch
                id="attr-case"
                checked={editedRule.caseSensitive}
                onCheckedChange={(checked) => handleToggleChange('caseSensitive', checked)}
              />
            </div>

            {/* Wildcard */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-wildcard" className="text-sm font-medium cursor-pointer">
                  Wildcard
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use wildcard matching
                </p>
              </div>
              <Switch
                id="attr-wildcard"
                checked={editedRule.wildcard}
                onCheckedChange={(checked) => handleToggleChange('wildcard', checked)}
              />
            </div>

            {/* Whole Word */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-whole-word" className="text-sm font-medium cursor-pointer">
                  Whole Word
                </Label>
                <p className="text-xs text-muted-foreground">
                  Match whole words only
                </p>
              </div>
              <Switch
                id="attr-whole-word"
                checked={editedRule.wholeWord}
                onCheckedChange={(checked) => handleToggleChange('wholeWord', checked)}
              />
            </div>

            {/* Word Rule */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-word-rule" className="text-sm font-medium cursor-pointer">
                  Word Rule
                </Label>
                <p className="text-xs text-muted-foreground">
                  Apply as word rule
                </p>
              </div>
              <Switch
                id="attr-word-rule"
                checked={editedRule.wordRule}
                onCheckedChange={(checked) => handleToggleChange('wordRule', checked)}
              />
            </div>

            {/* Start of Paragraph */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-start-para" className="text-sm font-medium cursor-pointer">
                  Start of Paragraph
                </Label>
                <p className="text-xs text-muted-foreground">
                  Match at paragraph start
                </p>
              </div>
              <Switch
                id="attr-start-para"
                checked={editedRule.startOfParagraph}
                onCheckedChange={(checked) => handleToggleChange('startOfParagraph', checked)}
              />
            </div>

            {/* End of Paragraph */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="attr-end-para" className="text-sm font-medium cursor-pointer">
                  End of Paragraph
                </Label>
                <p className="text-xs text-muted-foreground">
                  Match at paragraph end
                </p>
              </div>
              <Switch
                id="attr-end-para"
                checked={editedRule.endOfParagraph}
                onCheckedChange={(checked) => handleToggleChange('endOfParagraph', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
