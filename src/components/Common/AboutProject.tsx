import React from 'react';

interface AboutProjectProps {
  isModal?: boolean;
  onClose?: () => void;
}

const AboutProject: React.FC<AboutProjectProps> = ({ isModal = false, onClose }) => {
  const content = (
    <div className={isModal ? 'space-y-5' : 'space-y-6'}>
      {!isModal && (
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">About SenseAble</h2>
          <p className="text-base text-gray-700 leading-relaxed">
            SenseAble is a research-driven system that makes sensory-rich text easier to understand by adapting it to a reader's accessibility needs, cultural background, and personal preferences. Many texts rely on sensory descriptions such as color, sound, smell, or metaphor, which can unintentionally exclude readers with sensory impairments, neurodivergent processing styles, or unfamiliar cultural contexts. SenseAble identifies these phrases, explains them, and rewrites them when needed, while preserving the original meaning.
          </p>
        </div>
      )}

      {isModal && (
        <div>
          <p className="text-base text-gray-700 leading-relaxed">
            SenseAble is a research-driven system that makes sensory-rich text easier to understand by adapting it to a reader's accessibility needs, cultural background, and personal preferences. Many texts rely on sensory descriptions such as color, sound, smell, or metaphor, which can unintentionally exclude readers with sensory impairments, neurodivergent processing styles, or unfamiliar cultural contexts. SenseAble identifies these phrases, explains them, and rewrites them when needed, while preserving the original meaning.
          </p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">How SenseAble Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-base text-gray-700">
          <li className="pl-2">Paste text into the editor</li>
          <li className="pl-2">SenseAble detects and explains sensory phrases</li>
          <li className="pl-2">You review or change tags to personalize the system</li>
          <li className="pl-2">Generate accessible, meaning-preserving rewrites</li>
        </ol>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features</h3>
        <div className="space-y-3 text-base text-gray-700">
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">🎯</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Personalization First</p>
              <p className="leading-relaxed">
                SenseAble adapts text based on accessibility needs such as color vision deficiency, dyslexia, or sensory loss, as well as cultural context. Preferences evolve as users interact with the system.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">🏷️</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Sensory-Aware Tagging</p>
              <p className="leading-relaxed">
                The system automatically detects vision-, sound-, smell-, taste-, touch-, and cross-sensory phrases and highlights them with short, clear explanations.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">🔁</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Meaning-Preserving Rewrites</p>
              <p className="leading-relaxed">
                Instead of removing metaphors, SenseAble generates gentle to fully literal rewrites that maintain intent while reducing sensory or cultural barriers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Interface and Accessibility</h3>
        <ul className="space-y-2 text-base text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
            <span>Accessible tag colors that adapt automatically for color-blind users using the Okabe–Ito color palette</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
            <span>Dyslexia-friendly tag styling with lighter palettes and reduced visual clutter</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
            <span>Change Tag option for personal refinement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
            <span>One-page interface for low cognitive load and easy navigation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
            <span>Editable user profile for updating accessibility and cultural preferences</span>
          </li>
        </ul>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
          {/* Overlay */}
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={onClose}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl transform transition-all max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">About SenseAble</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none transition"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
      {content}
    </div>
  );
};

export default AboutProject;
