const fs = require('fs');
const path = require('path');

// Helper function to convert markdown bold to underline tags
function convertBoldToUnderlineTags(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<u>$1</u>');
}

// Helper function to add familiarity tags to original text based on tagging data
function addFamiliarityTags(originalText, taggedPhrases) {
  // Sort phrases by start index in reverse to replace from end to beginning
  const sortedPhrases = [...taggedPhrases].sort((a, b) => b.start - a.start);

  let result = originalText;

  for (const phrase of sortedPhrases) {
    const tag = phrase.tag === 'not_familiar' ? 'nf' : phrase.tag === 'somewhat_familiar' ? 'sf' : 'f';
    const before = result.substring(0, phrase.start);
    const phraseText = phrase.phrase;
    const after = result.substring(phrase.end);

    result = before + `<${tag}>${phraseText}</${tag}>` + after;
  }

  return result;
}

// Parse markdown file
function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let originalText = '';
  let gentleRewrite = '';
  let fullRewrite = '';
  let taggedPhrases = [];

  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('Original text:')) {
      currentSection = 'original';
      continue;
    } else if (line.startsWith('Tagging:')) {
      currentSection = 'tagging';
      continue;
    } else if (line.startsWith('Gentle Rewrite:')) {
      currentSection = 'gentle';
      continue;
    } else if (line.startsWith('Hard Rewrite:')) {
      currentSection = 'hard';
      continue;
    }

    if (currentSection === 'original' && line && !line.startsWith('Original Phrase')) {
      originalText += (originalText ? ' ' : '') + line;
    } else if (currentSection === 'gentle' && line && !line.startsWith('Gentle')) {
      gentleRewrite += (gentleRewrite ? ' ' : '') + line;
    } else if (currentSection === 'hard' && line && !line.startsWith('Hard')) {
      fullRewrite += (fullRewrite ? ' ' : '') + line;
    } else if (currentSection === 'tagging' && line && line.includes(',')) {
      // Parse CSV tagging line
      const parts = line.split(',');
      if (parts.length >= 4 && !line.startsWith('Original Phrase')) {
        const phrase = parts[0].replace(/^"|"$/g, '').trim();
        const tag = parts[1].trim().toLowerCase().replace(/ /g, '_');
        const simpler = parts[2].replace(/^"|"$/g, '').trim();
        const explanation = parts[3].replace(/^"|"$/g, '').trim();

        if (phrase && tag && simpler) {
          taggedPhrases.push({
            phrase,
            tag,
            simpler,
            explanation
          });
        }
      }
    }
  }

  return {
    originalText: originalText.trim(),
    gentleRewrite: gentleRewrite.trim(),
    fullRewrite: fullRewrite.trim(),
    taggedPhrases
  };
}

// Create JSON structure with tagged text
function createExampleJSON(personaName, personaData, id) {
  const { originalText, gentleRewrite, fullRewrite, taggedPhrases } = personaData;

  // Build tagged phrases data with start/end indices for finding
  const formattedPhrases = taggedPhrases.map(tp => {
    const index = originalText.indexOf(tp.phrase);
    if (index === -1) {
      console.warn(`Warning: Phrase "${tp.phrase}" not found in original text for ${personaName}`);
      return null;
    }

    return {
      phrase: tp.phrase,
      tag: tp.tag,
      start: index,
      end: index + tp.phrase.length,
      explanation: tp.explanation,
      simpler: tp.simpler
    };
  }).filter(p => p !== null);

  // Add familiarity tags to original text
  const taggedOriginalText = addFamiliarityTags(originalText, formattedPhrases);

  // Convert markdown bold to underline tags in rewrites
  const taggedGentleRewrite = convertBoldToUnderlineTags(gentleRewrite);
  const taggedFullRewrite = convertBoldToUnderlineTags(fullRewrite);

  return {
    id,
    persona: personaName,
    original_text: taggedOriginalText,
    gentle_rewrite: taggedGentleRewrite,
    full_rewrite: taggedFullRewrite,
    tagged_phrases: formattedPhrases.map(tp => ({
      phrase: tp.phrase,
      tag: tp.tag,
      explanation: tp.explanation,
      simpler: tp.simpler
    }))
  };
}

// Main execution
function main() {
  const examplesDir = path.join(__dirname, '..', 'assets', 'examples');
  const personas = ['arun', 'maria', 'sruti', 'george'];

  const examples = [];
  let id = 1;

  for (const persona of personas) {
    const filePath = path.join(examplesDir, `${persona}.md`);

    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} not found, skipping...`);
      continue;
    }

    console.log(`Processing ${persona}.md...`);
    const personaData = parseMarkdown(filePath);
    const exampleJSON = createExampleJSON(persona, personaData, id++);
    examples.push(exampleJSON);
  }

  const output = {
    examples
  };

  const outputPath = path.join(__dirname, '..', 'src', 'mocks', 'exampleTexts.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\nSuccessfully converted ${examples.length} examples to ${outputPath}`);
}

main();
