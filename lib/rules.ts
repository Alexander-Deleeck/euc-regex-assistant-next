// lib/rules.ts
import { promises as fs } from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const ROOT = path.join(process.cwd(),'public', 'AllRules');

export interface Rule {
  id: string;
  description: string;
  find: string;
  replace: string;
  active: boolean;
  caseSensitive: boolean;
  endOfParagraph: boolean;
  startOfParagraph: boolean;
  wholeWord: boolean;
  wildcard: boolean;
  wordRule: boolean;
  style?: string;
  normalisedFind?: string;
  normalisedReplace?: string;
}

/**
 * List all top-level directories (purposes) in AllRules
 */
export async function listPurposes(): Promise<string[]> {
  try {
    const entries = await fs.readdir(ROOT, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    console.error('Error listing purposes:', error);
    return [];
  }
}

/**
 * List all language directories within a purpose
 */
export async function listLanguages(purpose: string): Promise<string[]> {
  try {
    const dir = path.join(ROOT, purpose);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    console.error(`Error listing languages for ${purpose}:`, error);
    return [];
  }
}

/**
 * List all XML rule dictionaries within a purpose/language combination
 */
export async function listRuleDictionaries(
  purpose: string,
  language: string
): Promise<string[]> {
  try {
    const dir = path.join(ROOT, purpose, language);
    const entries = await fs.readdir(dir);
    return entries
      .filter((file) => file.toLowerCase().endsWith('.xml'))
      .sort();
  } catch (error) {
    console.error(`Error listing dictionaries for ${purpose}/${language}:`, error);
    return [];
  }
}

/**
 * Load and parse a dictionary XML file, returning all rules
 */
export async function loadDictionary(
  purpose: string,
  language: string,
  fileName: string
): Promise<{ name: string; rules: Rule[] }> {
  try {
    const filePath = path.join(ROOT, purpose, language, fileName);
    const xml = await fs.readFile(filePath, 'utf-8');
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    
    const result = parser.parse(xml);
    
    // Handle both single rule and array of rules
    let rawRules = result.dictionary?.rule;
    if (!rawRules) {
      return { name: result.dictionary?.name || fileName, rules: [] };
    }
    
    // Ensure it's always an array
    if (!Array.isArray(rawRules)) {
      rawRules = [rawRules];
    }
    
    const rules: Rule[] = rawRules.map((r: any) => ({
      id: r.id || '',
      description: r.description || '',
      find: r.find || '',
      replace: r.replace || '',
      active: r.active === 'true',
      caseSensitive: r.caseSensitive === 'true',
      endOfParagraph: r.endOfParagraph === 'true',
      startOfParagraph: r.startOfParagraph === 'true',
      wholeWord: r.wholeWord === 'true',
      wildcard: r.wildcard === 'true',
      wordRule: r.wordRule === 'true',
      style: r.style,
      normalisedFind: r.normalisedFind,
      normalisedReplace: r.normalisedReplace,
    }));
    
    return {
      name: result.dictionary?.name || fileName,
      rules,
    };
  } catch (error) {
    console.error(`Error loading dictionary ${purpose}/${language}/${fileName}:`, error);
    throw error;
  }
}

