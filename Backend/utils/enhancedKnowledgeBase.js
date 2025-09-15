const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

class EnhancedKnowledgeBase {
    constructor() {
        this.knowledgeBase = null;
        this.loadKnowledgeBase();
        this.threshold = 0.4; // Similarity threshold
        this.initializeGovernmentSchemes();
    }

    loadKnowledgeBase() {
        try {
            const dataPath = path.join(__dirname, '..', 'data', 'comprehensive_agriculture_data.json');
            const rawData = fs.readFileSync(dataPath, 'utf8');
            this.knowledgeBase = JSON.parse(rawData);
            console.log('📚 Enhanced Knowledge Base loaded with', this.getTotalEntries(), 'entries');
        } catch (error) {
            console.error('❌ Failed to load knowledge base:', error.message);
            this.knowledgeBase = { metadata: { total_entries: 0 }, crop_growth: [], soil_management: [], irrigation: [], pest_control: [], fertilizers: [], government_schemes: [] };
        }
    }

    initializeGovernmentSchemes() {
        if (!this.knowledgeBase) return;
        
        if (!this.knowledgeBase.government_schemes) {
            this.knowledgeBase.government_schemes = [];
        }

        // Add comprehensive government schemes data
        const schemes = [
            {
                id: 'pmkisan_info',
                question: 'What is PM-Kisan Samman Nidhi scheme?',
                keywords: ['pm-kisan', 'pradhan mantri kisan', 'samman nidhi', 'direct cash transfer', '6000 rupees', 'small farmers', 'marginal farmers', 'dbt'],
                answer: `💰 **PM-Kisan Samman Nidhi Scheme**

**Objective:** Direct income support to farmer families owning cultivable land

**Benefits:**
• ₹6,000 per year in 3 installments of ₹2,000 each
• Direct Bank Transfer (DBT) - no middlemen
• Covers small and marginal farmers
• Payment every 4 months

**Eligibility:**
• All farmer families having cultivable land records
• No income limit
• Aadhaar card mandatory

**How to apply:**
1. Visit pmkisan.gov.in
2. Register with Aadhaar and bank details
3. Submit land records
4. Verify through village officials

**Required Documents:** Aadhaar, Bank account details, Land ownership records`,
                category: 'government_schemes',
                confidence: 0.95,
                language: 'english'
            },
            {
                id: 'fasal_bima_info',
                question: 'Tell me about PM Fasal Bima Yojana crop insurance',
                keywords: ['fasal bima', 'crop insurance', 'pradhan mantri fasal bima', 'pmfby', 'crop loss', 'weather insurance', 'natural disasters'],
                answer: `🛡️ **PM Fasal Bima Yojana (PMFBY)**

**Objective:** Comprehensive crop insurance against natural calamities

**Coverage:**
• All food crops, oilseeds, and annual commercial crops
• Weather-based and area approach
• Pre-sowing to post-harvest losses
• Localized disasters coverage

**Premium Rates (Farmer's Share):**
• Kharif crops: 2% of sum insured
• Rabi crops: 1.5% of sum insured
• Annual crops: 5% of sum insured

**Benefits:**
• Quick claim settlement through technology
• No upper limit on government subsidy
• Mobile app for easy enrollment
• Coverage for all stages of crop cycle

**How to apply:** Through banks, insurance companies, or online portal`,
                category: 'government_schemes',
                confidence: 0.95,
                language: 'english'
            },
            {
                id: 'kcc_info',
                question: 'How to get Kisan Credit Card loan?',
                keywords: ['kisan credit card', 'kcc', 'agricultural loan', 'credit card', 'farm loan', '4 percent interest', 'crop loan'],
                answer: `💳 **Kisan Credit Card (KCC)**

**Purpose:** Short-term credit for agricultural activities

**Benefits:**
• Credit limit up to ₹3 lakh without collateral
• Interest rate: 4% per annum (with subsidy)
• Flexible repayment aligned with harvest
• Valid for 5 years with annual review

**Coverage:**
• Crop cultivation expenses
• Post-harvest activities
• Household consumption
• Farm maintenance expenses

**Eligibility:**
• Farmers owning/cultivating land
• Tenant farmers with valid documents
• Self Help Group members

**Documents Required:**
• Identity proof (Aadhaar)
• Address proof
• Land documents
• Bank account details

**Apply at:** Any bank branch or online banking`,
                category: 'government_schemes',
                confidence: 0.95,
                language: 'english'
            },
            {
                id: 'msp_info',
                question: 'What is Minimum Support Price MSP?',
                keywords: ['msp', 'minimum support price', 'procurement', 'mandis', 'government purchase', 'food corporation'],
                answer: `📈 **Minimum Support Price (MSP)**

**Objective:** Price support mechanism to protect farmers from price fluctuations

**Coverage:** 23 crops including:
• Cereals: Wheat, Rice, Maize, Jowar, Bajra
• Pulses: Chana, Masoor, Moong, Urad, Arhar
• Oilseeds: Groundnut, Sunflower, Soybean, Rapeseed
• Commercial crops: Cotton, Sugarcane

**Benefits:**
• Guaranteed minimum price for produce
• Direct government procurement
• Protection from market volatility
• Assured income security

**How it works:**
1. Government announces MSP before sowing season
2. Farmers can sell at government mandis
3. Payment through direct bank transfer
4. Quality standards apply

**Where to sell:** Government mandis, FCI centers, State procurement agencies`,
                category: 'government_schemes',
                confidence: 0.95,
                language: 'english'
            }
        ];

        // Add schemes to knowledge base
        schemes.forEach(scheme => {
            const exists = this.knowledgeBase.government_schemes.find(s => s.id === scheme.id);
            if (!exists) {
                this.knowledgeBase.government_schemes.push(scheme);
            }
        });

        console.log('🏛️ Government schemes added to knowledge base');
    }

    getTotalEntries() {
        if (!this.knowledgeBase || !this.knowledgeBase.metadata) return 0;
        return this.knowledgeBase.metadata.total_entries || 0;
    }

    // Search for best matching answer
    searchKnowledge(query, maxResults = 3) {
        if (!this.knowledgeBase) return [];

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search through all categories
        const categories = ['crop_growth', 'soil_management', 'irrigation', 'pest_control', 'fertilizers', 'government_schemes'];
        
        for (const category of categories) {
            if (!this.knowledgeBase[category]) continue;

            for (const entry of this.knowledgeBase[category]) {
                let score = 0;

                // Check direct keyword matches (highest priority)
                const keywordMatches = entry.keywords.filter(keyword => 
                    lowerQuery.includes(keyword.toLowerCase())
                ).length;
                score += keywordMatches * 0.4;

                // Check question similarity
                const questionSimilarity = stringSimilarity.compareTwoStrings(
                    lowerQuery, 
                    entry.question.toLowerCase()
                );
                score += questionSimilarity * 0.3;

                // Check if query words appear in the answer
                const queryWords = lowerQuery.split(/\s+/);
                const answerLower = entry.answer.toLowerCase();
                const answerMatches = queryWords.filter(word => 
                    word.length > 3 && answerLower.includes(word)
                ).length;
                score += (answerMatches / queryWords.length) * 0.3;

                // Add confidence bonus
                score *= entry.confidence || 0.8;

                if (score > this.threshold) {
                    results.push({
                        ...entry,
                        matchScore: score,
                        category: category
                    });
                }
            }
        }

        // Sort by match score and return top results
        return results
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, maxResults);
    }

    // Get best answer for a query
    getBestAnswer(query, language = 'english') {
        const results = this.searchKnowledge(query, 1);
        
        if (results.length === 0) {
            return null;
        }

        const bestMatch = results[0];
        
        return {
            answer: bestMatch.answer,
            confidence: bestMatch.matchScore,
            source: `Knowledge Base - ${bestMatch.category}`,
            id: bestMatch.id,
            category: bestMatch.category
        };
    }

    // Get contextual response based on previous conversation
    getContextualResponse(query, previousMessages = [], language = 'english') {
        // First try direct search
        let result = this.getBestAnswer(query, language);
        
        if (!result && previousMessages.length > 0) {
            // If no direct match, try to understand context from previous messages
            const context = previousMessages
                .slice(-3) // Last 3 messages
                .map(msg => msg.content)
                .join(' ');
            
            const contextualQuery = `${context} ${query}`;
            result = this.getBestAnswer(contextualQuery, language);
        }

        return result;
    }

    // Add new entry to knowledge base (for learning)
    addEntry(category, question, keywords, answer, confidence = 0.8) {
        if (!this.knowledgeBase[category]) {
            this.knowledgeBase[category] = [];
        }

        const newEntry = {
            id: `${category}_${Date.now()}`,
            question,
            keywords,
            answer,
            category,
            confidence,
            language: 'english',
            addedAt: new Date().toISOString()
        };

        this.knowledgeBase[category].push(newEntry);
        this.knowledgeBase.metadata.total_entries++;

        // Optionally save to file (be careful with file operations)
        console.log('📝 New entry added to knowledge base:', newEntry.id);
        
        return newEntry.id;
    }

    // Get category statistics
    getCategoryStats() {
        if (!this.knowledgeBase) return {};

        const stats = {};
        const categories = ['crop_growth', 'soil_management', 'irrigation', 'pest_control', 'fertilizers', 'government_schemes'];
        
        for (const category of categories) {
            stats[category] = this.knowledgeBase[category] ? this.knowledgeBase[category].length : 0;
        }

        return stats;
    }

    // Search by category
    searchByCategory(category, query, maxResults = 5) {
        if (!this.knowledgeBase[category]) return [];

        const lowerQuery = query.toLowerCase();
        const results = [];

        for (const entry of this.knowledgeBase[category]) {
            let score = 0;

            // Keyword matching
            const keywordMatches = entry.keywords.filter(keyword => 
                lowerQuery.includes(keyword.toLowerCase())
            ).length;
            score += keywordMatches * 0.5;

            // Question similarity
            const questionSimilarity = stringSimilarity.compareTwoStrings(
                lowerQuery, 
                entry.question.toLowerCase()
            );
            score += questionSimilarity * 0.5;

            if (score > this.threshold) {
                results.push({
                    ...entry,
                    matchScore: score
                });
            }
        }

        return results
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, maxResults);
    }

    // Get random tip from knowledge base
    getRandomTip(category = null) {
        const categories = category ? [category] : ['crop_growth', 'soil_management', 'irrigation', 'pest_control', 'fertilizers'];
        const allEntries = [];

        for (const cat of categories) {
            if (this.knowledgeBase[cat]) {
                allEntries.push(...this.knowledgeBase[cat].map(entry => ({ ...entry, category: cat })));
            }
        }

        if (allEntries.length === 0) return null;

        const randomEntry = allEntries[Math.floor(Math.random() * allEntries.length)];
        
        // Extract first paragraph as tip
        const firstParagraph = randomEntry.answer.split('\\n\\n')[0];
        
        return {
            tip: firstParagraph,
            category: randomEntry.category,
            source: randomEntry.question
        };
    }

    // Health check
    isHealthy() {
        return this.knowledgeBase && 
               this.knowledgeBase.metadata && 
               this.getTotalEntries() > 0;
    }
}

module.exports = EnhancedKnowledgeBase;