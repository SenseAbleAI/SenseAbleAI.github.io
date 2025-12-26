import React, { useState, useMemo } from 'react';
import Button from '../Common/Button';
import { useUser } from '../../context/UserContext';
import { TextHighlight } from '../../types';

interface RewritePaneProps {
  gentleRewrite: string;
  fullRewrite: string;
  gentleUnderlines?: Array<{start_index: number, end_index: number}>;
  fullUnderlines?: Array<{start_index: number, end_index: number}>;
  originalText: string;
  highlights: TextHighlight[];
  onAccept: (version: 'gentle' | 'full', text: string) => void;
  textSize?: number;
}

const RewritePane: React.FC<RewritePaneProps> = ({
  gentleRewrite,
  fullRewrite,
  gentleUnderlines,
  fullUnderlines,
  originalText,
  highlights,
  onAccept,
  textSize = 16,
}) => {
  const [activeVersion, setActiveVersion] = useState<'gentle' | 'full'>('gentle');
  const [showFeedback, setShowFeedback] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
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
    // This covers when accessibilityNeed is 'cognitive' OR 'dyslexia' (since Dyslexia gets converted to 'dyslexia' by getAccessibilityNeed)
    if ((accessibilityNeed === 'cognitive' || accessibilityNeed === 'dyslexia') && 
        (accessibilitySubOption === 'ADHD' || accessibilitySubOption === 'Dyslexia')) {
      return 'decoration-green-600 decoration-solid decoration-2';
    }
    
    switch (accessibilityNeed) {
      case 'colorblind':
        return 'decoration-blue-600 decoration-solid decoration-[3px]';
      case 'dyslexia':
        return 'decoration-green-600 decoration-solid decoration-2';
      case 'low-vision':
        return 'decoration-black decoration-solid decoration-[3px]';
      case 'cognitive':
        return 'decoration-green-600 decoration-solid decoration-2';
      default:
        return 'decoration-green-600 decoration-solid decoration-2';
    }
  };

  // Render text with underlined rephrased phrases by parsing <u> tags
  const renderHighlightedText = (text: string, underlines?: Array<{start_index: number, end_index: number}>) => {
    const underlineClass = getUnderlineStyle();

    // Check if text has <u> tags
    if (text.includes('<u>')) {
      // Parse and render tags directly
      const parts: JSX.Element[] = [];
      const tagPattern = /<u>(.*?)<\/u>/g;
      let lastIndex = 0;
      let match;
      let idx = 0;

      while ((match = tagPattern.exec(text)) !== null) {
        // Add text before this tag
        if (match.index > lastIndex) {
          parts.push(
            <React.Fragment key={`text-${idx}`}>
              {text.substring(lastIndex, match.index)}
            </React.Fragment>
          );
        }

        // Add underlined text
        parts.push(
          <span key={`u-${idx}`} className={`underline ${underlineClass}`}>
            {match[1]}
          </span>
        );

        lastIndex = match.index + match[0].length;
        idx++;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(
          <React.Fragment key="text-end">
            {text.substring(lastIndex)}
          </React.Fragment>
        );
      }

      return <>{parts}</>;
    }

    // Fallback: use index-based underlines if provided
    if (underlines && underlines.length > 0) {
      const phrasesToUnderline = underlines.map(u => ({
        start: u.start_index,
        end: u.end_index,
        text: text.substring(u.start_index, u.end_index)
      }));

      const sortedPhrases = [...phrasesToUnderline].sort((a, b) => a.start - b.start);
      const parts: JSX.Element[] = [];
      let lastIndex = 0;

      sortedPhrases.forEach((phrase, idx) => {
        if (phrase.start > lastIndex) {
          parts.push(
            <React.Fragment key={`text-${idx}`}>
              {text.substring(lastIndex, phrase.start)}
            </React.Fragment>
          );
        }

        parts.push(
          <span key={`phrase-${idx}`} className={`underline ${underlineClass}`}>
            {phrase.text}
          </span>
        );

        lastIndex = phrase.end;
      });

      if (lastIndex < text.length) {
        parts.push(
          <React.Fragment key="text-end">
            {text.substring(lastIndex)}
          </React.Fragment>
        );
      }

      return <>{parts}</>;
    }

    // No underlines - return plain text
    return <span>{text}</span>;
  };

  const handleAccept = () => {
    const text = activeVersion === 'gentle' ? gentleRewrite : fullRewrite;
    onAccept(activeVersion, text);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    // Here you could send feedback to analytics or backend
    setTimeout(() => {
      setShowFeedback(false);
    }, 1500);
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

      {/* Version Note with Underline Legend */}
      <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-sm text-blue-700">
          {activeVersion === 'gentle'
            ? '💡 Gentle modifications with minimal changes based on tagged phrases'
            : '💡 Comprehensive rewrite with deeper content modifications'}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <span className={`underline ${getUnderlineStyle()} font-medium`}>Underlined text</span> indicates changes from the original.
        </p>
      </div>

      {/* Rewritten Text Display */}
      <div className="min-h-[300px] p-3 bg-gray-50 rounded-lg mb-3">
        <div className="prose max-w-none">
          <div className="leading-relaxed" style={{ fontSize: `${textSize}px` }}>
            {renderHighlightedText(
              activeVersion === 'gentle' ? gentleRewrite : fullRewrite,
              activeVersion === 'gentle' ? gentleUnderlines : fullUnderlines
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Do you like this response?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('up')}
                disabled={feedbackGiven !== null}
                className={`p-2 rounded-lg transition-all ${
                  feedbackGiven === 'up'
                    ? 'bg-green-100 text-green-600'
                    : 'hover:bg-gray-100 text-gray-600'
                } disabled:opacity-50`}
                title="Like"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button
                onClick={() => handleFeedback('down')}
                disabled={feedbackGiven !== null}
                className={`p-2 rounded-lg transition-all ${
                  feedbackGiven === 'down'
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-gray-100 text-gray-600'
                } disabled:opacity-50`}
                title="Dislike"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-all"
                title="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {feedbackGiven && (
            <p className="text-xs text-gray-500 mt-2">Thank you for your feedback!</p>
          )}
        </div>
      )}

      {/* Accept Button */}
      <div className="flex justify-center">
        <Button onClick={handleAccept} size="sm">
          ✓ Accept
        </Button>
      </div>

      {/* AI Disclaimer */}
      <div className="mt-3 text-center text-sm text-gray-600">
        This is an AI-generated response. Use with appropriate oversight.
      </div>
    </div>
  );
};

export default RewritePane;
