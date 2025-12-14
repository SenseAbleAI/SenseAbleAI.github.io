import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { userService } from '../../services/userService';
import { AccessibilityNeed, ReadingLevel, ComplexityLevel } from '../../types';
import { getColorPalette } from '../../utils/colorPalettes';

const ProfileEdit: React.FC = () => {
  const { user, preferences, setUser, setPreferences } = useUser();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    ageRange: '',
    gender: '',
    country: '',
    languagePreference: '',
    accessibilityCategory: '',
    accessibilitySubOption: '',
    additionalSupport: '',
  });

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    if (user && preferences) {
      setFormData({
        name: capitalizeFirstLetter(user.name),
        ageRange: preferences.other_preferences?.ageRange || '',
        gender: capitalizeFirstLetter(preferences.other_preferences?.gender || ''),
        country: capitalizeFirstLetter(preferences.other_preferences?.country || ''),
        languagePreference: capitalizeFirstLetter(preferences.other_preferences?.languagePreference || ''),
        accessibilityCategory: preferences.other_preferences?.accessibilityCategory || '',
        accessibilitySubOption: preferences.other_preferences?.accessibilitySubOption || '',
        additionalSupport: preferences.other_preferences?.additionalSupport || '',
      });
    }
  }, [user, preferences]);

  const accessibilityTabs = [
    { id: 'none', label: 'None', options: [] },
    { id: 'vision', label: 'Vision', options: ['Colorblind', 'Low vision'] },
    { id: 'hearing', label: 'Hearing', options: ['Mild hearing loss', 'Hard of hearing', 'Deaf'] },
    { id: 'smell', label: 'Smell (Olfactory)', options: ['Anosmia', 'Hyposmia'] },
    { id: 'cognitive', label: 'Cognitive', options: ['Dyslexia', 'ADHD'] },
    { id: 'others', label: 'Others', options: [] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSaveMessage('');

    try {
      // Determine primary accessibility need based on category
      let primaryAccessibilityNeed: AccessibilityNeed = 'none';
      const subOption = formData.accessibilitySubOption.toLowerCase();
      
      if (formData.accessibilityCategory && formData.accessibilityCategory !== 'none') {
        if (subOption.includes('colorblind')) primaryAccessibilityNeed = 'colorblind';
        else if (subOption.includes('low vision')) primaryAccessibilityNeed = 'low-vision';
        else if (subOption.includes('dyslexia')) primaryAccessibilityNeed = 'dyslexia';
        else if (subOption.includes('adhd') || subOption.includes('cognitive')) primaryAccessibilityNeed = 'cognitive';
        else primaryAccessibilityNeed = 'other';
      }

      const preferencesData = {
        accessibility_need: primaryAccessibilityNeed,
        reading_level: preferences?.reading_level || 'intermediate' as ReadingLevel,
        preferred_complexity: preferences?.preferred_complexity || 'moderate' as ComplexityLevel,
        color_palette: getColorPalette(primaryAccessibilityNeed),
        other_preferences: {
          ageRange: formData.ageRange,
          gender: formData.gender,
          country: formData.country,
          languagePreference: formData.languagePreference,
          accessibilityCategory: formData.accessibilityCategory,
          accessibilitySubOption: formData.accessibilitySubOption,
          additionalSupport: formData.additionalSupport,
        },
      };

      const updatedPreferences = await userService.updatePreferences(user.id, preferencesData);
      setPreferences(updatedPreferences);
      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Edit Icon */}
      <div className="flex justify-end items-center mb-2">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label={isEditing ? 'Cancel editing' : 'Edit profile'}
        >
          {isEditing ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: capitalizeFirstLetter(e.target.value) })}
            className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={!isEditing}
          />
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <select
            value={formData.ageRange}
            onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
            className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={!isEditing}
          >
            <option value="">Select age range</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: capitalizeFirstLetter(e.target.value) })}
            className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={!isEditing}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: capitalizeFirstLetter(e.target.value) })}
            className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="e.g., India"
            disabled={!isEditing}
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <input
            type="text"
            value={formData.languagePreference}
            onChange={(e) => setFormData({ ...formData, languagePreference: capitalizeFirstLetter(e.target.value) })}
            className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="e.g., English"
            disabled={!isEditing}
          />
        </div>

        {/* Accessibility Needs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accessibility Needs</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {accessibilityTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => isEditing && setFormData({ ...formData, accessibilityCategory: tab.id, accessibilitySubOption: '' })}
                disabled={!isEditing}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  formData.accessibilityCategory === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-option dropdown or text input */}
          {formData.accessibilityCategory && formData.accessibilityCategory !== 'none' && (
            <div className="mt-3">
              {formData.accessibilityCategory === 'others' ? (
                <input
                  type="text"
                  value={formData.accessibilitySubOption}
                  onChange={(e) => setFormData({ ...formData, accessibilitySubOption: e.target.value })}
                  placeholder="Please specify..."
                  className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!isEditing}
                />
              ) : (
                <select
                  value={formData.accessibilitySubOption}
                  onChange={(e) => setFormData({ ...formData, accessibilitySubOption: e.target.value })}
                  className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  disabled={!isEditing}
                >
                  <option value="">Select option</option>
                  {accessibilityTabs
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

        {/* Additional Support */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anything else that can support you?
          </label>
          <textarea
            value={formData.additionalSupport}
            onChange={(e) => setFormData({ ...formData, additionalSupport: e.target.value })}
            className={`w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            rows={3}
            placeholder="Tell us more..."
            disabled={!isEditing}
          />
        </div>

        {/* Save Button - Only show when editing */}
        {isEditing && (
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-base font-medium text-white bg-primary rounded hover:bg-primary-dark disabled:bg-gray-400 transition"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}

        {saveMessage && (
          <div className={`text-sm text-center ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileEdit;
