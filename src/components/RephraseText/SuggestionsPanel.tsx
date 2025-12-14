import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { Suggestion, TextHighlight } from '../../types';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  highlights: TextHighlight[];
  onAccept: (phrase: string, replacement: string) => void;
  onIgnore: (phrase: string) => void;
  onHover: (highlightId: string | null) => void;
  hoveredId: string | null;
  colorPalette: any;
}

export interface SuggestionsPanelRef {
  scrollToSuggestion: (highlightId: string) => void;
}

const SuggestionsPanel = forwardRef<SuggestionsPanelRef, SuggestionsPanelProps>(({
  suggestions,
  highlights,
  onAccept,
  onIgnore,
  onHover,
  hoveredId,
  colorPalette,
}, ref) => {
  const suggestionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set());

  useImperativeHandle(ref, () => ({
    scrollToSuggestion: (highlightId: string) => {
      const element = suggestionRefs.current.get(highlightId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }));

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion, index) => {
        // Get the tag color for this suggestion
        const tagColor = suggestion.tag ? colorPalette[suggestion.tag] : '#6B7280';
        const textColor = suggestion.tag && colorPalette.textColors ? colorPalette.textColors[suggestion.tag] : '#000000';
        const icon = suggestion.tag && colorPalette.icons ? colorPalette.icons[suggestion.tag] : null;
        const firstAlternative = suggestion.alternatives[0] || suggestion.phrase;

        // Find the corresponding highlight
        const highlight = highlights.find(h => h.text === suggestion.phrase);
        const isHovered = highlight && hoveredId === highlight.id;
        const isExpanded = expandedSuggestions.has(index);
        const toggleExpanded = () => {
          setExpandedSuggestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
              newSet.delete(index);
            } else {
              newSet.add(index);
            }
            return newSet;
          });
        };

        return (
          <div
            key={index}
            ref={(el) => {
              if (el && highlight) {
                suggestionRefs.current.set(highlight.id, el);
              }
            }}
            className={`border rounded-lg p-2 space-y-1.5 transition-all cursor-pointer ${
              isHovered ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onMouseEnter={() => highlight && onHover(highlight.id)}
            onMouseLeave={() => onHover(null)}
            onClick={toggleExpanded}
          >
            {/* Original -> Alternative format */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-sm font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: tagColor,
                  color: textColor
                }}
              >
                {icon && <span style={{ marginRight: '4px', fontWeight: 'bold' }}>{icon}</span>}
                {suggestion.phrase}
              </span>
              <span className="text-gray-400 text-sm">→</span>
              <span className="text-sm font-medium text-gray-800">
                {firstAlternative}
              </span>
            </div>

            {/* Explanation with line clamp - click card to expand */}
            {suggestion.explanation && (
              <div
                className={`text-sm text-gray-600 leading-snug ${
                  isExpanded ? '' : 'line-clamp-2'
                }`}
              >
                {suggestion.explanation}
              </div>
            )}

            {/* Icon buttons - smaller with thinner rounded borders */}
            <div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onAccept(suggestion.phrase, firstAlternative)}
                className="px-2 py-1.5 text-green-600 bg-white hover:bg-green-50 border border-green-500 rounded-md transition-all duration-200 flex items-center justify-center gap-1 group"
                title="Accept"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => onIgnore(suggestion.phrase)}
                className="px-2 py-1.5 text-red-400 bg-white hover:bg-red-50 border border-red-400 rounded-md transition-all duration-200 flex items-center justify-center gap-1 group"
                title="Ignore"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

SuggestionsPanel.displayName = 'SuggestionsPanel';

export default SuggestionsPanel;
