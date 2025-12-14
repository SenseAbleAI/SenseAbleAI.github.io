import { TextHighlight, Suggestion, FamiliarityLevel } from '../types';
import exampleTextsData from './exampleTexts.json';

/**
 * Mock data for text analysis and rephrase suggestions
 * Loads from JSON file for easy demo content management
 */

// Map JSON tag names to FamiliarityLevel type
const tagMapping: Record<string, FamiliarityLevel> = {
  'not_familiar': 'not-familiar',
  'somewhat_familiar': 'somewhat-familiar',
  'familiar': 'familiar',
};

/**
 * Get example text by ID (defaults to first example)
 */
export const getExampleById = (id: number = 1) => {
  return exampleTextsData.examples.find(ex => ex.id === id) || exampleTextsData.examples[0];
};

/**
 * Get all available examples
 */
export const getAllExamples = () => {
  return exampleTextsData.examples;
};

/**
 * Convert JSON tagged phrases to TextHighlight format
 */
export const getHighlightsFromExample = (exampleId: number = 1): TextHighlight[] => {
  const example = getExampleById(exampleId);

  // Parse tags from the original_text
  const { highlights } = parseTaggedText(example.original_text);
  return highlights;
};

/**
 * Get suggestions from JSON example data
 */
export const getSuggestionsFromExample = (exampleId: number = 1): Suggestion[] => {
  const example = getExampleById(exampleId);
  const { highlights, cleanText } = parseTaggedText(example.original_text);

  return example.tagged_phrases.map((phrase, index) => {
    // Find the corresponding highlight to get position
    const highlight = highlights.find(h => h.text === phrase.phrase);

    return {
      phrase: phrase.phrase,
      alternatives: [phrase.simpler],
      position: highlight ? { start: highlight.start, end: highlight.end } : { start: 0, end: 0 },
      tag: tagMapping[phrase.tag],
      explanation: phrase.explanation || 'Consider using simpler language for better clarity.',
    };
  });
};

/**
 * Remove all tags from text
 */
export const cleanTaggedText = (taggedText: string): string => {
  return taggedText.replace(/<(nf|sf|f|u)>(.*?)<\/\1>/g, '$2');
};

/**
 * Parse tagged text and extract highlights
 */
const parseTaggedText = (taggedText: string): { cleanText: string, highlights: TextHighlight[] } => {
  const highlights: TextHighlight[] = [];
  let cleanText = taggedText;
  let offset = 0;

  // Regular expression to match tags: <nf>text</nf>, <sf>text</sf>, <f>text</f>
  const tagPattern = /<(nf|sf|f)>(.*?)<\/\1>/g;
  let match;
  let idCounter = 0;

  // Create a copy for regex matching
  const textForMatching = taggedText;

  while ((match = tagPattern.exec(textForMatching)) !== null) {
    const [fullMatch, tag, content] = match;
    const tagType = tag === 'nf' ? 'not-familiar' : tag === 'sf' ? 'somewhat-familiar' : 'familiar';

    // Calculate position in clean text (accounting for already removed tags)
    const matchStart = match.index - offset;
    const contentStart = matchStart;
    const contentEnd = contentStart + content.length;

    highlights.push({
      id: `highlight-${idCounter++}-${contentStart}`,
      start: contentStart,
      end: contentEnd,
      text: content,
      familiarityLevel: tagType as FamiliarityLevel,
    });

    // Update offset by the length of tags removed
    offset += fullMatch.length - content.length;
  }

  // Remove all tags from text
  cleanText = taggedText.replace(/<(nf|sf|f)>(.*?)<\/\1>/g, '$2');

  return { cleanText, highlights };
};

/**
 * Analyzes text and returns highlights for complex phrases
 * Uses JSON data if text matches an example, otherwise uses fallback logic
 */
export const mockAnalyzeText = (text: string): TextHighlight[] => {
  // Check if this text contains tags (from JSON)
  if (text.includes('<nf>') || text.includes('<sf>') || text.includes('<f>')) {
    const { highlights } = parseTaggedText(text);
    return highlights;
  }

  // Check if this is clean text matching any example
  const matchingExample = exampleTextsData.examples.find(
    ex => {
      const { cleanText } = parseTaggedText(ex.original_text);
      return cleanText.trim() === text.trim();
    }
  );

  if (matchingExample) {
    return getHighlightsFromExample(matchingExample.id);
  }

  // Fallback: simple phrase detection for custom text
  return detectComplexPhrases(text);
};

/**
 * Generates rephrase suggestions for highlighted phrases
 */
export const mockGetSuggestions = (highlights: TextHighlight[], text: string): Suggestion[] => {
  // Check if this text matches any example
  const matchingExample = exampleTextsData.examples.find(
    ex => ex.original_text.trim() === text.trim()
  );
  
  if (matchingExample) {
    return getSuggestionsFromExample(matchingExample.id);
  }
  
  // Fallback: generate generic suggestions
  return highlights.map(h => ({
    phrase: h.text,
    alternatives: [
      `simpler version of "${h.text}"`,
      `easier "${h.text}"`
    ],
    position: { start: h.start, end: h.end },
    tag: h.familiarityLevel,
    explanation: 'Consider using simpler language for better clarity.',
  }));
};

/**
 * Generate gentle rewrite - minor modifications based on tags
 * Replaces only "not-familiar" tagged phrases with simpler alternatives
 * Returns object with rewrite text (with <u> tags embedded)
 */
export const mockGetGentleRewrite = (text: string, highlights: TextHighlight[]): { text: string, underlines?: Array<{start_index: number, end_index: number}> } => {
  // Check if clean text matches any example
  const cleanText = cleanTaggedText(text);

  const matchingExample = exampleTextsData.examples.find(
    ex => cleanTaggedText(ex.original_text).trim() === cleanText.trim()
  );

  if (matchingExample && (matchingExample as any).gentle_rewrite) {
    // Return the pre-written gentle rewrite from JSON (already has <u> tags)
    return {
      text: (matchingExample as any).gentle_rewrite,
      underlines: [] // Not needed since tags are embedded
    };
  }

  // Fallback: replace only "not-familiar" tagged phrases
  let rewrittenText = text;
  const notFamiliarHighlights = highlights.filter(h => h.familiarityLevel === 'not-familiar');
  notFamiliarHighlights.sort((a, b) => b.start - a.start).forEach(h => {
    const simplifiedVersion = `simpler ${h.text}`;
    rewrittenText = rewrittenText.slice(0, h.start) + simplifiedVersion + rewrittenText.slice(h.end);
  });

  return { text: rewrittenText };
};

/**
 * Generate full rewrite - deeper modifications of content
 * Replaces all tagged phrases with simpler alternatives
 * Returns object with rewrite text (with <u> tags embedded)
 */
export const mockGetFullRewrite = (text: string, highlights: TextHighlight[]): { text: string, underlines?: Array<{start_index: number, end_index: number}> } => {
  // Check if clean text matches any example
  const cleanText = cleanTaggedText(text);

  const matchingExample = exampleTextsData.examples.find(
    ex => cleanTaggedText(ex.original_text).trim() === cleanText.trim()
  );

  if (matchingExample && (matchingExample as any).full_rewrite) {
    // Return the pre-written full rewrite from JSON (already has <u> tags)
    return {
      text: (matchingExample as any).full_rewrite,
      underlines: [] // Not needed since tags are embedded
    };
  }

  // Fallback: replace all tagged phrases
  let rewrittenText = text;
  highlights.sort((a, b) => b.start - a.start).forEach(h => {
    const simplifiedVersion = `simpler ${h.text}`;
    rewrittenText = rewrittenText.slice(0, h.start) + simplifiedVersion + rewrittenText.slice(h.end);
  });

  return { text: rewrittenText };
};

/**
 * Handle custom chat instruction and return modified text
 * If text matches Example 3 or 4, returns Example 5
 */
export const mockCustomRephrase = (text: string, instruction: string): string => {
  // Check if this text matches Example 3 or Example 4
  const matchingExample = exampleTextsData.examples.find(
    ex => (ex.id === 3 || ex.id === 4) && ex.original_text.trim() === text.trim()
  );

  if (matchingExample) {
    // Return Example 5 as the custom rephrased version
    const example5 = exampleTextsData.examples.find(ex => ex.id === 5);
    if (example5) {
      return example5.original_text;
    }
  }

  // Fallback: append instruction effect to the text
  return `${text}\n\n[Modified based on: "${instruction}"]`;
};

/**
 * Fallback phrase detection for non-example text
 */
const detectComplexPhrases = (text: string): TextHighlight[] => {
  const highlights: TextHighlight[] = [];
  const lowerText = text.toLowerCase();

  const fallbackPhrases = [
    { text: 'large language model', level: 'not-familiar' as FamiliarityLevel },
    { text: 'LLM agents', level: 'not-familiar' as FamiliarityLevel },
    { text: 'composable patterns', level: 'somewhat-familiar' as FamiliarityLevel },
    { text: 'complex frameworks', level: 'somewhat-familiar' as FamiliarityLevel },
  ];

  fallbackPhrases.forEach((phrase, index) => {
    const searchText = phrase.text.toLowerCase();
    let startIndex = 0;

    while (startIndex < lowerText.length) {
      const start = lowerText.indexOf(searchText, startIndex);
      if (start === -1) break;

      highlights.push({
        id: `highlight-${index}-${start}`,
        start,
        end: start + phrase.text.length,
        text: text.slice(start, start + phrase.text.length),
        familiarityLevel: phrase.level,
      });

      startIndex = start + phrase.text.length;
    }
  });

  return highlights.sort((a, b) => a.start - b.start);
};
