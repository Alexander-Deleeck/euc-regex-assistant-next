"use client";

import { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Rule } from '@/lib/rules';
import { X } from 'lucide-react';

interface SelectRuleDropdownProps {
  onRuleSelect?: (rule: Rule & { purpose: string; language: string; dictionaryFile: string; dictionaryName: string }) => void;
}

export default function SelectRuleDropdown({ onRuleSelect }: SelectRuleDropdownProps) {
  const [purposes, setPurposes] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<string>();
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>();
  const [dicts, setDicts] = useState<string[]>([]);
  const [dictsForLanguage, setDictsForLanguage] = useState<string | undefined>(undefined);
  const [dictsForPurpose, setDictsForPurpose] = useState<string | undefined>(undefined);
  const [dict, setDict] = useState<string>();
  const [dictName, setDictName] = useState<string>('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleId, setRuleId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  // Load purposes on mount
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/rules/purposes')
      .then((res) => res.json())
      .then((data) => {
        setPurposes(data.purposes || []);
      })
      .catch((error) => {
        console.error('Error loading purposes:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load languages upon purpose change
  useEffect(() => {
    if (!purpose) return;
    // Reset all downstream state FIRST to avoid races
    setLanguage(undefined);
    setDict(undefined);
    setRules([]);
    setRuleId(undefined);
    setDicts([]);
    setDictsForLanguage(undefined);
    setDictsForPurpose(undefined);

    setIsLoading(true);
    fetch(`/api/rules/${purpose}/languages`)
      .then((res) => res.json())
      .then((data) => {
        setLanguages(data.languages || []);
      })
      .catch((error) => {
        console.error('Error loading languages:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [purpose]);

  // Load dictionaries upon language change
  useEffect(() => {
    if (!purpose || !language) return;
    setRuleId(undefined);
    // Reset dependent state first
    setDict(undefined);
    setRules([]);
    setDicts([]);
    setDictsForLanguage(undefined);
    setDictsForPurpose(purpose);

    setIsLoading(true);
    fetch(`/api/rules/${purpose}/${language}/dictionaries`)
      .then((res) => res.json())
      .then((data) => {
        setDicts(data.files || []);
        setDictsForLanguage(language);
      })
      .catch((error) => {
        console.error('Error loading dictionaries:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [purpose, language]);

  // Load rules when dictionary changes
  useEffect(() => {
    if (!purpose || !language || !dict) return;

    // Ensure we only load after dictionaries for the CURRENT purpose & language have been fetched
    if (dictsForPurpose !== purpose) return;
    if (dictsForLanguage !== language) return;

    // Safety check: ensure the dict exists in the current dicts array
    if (dicts.length > 0 && !dicts.includes(dict)) {
      console.warn(`Dictionary ${dict} not found in ${language}, skipping load`);
      setDict(undefined);
      return;
    }
    
    // Reset rule selection when dictionary changes
    setRuleId(undefined);
    
    setIsLoading(true);
    fetch(`/api/rules/${purpose}/${language}/${dict}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load dictionary: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setRules(data.rules || []);
        setDictName(data.name || dict);
      })
      .catch((error) => {
        console.error('Error loading rules:', error);
        setRules([]);
        setDictName('');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [purpose, language, dict, dicts]);

  // Call callback when a rule is chosen
  useEffect(() => {
    if (ruleId && purpose && language && dict && rules.length > 0) {
      const rule = rules.find((r) => r.id === ruleId);
      if (rule && onRuleSelect) {
        onRuleSelect({
          ...rule,
          purpose,
          language,
          dictionaryFile: dict,
          dictionaryName: dictName,
        });
      }
    }
    // omit onRuleSelect from deps to prevent infinite loops
  }, [ruleId, purpose, language, dict, dictName, rules]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Purpose</Label>
        <Select 
          value={purpose} 
          onValueChange={(v) => setPurpose(v)}
          disabled={isLoading || purposes.length === 0}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select purpose"} />
          </SelectTrigger>
          <SelectContent>
            {purposes.map((p) => {
              const allowedPurposes = ['TextReplacement', 'CaseLaw_TextReplacement'];
              const isDisabled = !allowedPurposes.includes(p);
              
              return (
                <SelectItem key={p} value={p} disabled={isDisabled}>
                  <div className="flex items-center gap-2">
                    {isDisabled && <X className="h-4 w-4 text-red-500" />}
                    <span className={isDisabled ? "text-muted-foreground line-through" : ""}>
                      {p}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {purpose && (
        <div>
          <Label>Language</Label>
          <Select 
            value={language} 
            onValueChange={(v) => setLanguage(v)}
            disabled={isLoading || languages.length === 0}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select language"} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {language && (
        <div>
          <Label>Dictionary</Label>
          <Select 
            value={dict} 
            onValueChange={(v) => setDict(v)}
            disabled={isLoading || dicts.length === 0}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select dictionary"} />
            </SelectTrigger>
            <SelectContent>
              {dicts.map((file) => (
                <SelectItem key={file} value={file}>
                  {file.replace('.xml', '')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {dict && rules.length > 0 && (
        <div>
          <Label>Rule</Label>
          <Select 
            value={ruleId} 
            onValueChange={(v) => setRuleId(v)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select rule" />
            </SelectTrigger>
            <SelectContent>
              {rules.map((r, index) => (
                <SelectItem key={`${dict}-${r.id}-${index}`} value={r.id}>
                  <span className="font-mono text-xs">{r.id}</span>
                  {' – '}
                  <span className="text-muted-foreground">{r.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

