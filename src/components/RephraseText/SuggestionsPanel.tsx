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
  onChangeTag?: (highlightId: string) => void;
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
  colorPalette,  onChangeTag,}, ref) => {
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
            className={`border rounded-lg p-3 space-y-2 transition-all ${
              isHovered ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onMouseEnter={() => highlight && onHover(highlight.id)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Tagged Phrase with Tag Badge */}
            <div className="flex items-center gap-2 flex-wrap">
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
            </div>

            {/* Explanation - Why this tag was applied */}
            {suggestion.explanation && (
              <div className="text-sm text-gray-600 leading-relaxed italic">
                {suggestion.explanation}
              </div>
            )}

            {/* Change Tag Button */}
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={() => onChangeTag && highlight && onChangeTag(highlight.id)}
                className="px-3 py-1.5 text-sm text-blue-600 bg-white hover:bg-blue-50 border border-blue-500 rounded-md transition-all duration-200 flex items-center justify-center gap-1 group"
                title="Change Tag"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>Change Tag</span>
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
