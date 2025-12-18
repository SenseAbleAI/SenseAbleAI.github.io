import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { AccessibilityNeed, ReadingLevel, ComplexityLevel } from '../../types';
import { getColorPalette } from '../../utils/colorPalettes';
import Button from '../Common/Button';

interface UserAccountFormProps {
  isLoginMode?: boolean;
}

interface Persona {
  id: string;
  name: string;
  ageRange: string;
  gender: string;
  country: string;
  languagePreference: string;
  accessibilityCategory: string;
  accessibilitySubOption: string;
  additionalSupport: string;
  color: string;
  bgColor: string;
}

const UserAccountForm: React.FC<UserAccountFormProps> = ({ isLoginMode = false }) => {
  const { user, preferences, setUser, setPreferences } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // User profile fields (for login mode)
    name: '',
    ageRange: '',
    gender: '',
    country: '',
    languagePreference: '',

    // Accessibility needs (two-level selection for login mode)
    accessibilityCategory: '' as string,
    accessibilitySubOption: '' as string,
    additionalSupport: '',

    // Consent
    consentGiven: false,

    // Legacy fields (for profile edit mode)
    email: user?.email || '',
    accessibilityNeed: 'none' as AccessibilityNeed, // For profile edit mode only
    readingLevel: preferences?.reading_level || 'intermediate' as ReadingLevel,
    preferredComplexity: preferences?.preferred_complexity || 'moderate' as ComplexityLevel,
  });

  // Predefined personas
  const personas: Persona[] = [
    {
      id: 'arun',
      name: 'Arun',
      ageRange: '25-34',
      gender: 'male',
      country: 'india',
      languagePreference: 'english',
      accessibilityCategory: 'vision',
      accessibilitySubOption: 'Colorblind',
      additionalSupport: 'I\'d prefer examples with Indian context',
      color: '#6366f1',
      bgColor: '#e0e7ff',
    },
    {
      id: 'maria',
      name: 'Maria',
      ageRange: '35-44',
      gender: 'female',
      country: 'usa',
      languagePreference: 'english',
      accessibilityCategory: 'cognitive',
      accessibilitySubOption: 'Dyslexia',
      additionalSupport: 'I love knowing about other cultures',
      color: '#ec4899',
      bgColor: '#fce7f3',
    },
    {
      id: 'sruti',
      name: 'Sruti',
      ageRange: '18-24',
      gender: 'female',
      country: 'india',
      languagePreference: 'english',
      accessibilityCategory: 'smell',
      accessibilitySubOption: 'Anosmia',
      additionalSupport: 'I born anosmic',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      id: 'george',
      name: 'George',
      ageRange: '45-54',
      gender: 'male',
      country: 'uk',
      languagePreference: 'english',
      accessibilityCategory: 'hearing',
      accessibilitySubOption: 'Deaf',
      additionalSupport: '',
      color: '#06b6d4',
      bgColor: '#cffafe',
    },
  ];

  // Accessibility options structure
  const accessibilityOptions = [
    { id: 'none', label: 'None', options: [] },
    { id: 'vision', label: 'Vision', options: ['Colorblind', 'Low vision'] },
    { id: 'hearing', label: 'Hearing', options: ['Mild hearing loss', 'Hard of hearing', 'Deaf'] },
    { id: 'smell', label: 'Smell (Olfactory)', options: ['Anosmia', 'Hyposmia'] },
    { id: 'cognitive', label: 'Cognitive', options: ['Dyslexia', 'ADHD'] },
    { id: 'others', label: 'Others', options: [] },
  ];

  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);

  // Helper to convert category/sub-option to AccessibilityNeed type
  const getAccessibilityNeed = (): AccessibilityNeed => {
    if (formData.accessibilityCategory === 'none' || !formData.accessibilitySubOption) {
      return 'none';
    }

    const subOption = formData.accessibilitySubOption.toLowerCase();
    if (subOption.includes('colorblind')) return 'colorblind';
    if (subOption.includes('low vision')) return 'low-vision';
    if (subOption.includes('dyslexia')) return 'dyslexia';
    if (subOption.includes('adhd') || subOption.includes('cognitive')) return 'cognitive';
    return 'other';
  };

  // Handler to reset sub-option when category changes
  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      accessibilityCategory: category,
      accessibilitySubOption: '', // Reset sub-option
    });
  };

  // Handler for persona selection
  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona.id);
    setFormData({
      ...formData,
      name: persona.name,
      ageRange: persona.ageRange,
      gender: persona.gender,
      country: persona.country,
      languagePreference: persona.languagePreference,
      accessibilityCategory: persona.accessibilityCategory,
      accessibilitySubOption: persona.accessibilitySubOption,
      additionalSupport: persona.additionalSupport,
      consentGiven: true, // Auto-check consent when persona is selected
    });
  };

  // Check if all mandatory fields are filled (for login mode)
  const isFormValid = () => {
    if (isLoginMode) {
      const accessibilityValid = formData.accessibilityCategory !== '' &&
        (formData.accessibilityCategory === 'none' || formData.accessibilitySubOption !== '');

      return (
        formData.name.trim() !== '' &&
        formData.ageRange !== '' &&
        formData.gender !== '' &&
        formData.country !== '' &&
        formData.languagePreference !== '' &&
        accessibilityValid &&
        formData.consentGiven
      );
    }
    return true; // Profile edit mode doesn't need validation
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
    if (preferences) {
      setFormData(prev => ({
        ...prev,
        accessibilityNeed: preferences.accessibility_need || 'none', // For profile edit mode
        readingLevel: preferences.reading_level || 'intermediate',
        preferredComplexity: preferences.preferred_complexity || 'moderate',
        // Load saved profile data from other_preferences
        ageRange: (preferences.other_preferences?.ageRange as string) || '',
        gender: (preferences.other_preferences?.gender as string) || '',
        country: (preferences.other_preferences?.country as string) || '',
        languagePreference: (preferences.other_preferences?.languagePreference as string) || '',
        accessibilityCategory: (preferences.other_preferences?.accessibilityCategory as string) || '',
        accessibilitySubOption: (preferences.other_preferences?.accessibilitySubOption as string) || '',
        additionalSupport: (preferences.other_preferences?.additionalSupport as string) || '',
        consentGiven: preferences.other_preferences?.consentGiven === true,
      }));
    }
  }, [user, preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('=== SUBMIT STARTED ===');
    console.log('Current user state:', user);
    console.log('Form data:', formData);

    try {
      if (!user) {
        console.log('=== NEW USER REGISTRATION PATH ===');
        
        console.log('Step 1: Calling register API with name:', formData.name);
        
        // Register user with name and profile data
        const registrationData = isLoginMode ? {
          name: formData.name,
          ageRange: formData.ageRange,
          gender: formData.gender,
          country: formData.country,
          languagePreference: formData.languagePreference,
          accessibilityCategory: formData.accessibilityCategory,
          accessibilitySubOption: formData.accessibilitySubOption,
          additionalSupport: formData.additionalSupport,
        } : {
          name: formData.name,
          email: formData.email,
        };

        const newUser = await userService.register(registrationData);

        console.log('Step 2: Register API returned:', newUser);

        if (!newUser || !newUser.id) {
          throw new Error('User object missing id field');
        }

        console.log('Step 3: Calling setUser with:', newUser);
        setUser(newUser);

        // Use the accessibility need from the category/sub-option
        const primaryAccessibilityNeed: AccessibilityNeed = getAccessibilityNeed();

        // Create preferences
        const colorPalette = getColorPalette(primaryAccessibilityNeed);
        console.log('Step 4: Creating preferences for user ID:', newUser.id);
        
        const newPreferences = await userService.updatePreferences(newUser.id, {
          accessibility_need: primaryAccessibilityNeed,
          reading_level: formData.readingLevel,
          preferred_complexity: formData.preferredComplexity,
          color_palette: colorPalette,
          other_preferences: isLoginMode ? {
            ageRange: formData.ageRange,
            gender: formData.gender,
            country: formData.country,
            languagePreference: formData.languagePreference,
            accessibilityCategory: formData.accessibilityCategory,
            accessibilitySubOption: formData.accessibilitySubOption,
            additionalSupport: formData.additionalSupport,
            consentGiven: formData.consentGiven,
          } : undefined,
        });
        
        console.log('Step 5: Preferences created:', newPreferences);
        setPreferences(newPreferences);
        console.log('=== REGISTRATION COMPLETE ===');
      } else {
        console.log('=== UPDATE EXISTING USER PATH ===');
        // Update existing user
        console.log('Step 1: Current user:', user);
        console.log('Step 1a: user.id:', user.id);
        
        if (!user.id) {
          throw new Error('User ID is missing from user object');
        }
        
        console.log('Step 2: Updating profile for user ID:', user.id);
        await userService.updateProfile(user.id, {
          name: formData.name,
          email: formData.email,
        });

        const primaryAccessibilityNeed = getAccessibilityNeed();
        const colorPalette = getColorPalette(primaryAccessibilityNeed);
        console.log('Step 3: Updating preferences for user ID:', user.id);
        const updatedPreferences = await userService.updatePreferences(user.id, {
          accessibility_need: primaryAccessibilityNeed,
          reading_level: formData.readingLevel,
          preferred_complexity: formData.preferredComplexity,
          color_palette: colorPalette,
          other_preferences: {
            ageRange: formData.ageRange,
            gender: formData.gender,
            country: formData.country,
            languagePreference: formData.languagePreference,
            accessibilityCategory: formData.accessibilityCategory,
            accessibilitySubOption: formData.accessibilitySubOption,
            additionalSupport: formData.additionalSupport,
            consentGiven: formData.consentGiven,
          },
        });
        console.log('Step 4: Preferences updated:', updatedPreferences);
        setPreferences(updatedPreferences);
        console.log('=== UPDATE COMPLETE ===');
      }

      console.log('Navigating to rephrase page...');
      navigate('/rephrase');
    } catch (err: any) {
      console.error('=== ERROR CAUGHT ===');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save user information. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== SUBMIT FINISHED ===');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoginMode ? (
        // Login Mode: Two-column layout with personas
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Left Side - Personas */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-6 md:p-8 lg:p-10 xl:p-12 flex flex-col">
            {/* Persona Cards - Centered */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="max-w-lg w-full">
                <div className="mb-4 md:mb-6 lg:mb-8">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3" style={{ color: '#1e3a8a' }}>
                    SenseAble
                  </h1>
                  <p className="text-sm md:text-base mb-3 md:mb-4 lg:mb-6" style={{ color: '#2563eb' }}>
                    Empowering every user with personalized accessibility
                  </p>
                  <h2 className="text-base md:text-lg lg:text-xl font-semibold" style={{ color: '#1e3a8a' }}>
                    Get started with these user personas
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6 max-w-md">
                  {personas.map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handlePersonaSelect(persona)}
                      className={`bg-white rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 w-full aspect-square flex flex-col items-center justify-center transition-all duration-200 hover:shadow-lg ${
                        selectedPersona === persona.id
                          ? 'ring-4 shadow-xl'
                          : 'hover:scale-105'
                      }`}
                      style={
                        selectedPersona === persona.id
                          ? { borderColor: persona.color }
                          : {}
                      }
                    >
                      <div
                        className="rounded-full flex items-center justify-center mb-1 md:mb-2 transition-colors"
                        style={{
                          width: 'clamp(2.5rem, 5vw, 4rem)',
                          height: 'clamp(2.5rem, 5vw, 4rem)',
                          backgroundColor: selectedPersona === persona.id ? persona.color : persona.bgColor,
                        }}
                      >
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"
                          style={{
                            color: selectedPersona === persona.id ? '#ffffff' : persona.color,
                          }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm md:text-base font-semibold text-gray-900">{persona.name}</span>
                    </button>
                  ))}
                </div>

                {/* Warning Alert */}
                <div 
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 max-w-md cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => setIsWarningExpanded(!isWarningExpanded)}
                >
                  <div className="flex gap-2 md:gap-3">
                    <span className="text-yellow-600 text-base md:text-lg flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className={`text-xs md:text-sm text-gray-700 ${
                        isWarningExpanded ? '' : 'line-clamp-3'
                      }`}>
                        Please use the provided example personas to explore this demo. Due to organizational security, compliance, and data-governance constraints, the backend models used in this system (enterprise Azure deployments of GPT-5 and Agentic-Copilot services) cannot be exposed via a public interactive interface at this moment. The demo therefore uses representative personas and precomputed interactions that faithfully reflect the system's operational behavior.
                      </p>
                      <button 
                        className="text-blue-600 text-xs md:text-sm font-medium mt-1 md:mt-2 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsWarningExpanded(!isWarningExpanded);
                        }}
                      >
                        {isWarningExpanded ? 'Show less' : 'Read more'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-50 to-purple-50">
            <div className="flex items-center justify-center p-4 md:p-6 lg:p-8">
              <div className="max-w-md w-full bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-6 lg:p-8 my-4">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 lg:mb-8" style={{ color: '#2563eb' }}>
                We'd love to know more about you
              </h2>

              {error && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs md:text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 lg:space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Ali"
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                    disabled
                  />
                </div>

                {/* Age Range and Gender */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                  <div>
                    <label htmlFor="ageRange" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Age Range <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="ageRange"
                      value={formData.ageRange}
                      onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                      className="w-full px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      required
                      disabled
                    >
                      <option value="">Select</option>
                      <option value="18-24">18–24</option>
                      <option value="25-34">25–34</option>
                      <option value="35-44">35–44</option>
                      <option value="45-54">45–54</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      required
                      disabled
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Country and Language */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                  <div>
                    <label htmlFor="country" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      required
                      disabled
                    >
                      <option value="">Select</option>
                      <option value="india">India</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="canada">Canada</option>
                      <option value="australia">Australia</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="languagePreference" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Language Preference <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="languagePreference"
                      value={formData.languagePreference}
                      onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                      className="w-full px-2 md:px-3 lg:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      required
                      disabled
                    >
                      <option value="">Select</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="bengali">Bengali</option>
                    </select>
                  </div>
                </div>

                {/* Accessibility Needs */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
                    Do you have any accessibility needs? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {accessibilityOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleCategoryChange(option.id)}
                        className={`px-2.5 md:px-3 lg:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-full transition-all ${
                          formData.accessibilityCategory === option.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        disabled
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-option dropdown or text input */}
                  {formData.accessibilityCategory && formData.accessibilityCategory !== 'none' && (
                    <div className="mt-2 md:mt-3">
                      {formData.accessibilityCategory === 'others' ? (
                        <input
                          type="text"
                          id="accessibilitySubOption"
                          value={formData.accessibilitySubOption}
                          onChange={(e) => setFormData({ ...formData, accessibilitySubOption: e.target.value })}
                          placeholder="Please specify..."
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          required
                          disabled
                        />
                      ) : (
                        <select
                          id="accessibilitySubOption"
                          value={formData.accessibilitySubOption}
                          onChange={(e) => setFormData({ ...formData, accessibilitySubOption: e.target.value })}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          required
                          disabled
                        >
                          <option value="">Select option</option>
                          {accessibilityOptions
                            .find((opt) => opt.id === formData.accessibilityCategory)
                            ?.options.map((subOption) => (
                              <option key={subOption} value={subOption}>
                                {subOption}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="additionalSupport" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Anything else we should know? <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    id="additionalSupport"
                    value={formData.additionalSupport}
                    onChange={(e) => setFormData({ ...formData, additionalSupport: e.target.value })}
                    placeholder="Share any additional information..."
                    rows={1}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
                    disabled
                  />
                </div>

                {/* Consent */}
                <div className="pt-1 md:pt-2">
                  <label className="flex items-start gap-2 md:gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentGiven}
                      onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                      className="mt-0.5 h-4 w-4 md:h-5 md:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <span className="text-xs md:text-sm text-gray-700">
                      I consent to my information being stored and used to enhance the system{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                {/* Proceed Button */}
                <div className="pt-2 md:pt-3">
                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className={`w-full py-2.5 md:py-3 px-4 md:px-6 rounded-lg font-medium text-sm md:text-base text-white transition-all ${
                      loading || !isFormValid()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Proceed'}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Profile Edit Mode: Original centered layout
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">
                Update Your Profile
              </h2>
              <p className="text-gray-600 mb-8">
                Tell us about yourself to personalize your experience
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Profile Edit Mode - Full Form with All Fields */}
                {/* User Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                      Age Range
                    </label>
                    <select
                      id="ageRange"
                      value={formData.ageRange}
                      onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select age range</option>
                      <option value="18-24">18–24</option>
                      <option value="25-34">25–34</option>
                      <option value="35-44">35–44</option>
                      <option value="45-54">45–54</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select country</option>
                      <option value="india">India</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="canada">Canada</option>
                      <option value="australia">Australia</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="languagePreference" className="block text-sm font-medium text-gray-700 mb-1">
                      Language Preference
                    </label>
                    <select
                      id="languagePreference"
                      value={formData.languagePreference}
                      onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select language</option>
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="bengali">Bengali</option>
                    </select>
                  </div>
                </div>

                {/* Legacy Accessibility Preferences */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Display Preferences</h3>
                  
                  <div>
                    <label htmlFor="accessibilityNeed" className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Accessibility Mode
                    </label>
                    <select
                      id="accessibilityNeed"
                      value={formData.accessibilityNeed}
                      onChange={(e) => setFormData({ ...formData, accessibilityNeed: e.target.value as AccessibilityNeed })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="colorblind">Colorblind</option>
                      <option value="dyslexia">Dyslexia</option>
                      <option value="low-vision">Low Vision</option>
                      <option value="cognitive">Cognitive</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="readingLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Reading Level
                    </label>
                    <select
                      id="readingLevel"
                      value={formData.readingLevel}
                      onChange={(e) => setFormData({ ...formData, readingLevel: e.target.value as ReadingLevel })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="basic">Basic</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="preferredComplexity" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Text Complexity
                    </label>
                    <select
                      id="preferredComplexity"
                      value={formData.preferredComplexity}
                      onChange={(e) => setFormData({ ...formData, preferredComplexity: e.target.value as ComplexityLevel })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="simple">Simple - Easy to understand</option>
                      <option value="moderate">Moderate - Balanced</option>
                      <option value="complex">Complex - Detailed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/rephrase')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountForm;
