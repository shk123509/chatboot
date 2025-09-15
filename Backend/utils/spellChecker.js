const stringSimilarity = require('string-similarity');

// Common farming terms and corrections
const farmingTerms = [
    // Crops
    'wheat', 'rice', 'corn', 'barley', 'oats', 'rye', 'sorghum', 'millet',
    'soybean', 'sunflower', 'canola', 'cotton', 'sugarcane', 'potato', 'tomato',
    'onion', 'carrot', 'cabbage', 'lettuce', 'spinach', 'broccoli', 'cucumber',
    'pepper', 'eggplant', 'bean', 'pea', 'lentil', 'chickpea',
    
    // Farming terms
    'fertilizer', 'pesticide', 'herbicide', 'fungicide', 'insecticide',
    'irrigation', 'cultivation', 'harvesting', 'planting', 'sowing',
    'soil', 'seed', 'crop', 'yield', 'farming', 'agriculture',
    'organic', 'compost', 'manure', 'mulch', 'pruning', 'weeding',
    'greenhouse', 'field', 'garden', 'farm', 'tractor', 'plow',
    
    // Diseases and pests
    'disease', 'pest', 'aphid', 'caterpillar', 'blight', 'rust', 'mildew',
    'fungus', 'bacteria', 'virus', 'nematode', 'thrip', 'whitefly',
    'bollworm', 'cutworm', 'locust', 'grasshopper',
    
    // Weather and seasons
    'weather', 'rain', 'drought', 'flood', 'temperature', 'humidity',
    'season', 'spring', 'summer', 'autumn', 'winter', 'monsoon',
    
    // Common misspellings and their corrections
    'fertlizer', 'pestiside', 'herbacide', 'fungacide', 'insectiside',
    'irrugation', 'cultivashun', 'harvestng', 'plantng', 'sowng',
    'orgenic', 'compost', 'manuer', 'prunng', 'weedng',
    'greenhous', 'feild', 'gardne', 'tracktor', 'plow',
    'diseez', 'apheed', 'caterpiler', 'blihgt', 'mildoo',
    'fungos', 'bakteria', 'nematod', 'threp', 'whitefl',
    'wether', 'rane', 'drout', 'flud', 'temperatur', 'humidty',
    'sezon', 'sprng', 'sumer', 'autum', 'wintr', 'monsun'
];

// Corrections mapping
const corrections = {
    // Common misspellings
    'fertlizer': 'fertilizer',
    'pestiside': 'pesticide',
    'herbacide': 'herbicide',
    'fungacide': 'fungicide',
    'insectiside': 'insecticide',
    'irrugation': 'irrigation',
    'cultivashun': 'cultivation',
    'harvestng': 'harvesting',
    'plantng': 'planting',
    'sowng': 'sowing',
    'orgenic': 'organic',
    'manuer': 'manure',
    'prunng': 'pruning',
    'weedng': 'weeding',
    'greenhous': 'greenhouse',
    'feild': 'field',
    'gardne': 'garden',
    'tracktor': 'tractor',
    'diseez': 'disease',
    'apheed': 'aphid',
    'caterpiler': 'caterpillar',
    'blihgt': 'blight',
    'mildoo': 'mildew',
    'fungos': 'fungus',
    'bakteria': 'bacteria',
    'nematod': 'nematode',
    'threp': 'thrip',
    'whitefl': 'whitefly',
    'wether': 'weather',
    'rane': 'rain',
    'drout': 'drought',
    'flud': 'flood',
    'temperatur': 'temperature',
    'humidty': 'humidity',
    'sezon': 'season',
    'sprng': 'spring',
    'sumer': 'summer',
    'autum': 'autumn',
    'wintr': 'winter',
    'monsun': 'monsoon',
    
    // Hindi/Urdu transliteration corrections
    'khet': 'field',
    'fasal': 'crop',
    'beej': 'seed',
    'paani': 'water',
    'khad': 'fertilizer',
    'kira': 'pest',
    'bimari': 'disease',
    'mausam': 'weather',
    'barish': 'rain',
    'sukha': 'drought',
    'gehun': 'wheat',
    'chawal': 'rice',
    'makka': 'corn',
    'aloo': 'potato',
    'tamatar': 'tomato',
    'pyaz': 'onion',
    'gajar': 'carrot'
};

class SpellChecker {
    constructor() {
        this.farmingTerms = farmingTerms;
        this.corrections = corrections;
        this.threshold = 0.7; // Minimum similarity score (increased for better accuracy)
    }

    // Correct individual words
    correctWord(word) {
        const lowerWord = word.toLowerCase();
        
        // Direct correction mapping
        if (this.corrections[lowerWord]) {
            return this.corrections[lowerWord];
        }
        
        // Find similar words using string similarity
        const matches = stringSimilarity.findBestMatch(lowerWord, this.farmingTerms);
        
        if (matches.bestMatch.rating > this.threshold) {
            return matches.bestMatch.target;
        }
        
        return word; // Return original if no good match found
    }

    // Correct a full sentence
    correctSentence(sentence) {
        if (!sentence) return sentence;
        
        const words = sentence.split(/(\s+)/); // Split while preserving spaces
        const correctedWords = words.map(word => {
            // Only correct actual words (not spaces or punctuation)
            if (/^[a-zA-Z]+$/.test(word)) {
                const corrected = this.correctWord(word);
                return corrected !== word ? corrected : word;
            }
            return word;
        });
        
        return correctedWords.join('');
    }

    // Get suggestions for a word
    getSuggestions(word, maxSuggestions = 3) {
        const lowerWord = word.toLowerCase();
        
        // Direct correction first
        if (this.corrections[lowerWord]) {
            return [this.corrections[lowerWord]];
        }
        
        // Get multiple suggestions
        const similarities = this.farmingTerms.map(term => ({
            word: term,
            similarity: stringSimilarity.compareTwoStrings(lowerWord, term)
        }));
        
        return similarities
            .filter(item => item.similarity > this.threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, maxSuggestions)
            .map(item => item.word);
    }

    // Check if correction was made and return info
    checkAndCorrect(sentence) {
        if (!sentence) return { corrected: sentence, hasCorrections: false, suggestions: [] };
        
        const words = sentence.split(/\s+/);
        const corrections = [];
        let hasCorrections = false;
        
        const correctedWords = words.map(word => {
            const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation for checking
            if (cleanWord && /^[a-zA-Z]+$/.test(cleanWord)) {
                const corrected = this.correctWord(cleanWord);
                if (corrected !== cleanWord) {
                    corrections.push({
                        original: cleanWord,
                        corrected: corrected,
                        suggestions: this.getSuggestions(cleanWord)
                    });
                    hasCorrections = true;
                    return word.replace(cleanWord, corrected);
                }
            }
            return word;
        });
        
        return {
            corrected: correctedWords.join(' '),
            hasCorrections,
            corrections,
            original: sentence
        };
    }

    // Add custom terms (for learning new words)
    addTerm(term) {
        if (!this.farmingTerms.includes(term.toLowerCase())) {
            this.farmingTerms.push(term.toLowerCase());
        }
    }

    // Add custom correction
    addCorrection(wrong, correct) {
        this.corrections[wrong.toLowerCase()] = correct.toLowerCase();
    }
}

// Create instance and export functions
const spellChecker = new SpellChecker();

// Export main function for easy usage
function checkSpelling(message, language = 'en') {
    try {
        const result = spellChecker.checkAndCorrect(message);
        return {
            correctedMessage: result.corrected,
            hasCorrections: result.hasCorrections,
            corrections: result.corrections,
            originalMessage: result.original
        };
    } catch (error) {
        console.error('Spell check error:', error);
        return {
            correctedMessage: message,
            hasCorrections: false,
            corrections: [],
            originalMessage: message
        };
    }
}

module.exports = {
    SpellChecker,
    checkSpelling,
    spellChecker
};
