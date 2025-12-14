import React, { useState, useMemo } from 'react';
import Button from '../Common/Button';
import { useUser } from '../../context/UserContext';
import { TextHighlight } from '../../types';

interface RewritePaneProps {
  gentleRewrite: string;
  fullRewrite: string;
  originalText: string;
  highlights: TextHighlight[];
  onAccept: (version: 'gentle' | 'full', text: string) => void;
}

const RewritePane: React.FC<RewritePaneProps> = ({
  gentleRewrite,
  fullRewrite,
  originalText,
  highlights,
  onAccept,
}) => {
  const [activeVersion, setActiveVersion] = useState<'gentle' | 'full'>('gentle');
  const { preferences } = useUser();
  const accessibilityNeed = preferences?.accessibility_need || 'none';
  const accessibilitySubOption = preferences?.other_preferences?.accessibilitySubOption || '';

  // Function to find rephrased versions of tagged phrases in rewritten text
  const findRephrasedTaggedPhrases = (rewritten: string): Array<{ start: number; end: number; text: string }> => {
    const rephrasedPhrases: Array<{ start: number; end: number; text: string }> = [];
    
    // Build a version of the original text with lowercase for comparison
    const originalLower = originalText.toLowerCase();
    const rewrittenLower = rewritten.toLowerCase();
    
    // For each tagged phrase in the original text
    highlights.forEach(highlight => {
      const originalPhrase = highlight.text;
      const originalPhraseLower = originalPhrase.toLowerCase();
      
      // Check if the original phrase is NOT in the rewritten text (meaning it was replaced)
      if (!rewrittenLower.includes(originalPhraseLower)) {
        // The phrase was replaced, now find what replaced it
        // Strategy: Look at surrounding context to identify the replacement
        
        // Get context before and after the tagged phrase in the original
        const contextBefore = originalText.substring(Math.max(0, highlight.start - 30), highlight.start);
        const contextAfter = originalText.substring(highlight.end, Math.min(originalText.length, highlight.end + 30));
        
        // Find where this context appears in the rewritten text
        const contextBeforeLower = contextBefore.toLowerCase().trim();
        const contextAfterLower = contextAfter.toLowerCase().trim();
        
        let replacementStart = -1;
        let replacementEnd = -1;
        
        // Find the position using context
        if (contextBeforeLower.length > 0) {
          const beforeMatch = rewrittenLower.indexOf(contextBeforeLower);
          if (beforeMatch !== -1) {
            replacementStart = beforeMatch + contextBefore.length;
            
            // Find where the after-context starts
            if (contextAfterLower.length > 0) {
              const afterMatch = rewrittenLower.indexOf(contextAfterLower, replacementStart);
              if (afterMatch !== -1) {
                replacementEnd = afterMatch;
              }
            }
          }
        }
        
        // If we found a valid replacement region
        if (replacementStart !== -1 && replacementEnd !== -1 && replacementEnd > replacementStart) {
          const replacementText = rewritten.substring(replacementStart, replacementEnd).trim();
          
          // Only add if it's not empty and different from original
          if (replacementText.length > 0 && replacementText.toLowerCase() !== originalPhraseLower) {
            // Find the actual position in the rewritten text (accounting for trimming)
            const actualStart = rewritten.indexOf(replacementText, replacementStart);
            if (actualStart !== -1) {
              rephrasedPhrases.push({
                start: actualStart,
                end: actualStart + replacementText.length,
                text: replacementText
              });
            }
          }
        }
      }
    });
    
    return rephrasedPhrases;
  };

  // Get underline style based on accessibility need
  const getUnderlineStyle = () => {
    // Check if cognitive with ADHD or Dyslexia sub-option
    if (accessibilityNeed === 'cognitive' && 
        (accessibilitySubOption === 'ADHD' || accessibilitySubOption === 'Dyslexia')) {
      return 'decoration-purple-500 decoration-dotted decoration-[3px]';
    }
    
    switch (accessibilityNeed) {
      case 'colorblind':
        return 'decoration-blue-600 decoration-dotted decoration-[3px]';
      case 'dyslexia':
        return 'decoration-purple-500 decoration-dotted decoration-[3px]';
      case 'low-vision':
        return 'decoration-black decoration-solid decoration-[3px]';
      case 'cognitive':
        return 'decoration-orange-500 decoration-double decoration-2';
      default:
        return 'decoration-green-600 decoration-solid decoration-2';
    }
  };

  // Render text with underlined rephrased phrases (only tagged phrases that were changed)
  const renderHighlightedText = (text: string) => {
    const rephrasedPhrases = findRephrasedTaggedPhrases(text);
    const underlineClass = getUnderlineStyle();
    
    if (rephrasedPhrases.length === 0) {
      return <span>{text}</span>;
    }

    // Sort by start position
    const sortedPhrases = [...rephrasedPhrases].sort((a, b) => a.start - b.start);
    
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    // Build text with underlines only for rephrased tagged phrases
    sortedPhrases.forEach((phrase, idx) => {
      // Add text before this phrase
      if (phrase.start > lastIndex) {
        parts.push(
          <React.Fragment key={`text-${idx}`}>
            {text.substring(lastIndex, phrase.start)}
          </React.Fragment>
        );
      }
      
      // Add the underlined rephrased phrase
      parts.push(
        <span key={`phrase-${idx}`} className={`underline ${underlineClass}`}>
          {phrase.text}
        </span>
      );
      
      lastIndex = phrase.end;
    });
    
    // Add remaining text after last phrase
    if (lastIndex < text.length) {
      parts.push(
        <React.Fragment key="text-end">
          {text.substring(lastIndex)}
        </React.Fragment>
      );
    }
    
    return <>{parts}</>;
  };

  const handleAccept = () => {
    const text = activeVersion === 'gentle' ? gentleRewrite : fullRewrite;
    onAccept(activeVersion, text);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Rewritten Versions</h2>
      </div>

      {/* Version Tabs */}
      <div className="flex gap-2 mb-3 border-b">
        <button
          onClick={() => setActiveVersion('gentle')}
          className={`px-3 py-2 text-sm font-medium transition ${
            activeVersion === 'gentle'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Gentle Rewrite
        </button>
        <button
          onClick={() => setActiveVersion('full')}
          className={`px-3 py-2 text-sm font-medium transition ${
            activeVersion === 'full'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Full Rewrite
        </button>
      </div>

      {/* Version Note */}
      <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-sm text-blue-700">
          {activeVersion === 'gentle'
            ? '💡 Gentle modifications with minimal changes based on tagged phrases'
            : '💡 Comprehensive rewrite with deeper content modifications'}
        </p>
      </div>

      {/* Rewritten Text Display */}
      <div className="min-h-[300px] p-3 bg-gray-50 rounded-lg mb-3">
        <div className="prose max-w-none">
          <div className="text-base leading-relaxed">
            {renderHighlightedText(activeVersion === 'gentle' ? gentleRewrite : fullRewrite)}
          </div>
        </div>
      </div>

      {/* Legend for underline styles */}
      <div className="mb-3 p-2 bg-gray-100 rounded text-sm text-gray-600">
        <span className={`underline ${getUnderlineStyle()} font-medium`}>Underlined text</span> indicates changes from the original
      </div>

      {/* Accept Button */}
      <div className="flex justify-center">
        <Button onClick={handleAccept} size="sm">
          ✓ Accept
        </Button>
      </div>
    </div>
  );
};

export default RewritePane;
