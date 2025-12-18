import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import Header from '../components/Common/Header';
import Chat from '../components/RephraseText/Chat';
import ProfileEdit from '../components/RephraseText/ProfileEdit';
import RewritePane from '../components/RephraseText/RewritePane';
import SuggestionsPanel, { SuggestionsPanelRef } from '../components/RephraseText/SuggestionsPanel';
import TextEditor from '../components/RephraseText/TextEditor';
import { useUser } from '../context/UserContext';
import { mockAnalyzeText, mockCustomRephrase, mockGetFullRewrite, mockGetGentleRewrite, mockGetSuggestions, cleanTaggedText } from '../mocks/analyzeData';
import { FamiliarityLevel, Suggestion, TextHighlight } from '../types';
import { defaultColorPalette } from '../utils/colorPalettes';
import exampleTexts from '../mocks/exampleTexts.json';

const RephraseTextPage: React.FC = () => {
  const { user, preferences } = useUser();
  const navigate = useNavigate();

  const [originalText, setOriginalText] = useState('');
  const [showExamplesPopover, setShowExamplesPopover] = useState(false);
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [showRewritePane, setShowRewritePane] = useState(false);
  const [gentleRewrite, setGentleRewrite] = useState('');
  const [fullRewrite, setFullRewrite] = useState('');
  const [gentleUnderlines, setGentleUnderlines] = useState<Array<{start_index: number, end_index: number}>>([]);
  const [fullUnderlines, setFullUnderlines] = useState<Array<{start_index: number, end_index: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(null);
  const [acceptedReplacements, setAcceptedReplacements] = useState<Map<number, string>>(new Map());
  const [activeTab, setActiveTab] = useState<'tags' | 'profile' | 'chat'>('profile');
  const [textSize, setTextSize] = useState(16); // Base text size in pixels

  const suggestionsPanelRef = useRef<SuggestionsPanelRef>(null);

  const colorPalette = preferences?.color_palette || defaultColorPalette;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Re-render highlights when accessibility preferences change
  useEffect(() => {
    // Force re-render of TextEditor component when color palette changes
    if (isAnalyzed && highlights.length > 0) {
      // Trigger a re-render by creating new array reference
      setHighlights(prev => [...prev]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.color_palette, preferences?.accessibility_need, isAnalyzed]);

  // Count tags by familiarity level
  const tagCounts = highlights.reduce((acc, h) => {
    if (h.familiarityLevel) {
      acc[h.familiarityLevel] = (acc[h.familiarityLevel] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleAnalyze = () => {
    if (!originalText.trim()) return;

    setLoading(true);
    setShowRewritePane(false);

    // Simulate API call with mock data - analyze and show tags + suggestions immediately
    setTimeout(() => {
      const analyzed = mockAnalyzeText(originalText);
      setHighlights(analyzed);

      // Generate suggestions immediately for each tagged phrase
      const newSuggestions = mockGetSuggestions(analyzed, originalText);
      setSuggestions(newSuggestions);

      setIsAnalyzed(true);
      setActiveTab('tags'); // Switch to tags tab after analyze
      setLoading(false);
    }, 800);
  };

  const handleRewrite = () => {
    if (!isAnalyzed) return;

    setLoading(true);

    // Generate gentle and full rewrites
    setTimeout(() => {
      const gentle = mockGetGentleRewrite(originalText, highlights);
      const full = mockGetFullRewrite(originalText, highlights);
      setGentleRewrite(gentle.text);
      setFullRewrite(full.text);
      setGentleUnderlines(gentle.underlines || []);
      setFullUnderlines(full.underlines || []);
      setShowRewritePane(true);
      setLoading(false);
    }, 800);
  };

  const handleAddHighlight = (highlight: TextHighlight) => {
    setHighlights([...highlights, highlight]);
  };

  const handleUpdateHighlight = (id: string, level: FamiliarityLevel) => {
    setHighlights(highlights.map(h =>
      h.id === id ? { ...h, familiarityLevel: level } : h
    ));
  };

  const handleRemoveHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const handleReset = () => {
    setOriginalText('');
    setHighlights([]);
    setSuggestions([]);
    setIsAnalyzed(false);
    setShowRewritePane(false);
    setGentleRewrite('');
    setFullRewrite('');
    setGentleUnderlines([]);
    setFullUnderlines([]);
    setAcceptedReplacements(new Map());
    setHoveredHighlightId(null);
    setActiveTab('profile'); // Switch back to profile tab on reset
  };

  const handleAcceptRewrite = (version: 'gentle' | 'full', text: string) => {
    // Clean tags from the rewrite before setting as original text
    const cleanText = cleanTaggedText(text);
    setOriginalText(cleanText);
    // Reset states to allow iteration
    setHighlights([]);
    setIsAnalyzed(false);
    setShowRewritePane(false);
    setGentleRewrite('');
    setFullRewrite('');
    // Keep chat enabled for further modifications
    setActiveTab('chat');
  };

  const handleAccept = (phrase: string, replacement: string) => {
    // Find the highlight for this phrase
    const highlight = highlights.find(h => h.text === phrase);
    if (!highlight) return;

    // Replace the text
    const newText = originalText.replace(phrase, replacement);
    setOriginalText(newText);

    // Calculate the length difference
    const lengthDiff = replacement.length - phrase.length;

    // Update all subsequent highlights' positions
    const updatedHighlights = highlights
      .filter(h => h.id !== highlight.id) // Remove the accepted highlight
      .map(h => {
        if (h.start > highlight.start) {
          // Adjust positions for highlights after the replaced text
          return {
            ...h,
            start: h.start + lengthDiff,
            end: h.end + lengthDiff,
          };
        }
        return h;
      });

    setHighlights(updatedHighlights);

    // Update suggestions to remove the accepted one
    setSuggestions(suggestions.filter(s => s.phrase !== phrase));
  };

  const handleIgnore = (phrase: string) => {
    // Find and remove the highlight
    const highlight = highlights.find(h => h.text === phrase);
    if (highlight) {
      setHighlights(highlights.filter(h => h.id !== highlight.id));
    }

    // Remove the suggestion
    setSuggestions(suggestions.filter(s => s.phrase !== phrase));
  };

  const handleHighlightClick = (highlightId: string) => {
    // Scroll to the corresponding suggestion
    suggestionsPanelRef.current?.scrollToSuggestion(highlightId);
  };

  const handleCustomRephrase = (instruction: string) => {
    // Handle custom rephrasing based on user instruction
    // Simulate custom modification (in real app, this would be an API call)
    setTimeout(() => {
      const modifiedText = mockCustomRephrase(originalText, instruction);
      setOriginalText(modifiedText);

      // Reset analysis state to allow re-analyzing the modified text
      setHighlights([]);
      setSuggestions([]);
      setIsAnalyzed(false);
      setShowRewritePane(false);
    }, 500);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input/Editor */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {isAnalyzed ? 'Analyzed Text' : 'Original Text'}
                </h2>
                <div className="flex items-center gap-4">
                  {/* Text Size Slider */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="textSizeSlider" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Text Size:
                    </label>
                    <input
                      id="textSizeSlider"
                      type="range"
                      min="12"
                      max="24"
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  {isAnalyzed && (
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                    >
                      ↻ Start Over
                    </button>
                  )}
                </div>
              </div>

              {/* Example Text Buttons and Note - Only show when not analyzed */}
              {!isAnalyzed && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-amber-600 text-base">⚠️</span>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Please use the example text provided to explore this demo. Due to internal security requirements, we're unable to host the models and resources needed for a fully interactive experience.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        // Get persona from user name, default to first example (arun) if no match
                        const personaName = user?.name?.toLowerCase();
                        const exampleData = personaName
                          ? exampleTexts.examples.find(e => e.persona === personaName)
                          : null;

                        // Use matched persona or default to first example
                        const selectedExample = exampleData || exampleTexts.examples[0];

                        // Remove tags for display in textarea (tags will be read back during analyze)
                        setOriginalText(cleanTaggedText(selectedExample.original_text));
                      }}
                      className="px-4 py-2 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                    >
                      Example: {(() => {
                        const personaName = user?.name?.toLowerCase();
                        const exampleData = personaName
                          ? exampleTexts.examples.find(e => e.persona === personaName)
                          : null;
                        const selectedExample = exampleData || exampleTexts.examples[0];
                        return (selectedExample as any).title || 'Load Example';
                      })()}
                    </button>
                  </div>
                </div>
              )}

              {!isAnalyzed ? (
                <textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste or type the text you want to analyze and rephrase..."
                  className="w-full min-h-[300px] p-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none resize-none leading-relaxed"
                  style={{ fontSize: `${textSize}px` }}
                />
              ) : (
                <TextEditor
                  text={originalText}
                  onTextChange={setOriginalText}
                  highlights={highlights}
                  onAddHighlight={handleAddHighlight}
                  onUpdateHighlight={handleUpdateHighlight}
                  onRemoveHighlight={handleRemoveHighlight}
                  colorPalette={colorPalette}
                  hoveredHighlightId={hoveredHighlightId}
                  onHighlightHover={setHoveredHighlightId}
                  acceptedReplacements={acceptedReplacements}
                  onHighlightClick={handleHighlightClick}
                  textSize={textSize}
                />
              )}

              <div className="flex justify-center mt-4">
                <Button
                  onClick={isAnalyzed ? handleRewrite : handleAnalyze}
                  disabled={loading || !originalText.trim()}
                  className="px-8"
                >
                  {loading ? 'Processing...' : isAnalyzed ? 'Rewrite' : 'Analyze'}
                </Button>
              </div>

              {isAnalyzed && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">
                    💡 <strong>Tip:</strong> Click any text to modify tags, view the explanations in the Tags panel, or select Rewrite to see full rewritten versions.
                  </p>
                </div>
              )}
            </div>

            {/* Rewrite Pane - Shows below main content after clicking Rewrite */}
            {showRewritePane && (
              <RewritePane
                gentleRewrite={gentleRewrite}
                fullRewrite={fullRewrite}
                gentleUnderlines={gentleUnderlines}
                fullUnderlines={fullUnderlines}
                originalText={originalText}
                highlights={highlights}
                onAccept={handleAcceptRewrite}
                textSize={textSize}
              />
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:flex lg:flex-col">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex border-b">
                <button
                  onClick={() => isAnalyzed && setActiveTab('tags')}
                  disabled={!isAnalyzed}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition ${activeTab === 'tags'
                    ? 'text-primary border-b-2 border-primary'
                    : !isAnalyzed
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Tags
                </button>
                <button
                  onClick={() => originalText.trim() && setActiveTab('chat')}
                  disabled={!originalText.trim()}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition ${activeTab === 'chat'
                    ? 'text-primary border-b-2 border-primary'
                    : !originalText.trim()
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition ${activeTab === 'profile'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Update Profile
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'tags' && (
                <div className="space-y-4">
                  {/* Tag Summary - Compact version at top */}
                  {isAnalyzed && (
                    <div className="bg-white rounded-lg shadow p-2 lg:sticky lg:top-0 lg:z-10">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1.5">Tag Summary</h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-1.5 rounded"
                          style={{ backgroundColor: `${colorPalette['not-familiar']}10` }}>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded"
                              style={{ backgroundColor: colorPalette['not-familiar'] }}></div>
                            <span className="text-sm font-medium">Not Familiar</span>
                          </div>
                          <span className="text-sm font-bold">{tagCounts['not-familiar'] || 0}</span>
                        </div>

                        <div className="flex items-center justify-between p-1.5 rounded"
                          style={{ backgroundColor: `${colorPalette['somewhat-familiar']}10` }}>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded"
                              style={{ backgroundColor: colorPalette['somewhat-familiar'] }}></div>
                            <span className="text-sm font-medium">Somewhat Familiar</span>
                          </div>
                          <span className="text-sm font-bold">{tagCounts['somewhat-familiar'] || 0}</span>
                        </div>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Total Tagged</span>
                          <span className="text-base font-bold text-primary">{highlights.length}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Tag Suggestions - Below summary */}
                  {suggestions.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-3">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">
                        Tagged Phrases & Alternatives
                      </h3>
                      <SuggestionsPanel
                        ref={suggestionsPanelRef}
                        suggestions={suggestions}
                        highlights={highlights}
                        onAccept={handleAccept}
                        onIgnore={handleIgnore}
                        onHover={setHoveredHighlightId}
                        hoveredId={hoveredHighlightId}
                        colorPalette={colorPalette}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow p-3">
                  <ProfileEdit />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="bg-white rounded-lg shadow p-3">
                  <h3 className="text-xs font-semibold text-gray-800 mb-3">Custom Instructions</h3>
                  <Chat
                    originalText={originalText}
                    onCustomRephrase={handleCustomRephrase}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RephraseTextPage;
