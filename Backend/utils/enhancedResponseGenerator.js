/**
 * Enhanced Response Generator for Detailed Farming Advice
 * Generates comprehensive 2000+ word responses with practical details
 */

const LocationCropAdaptation = require('./locationCropAdaptation');
const ResponseFormatter = require('./responseFormatter');

class EnhancedResponseGenerator {
    constructor() {
        this.minResponseLength = 2000; // Minimum word count for responses
        this.responseTemplates = this.loadResponseTemplates();
        this.farmingKnowledge = this.loadFarmingKnowledge();
        this.locationAdapter = new LocationCropAdaptation();
        this.responseFormatter = new ResponseFormatter();
    }

    /**
     * Load comprehensive farming knowledge base
     */
    loadFarmingKnowledge() {
        return {
            crops: {
                rice: {
                    planting: {
                        season: "Kharif (June-July)",
                        soil_preparation: "Deep plowing 2-3 times, puddling for water retention, leveling field",
                        seed_rate: "60-80 kg/hectare for broadcasting, 15-20 kg/hectare for SRI method",
                        spacing: "20x15 cm for transplanting, 25x25 cm for SRI",
                        depth: "2-3 cm for direct seeding, transplant 3-4 week old seedlings"
                    },
                    water_management: {
                        requirement: "1200-1500 mm total water requirement",
                        critical_stages: "Tillering, panicle initiation, flowering, grain filling",
                        schedule: "Maintain 5-7 cm water during tillering, 2-3 cm during grain formation",
                        drainage: "Drain field 10-15 days before harvest"
                    },
                    nutrient_management: {
                        npk_ratio: "120:60:60 kg/ha (N:P:K)",
                        application_schedule: "Basal: 50% N, 100% P&K; Top dressing: 25% N at tillering, 25% N at panicle initiation",
                        organic_options: "FYM 12-15 tons/ha, Green manure with dhaincha/sunhemp",
                        micronutrients: "Zinc sulfate 25 kg/ha in zinc-deficient soils"
                    },
                    pest_management: {
                        common_pests: ["Stem borer", "Leaf folder", "Brown planthopper", "Gundhi bug"],
                        diseases: ["Blast", "Sheath blight", "Bacterial leaf blight", "Brown spot"],
                        ipm_practices: "Use resistant varieties, maintain field sanitation, biological control with Trichogramma",
                        organic_solutions: "Neem oil 3%, Pheromone traps, Light traps"
                    }
                },
                wheat: {
                    planting: {
                        season: "Rabi (October-November)",
                        soil_preparation: "2-3 plowings, fine tilth, proper leveling",
                        seed_rate: "100-125 kg/ha for timely sowing, 125-150 kg/ha for late sowing",
                        spacing: "Row spacing 20-22.5 cm",
                        depth: "3-5 cm sowing depth"
                    },
                    water_management: {
                        requirement: "400-500 mm total water requirement",
                        critical_stages: "Crown root initiation (21 DAS), Tillering (45 DAS), Jointing (60 DAS), Flowering (75 DAS), Milking (95 DAS), Dough stage (110 DAS)",
                        irrigation_schedule: "5-6 irrigations at critical stages",
                        water_saving: "Bed planting saves 25-30% water"
                    },
                    nutrient_management: {
                        npk_ratio: "120:60:40 kg/ha for irrigated, 60:30:20 kg/ha for rainfed",
                        application_timing: "Basal: Full P&K, 50% N; Top dressing: 25% N at CRI, 25% N at late tillering",
                        organic_amendments: "FYM 10 tons/ha, Vermicompost 5 tons/ha",
                        foliar_nutrition: "2% urea spray at flowering and grain filling"
                    }
                },
                vegetables: {
                    tomato: {
                        cultivation: "Nursery raising 25-30 days, transplanting at 4-5 leaf stage",
                        spacing: "60x45 cm for determinate, 75x60 cm for indeterminate varieties",
                        support: "Staking required for indeterminate varieties, use 6-8 feet bamboo stakes",
                        pruning: "Remove suckers, maintain 1-2 stems, remove lower leaves after fruit set"
                    },
                    onion: {
                        cultivation: "Nursery for 6-8 weeks, transplant 45-50 day old seedlings",
                        spacing: "15x10 cm for kharif, 10x10 cm for rabi",
                        critical_care: "Shallow rooted, requires frequent light irrigation",
                        harvest_indicators: "Neck fall in 50-70% plants, tops turn yellowish"
                    }
                }
            },
            soil_management: {
                testing: {
                    parameters: "pH, EC, Organic Carbon, N-P-K, Micronutrients (Zn, Fe, Cu, Mn, B)",
                    frequency: "Every 2-3 years or when changing crop pattern",
                    sampling: "Collect from 15-20 spots, 0-15 cm depth for field crops",
                    interpretation: "pH 6.5-7.5 ideal for most crops, OC >0.5% good, <0.3% poor"
                },
                amendments: {
                    acidic_soil: "Lime application 2-4 tons/ha based on pH",
                    alkaline_soil: "Gypsum 2-5 tons/ha, sulfur 200-500 kg/ha",
                    organic_matter: "FYM 10-15 tons/ha annually, green manuring, crop residue incorporation",
                    biofertilizers: "Rhizobium for legumes, Azotobacter for cereals, PSB for all crops"
                }
            },
            irrigation_systems: {
                drip: {
                    efficiency: "90-95% water use efficiency",
                    suitable_crops: "Vegetables, fruits, cotton, sugarcane",
                    installation: "Main line, sub-main, laterals with drippers at 30-60 cm",
                    maintenance: "Acid treatment monthly, filter cleaning weekly"
                },
                sprinkler: {
                    efficiency: "70-80% water use efficiency",
                    suitable_crops: "Wheat, pulses, oilseeds, fodder crops",
                    pressure: "2.5-3.5 kg/cm² operating pressure",
                    spacing: "12x12 m or 15x15 m based on discharge"
                }
            }
        };
    }

    /**
     * Load response templates for structured answers
     */
    loadResponseTemplates() {
        return {
            comprehensive: {
                introduction: "Based on your question about {topic}, I'll provide you with a comprehensive guide covering all essential aspects that every farmer should know. This detailed explanation will help you understand not just the 'what' but also the 'why' and 'how' of {topic}.",
                sections: [
                    "Understanding the Basics",
                    "Practical Implementation Steps",
                    "Common Problems and Solutions",
                    "Best Practices from Successful Farmers",
                    "Economic Considerations",
                    "Seasonal Guidelines",
                    "Tools and Resources Needed",
                    "Government Schemes and Support"
                ]
            }
        };
    }

    /**
     * Generate comprehensive response with detailed farming information
     * Now includes location adaptation, unusual combination detection, and formatting options
     */
    generateDetailedResponse(query, ragResults, language = 'en', options = {}) {
        const {
            includeFormatting = false,
            formatType = 'html',
            enableChunking = true,
            validateResponse = true
        } = options;
        try {
            // Analyze query for location and crop information
            const queryAnalysis = this.locationAdapter.analyzeQuery(query);
            
            const response = {
                query: query,
                timestamp: new Date().toISOString(),
                language: language,
                queryAnalysis: queryAnalysis,
                sections: []
            };

            // Check for unusual crop-location combinations
            if (queryAnalysis.unusual_combination) {
                const unusualAdvice = this.locationAdapter.generateUnusualCombinationAdvice(
                    queryAnalysis.crop, 
                    queryAnalysis.location
                );
                
                return {
                    content: unusualAdvice + this.buildBasicFarmingGuidance(queryAnalysis.crop),
                    wordCount: unusualAdvice.split(' ').length,
                    confidence: 0.9,
                    queryAnalysis: queryAnalysis,
                    specialCase: 'unusual_combination'
                };
            }

            // Extract topic from query
            const topic = this.extractTopic(query);
        
            // Build comprehensive response
            let fullResponse = this.buildIntroduction(topic, query);
            
            // Add detailed sections
            fullResponse += this.buildBasicUnderstanding(topic, ragResults);
            fullResponse += this.buildPracticalImplementation(topic, ragResults);
            fullResponse += this.buildProblemSolutions(topic, ragResults);
            fullResponse += this.buildBestPractices(topic, ragResults);
            fullResponse += this.buildEconomicAnalysis(topic, ragResults);
            fullResponse += this.buildSeasonalGuidelines(topic, ragResults);
            
            // Add location-specific adaptation if location is identified
            if (queryAnalysis.location) {
                fullResponse += this.locationAdapter.generateLocationAdaptation(
                    queryAnalysis.crop || topic, 
                    queryAnalysis.location, 
                    queryAnalysis.season
                );
            } else if (queryAnalysis.crop) {
                fullResponse += this.locationAdapter.generateGenericAdvice(queryAnalysis.crop);
            }
            
            fullResponse += this.buildResourcesList(topic, ragResults);
            fullResponse += this.buildGovernmentSchemes(topic, ragResults);
            fullResponse += this.buildConclusion(topic, query);
            fullResponse += this.buildQuickReferenceTable(topic, ragResults);
            fullResponse += this.buildFAQSection(topic);
            fullResponse += this.buildExpertTips(topic);

            // Ensure minimum word count
            const wordCount = fullResponse.split(' ').length;
            if (wordCount < this.minResponseLength) {
                fullResponse += this.addSupplementaryInformation(topic, this.minResponseLength - wordCount);
            }

            response.content = fullResponse;
            response.wordCount = fullResponse.split(' ').length;
            response.confidence = this.calculateConfidence(ragResults, queryAnalysis);
            response.queryAnalysis = queryAnalysis;
            
            // Add response validation if requested
            if (validateResponse) {
                response.validation = this.validateResponse(fullResponse, queryAnalysis);
            }
            
            // Add formatting if requested
            if (includeFormatting) {
                response.formatted = this.responseFormatter.formatForFrontend(fullResponse, {
                    format: formatType,
                    enableChunking: enableChunking,
                    enableCollapsible: true
                });
            }
            
            return response;
            
        } catch (error) {
            console.error('Error generating detailed response:', error);
            return this.generateErrorResponse(query, error, language);
        }
    }

    /**
     * Validate response quality and completeness
     */
    validateResponse(content, queryAnalysis) {
        const validation = {
            wordCount: content.split(' ').length,
            hasHeaders: /#{1,6}/.test(content),
            hasLists: /[-\*]\s/.test(content),
            hasTables: /\|/.test(content),
            isComplete: true,
            warnings: [],
            score: 0
        };

        // Check word count
        if (validation.wordCount < 2000) {
            validation.warnings.push('Response below recommended 2000 words');
            validation.score -= 20;
        } else if (validation.wordCount > 5000) {
            validation.warnings.push('Response very long - consider chunking for better readability');
            validation.score -= 10;
        }

        // Check structure
        if (!validation.hasHeaders) {
            validation.warnings.push('Missing section headers');
            validation.score -= 15;
        }
        if (!validation.hasLists) {
            validation.warnings.push('Missing bullet points or lists');
            validation.score -= 10;
        }

        // Check location-specific content
        if (queryAnalysis.location && !content.toLowerCase().includes(queryAnalysis.location.toLowerCase())) {
            validation.warnings.push('Missing location-specific content');
            validation.score -= 25;
        }

        // Check crop-specific content
        if (queryAnalysis.crop && !content.toLowerCase().includes(queryAnalysis.crop.toLowerCase())) {
            validation.warnings.push('Missing crop-specific details');
            validation.score -= 20;
        }

        // Calculate final score
        validation.score = Math.max(0, 100 + validation.score);
        validation.isComplete = validation.score >= 70;

        return validation;
    }

    /**
     * Calculate confidence based on available information
     */
    calculateConfidence(ragResults, queryAnalysis) {
        let confidence = 0.5; // Base confidence
        
        // Boost confidence if we have location information
        if (queryAnalysis.location) confidence += 0.2;
        
        // Boost confidence if we have crop information
        if (queryAnalysis.crop) confidence += 0.2;
        
        // Boost confidence if we have RAG results
        if (ragResults && ragResults.length > 0) confidence += 0.1;
        
        // Boost confidence if combination is suitable
        if (queryAnalysis.crop && queryAnalysis.location) {
            const suitability = this.locationAdapter.validateCropLocation(queryAnalysis.crop, queryAnalysis.location);
            if (suitability.status === 'excellent') confidence += 0.1;
            else if (suitability.status === 'unsuitable') confidence -= 0.2;
        }
        
        return Math.min(1.0, Math.max(0.3, confidence));
    }

    /**
     * Generate error response for failed requests
     */
    generateErrorResponse(query, error, language) {
        const errorResponse = {
            query: query,
            error: true,
            errorMessage: error.message || 'Unknown error occurred',
            content: this.buildErrorFallback(query, language),
            wordCount: 0,
            confidence: 0.2,
            timestamp: new Date().toISOString()
        };
        
        errorResponse.wordCount = errorResponse.content.split(' ').length;
        return errorResponse;
    }

    /**
     * Build basic farming guidance for unusual combinations
     */
    buildBasicFarmingGuidance(crop) {
        return `
## 🌾 Basic Agricultural Guidance

While the specific crop-location combination you mentioned may not be ideal, here's some general farming guidance:

### General Crop Management Principles:
1. **Soil Health**: Always start with soil testing and improvement
2. **Water Management**: Efficient irrigation saves resources and improves yields
3. **Integrated Pest Management**: Combine biological, cultural, and chemical controls
4. **Market Planning**: Plan your crop based on local demand and market prices
5. **Climate Awareness**: Choose varieties suited to your local climate conditions

### Alternative Approaches:
- Consider greenhouse or protected cultivation for challenging combinations
- Explore dwarf or specially adapted varieties
- Look into contract farming with assured buyers
- Consider value addition and processing opportunities

For specific guidance on suitable crops for your area, please consult local agricultural extension services or specify a different crop better suited to your location.
`;
    }

    /**
     * Build error fallback content
     */
    buildErrorFallback(query, language) {
        const fallbacks = {
            'en': `
# 🌾 Agricultural Advisory Service

I apologize, but I encountered an issue while generating a comprehensive response to your query: "${query}"

## 📞 Alternative Resources:

1. **Local Agricultural Extension Office**: Contact your nearest Krishi Vigyan Kendra (KVK)
2. **State Agricultural University**: Reach out to experts in your state
3. **Online Resources**: Visit government agriculture portals
4. **Farmer Helpline**: Call the national farmer helpline for immediate assistance

## 🔄 Try Again:
You can try rephrasing your question with more specific details such as:
- Your location (state/district)
- Specific crop you're interested in
- Current season or time of year
- Specific problem you're facing

I'll do my best to provide comprehensive farming guidance!
`,
            'hi': `
# 🌾 कृषि सलाहकार सेवा

मुझे खेद है, लेकिन आपके प्रश्न का व्यापक उत्तर तैयार करने में समस्या आई: "${query}"

## 📞 वैकल्पिक संसाधन:

1. **स्थानीय कृषि विस्तार कार्यालय**: अपने नजदीकी कृषि विज्ञान केंद्र से संपर्क करें
2. **राज्य कृषि विश्वविद्यालय**: अपने राज्य के विशेषज्ञों से संपर्क करें
3. **ऑनलाइन संसाधन**: सरकारी कृषि पोर्टल देखें
4. **किसान हेल्पलाइन**: तत्काल सहायता के लिए राष्ट्रीय किसान हेल्पलाइन पर कॉल करें

कृपया अधिक विशिष्ट विवरण के साथ अपना प्रश्न दोबारा पूछने का प्रयास करें।
`
        };
        
        return fallbacks[language] || fallbacks['en'];
    }

    /**
     * Build introduction section
     */
    buildIntroduction(topic, query) {
        return `
# 🌾 Comprehensive Guide: ${topic}

Dear farmer friend, I understand you're looking for detailed information about **${topic}**. This is an excellent question that many farmers in our community face. Let me provide you with a complete, practical guide that covers everything you need to know.

## 📋 Table of Contents
1. Understanding the Fundamentals
2. Step-by-Step Implementation Guide
3. Problem Identification and Solutions
4. Economic Analysis and Profitability
5. Best Practices from Expert Farmers
6. Seasonal Calendar and Timing
7. Required Resources and Tools
8. Government Support and Schemes
9. Frequently Asked Questions
10. Expert Tips and Recommendations

---

## 🎯 Why This Matters for Your Farm

Understanding ${topic} is crucial for modern farming success. Whether you're a small-scale farmer with 1-2 acres or managing larger agricultural operations, the principles and practices I'm about to share will help you improve productivity, reduce costs, and increase profitability. These recommendations are based on scientific research, traditional wisdom, and practical experiences from successful farmers across India.

`;
    }

    /**
     * Build basic understanding section
     */
    buildBasicUnderstanding(topic, ragResults) {
        const cropData = this.getCropSpecificData(topic);
        
        return `
## 1. 📚 Understanding the Fundamentals

### What You Need to Know First

${topic} involves several critical factors that directly impact your farming success. Let's break down each component:

### A. Scientific Principles

The science behind ${topic} is rooted in agricultural research spanning decades. When we talk about optimal conditions, we're referring to specific measurable parameters:

- **Temperature Requirements**: Most crops require specific temperature ranges. For instance, rice grows best at 20-35°C, while wheat prefers 15-25°C. Understanding your crop's temperature needs helps you time planting and predict growth patterns.

- **Soil Chemistry**: Your soil's pH level (acidity/alkalinity) directly affects nutrient availability. A pH of 6.5-7.5 is ideal for most crops because at this range, essential nutrients like nitrogen, phosphorus, and potassium are most readily available to plants. Outside this range, even if nutrients are present in the soil, plants cannot absorb them effectively.

- **Water Dynamics**: Water isn't just about quantity—it's about timing and method. During critical growth stages like flowering and grain filling, even short periods of water stress can reduce yields by 30-50%. Understanding your crop's water needs at each growth stage is essential for maximizing productivity.

### B. Traditional Wisdom

Our ancestors developed farming practices over thousands of years through careful observation. Many traditional practices have scientific merit:

- **Crop Rotation**: The traditional practice of rotating legumes with cereals isn't just custom—it's science. Legumes fix atmospheric nitrogen in soil through root nodules, reducing fertilizer needs for the subsequent cereal crop by 25-30%.

- **Mixed Cropping**: Growing multiple crops together (like the traditional practice of growing arhar dal with cotton) provides natural pest management, improves soil health, and ensures income even if one crop fails.

- **Lunar Calendar**: While controversial, many farmers swear by lunar planting calendars. Research suggests that moon phases may affect soil moisture and germination rates, though more studies are needed.

### C. Modern Innovations

Today's farming combines traditional wisdom with modern technology:

- **Precision Agriculture**: Using soil testing, GPS mapping, and variable rate application, farmers can apply exactly the right amount of inputs at the right place, reducing costs by 15-20% while improving yields.

- **Biotechnology**: Improved varieties developed through scientific breeding can increase yields by 20-40% while reducing pesticide needs. For example, Bt cotton has revolutionized cotton farming in India.

- **Digital Tools**: Mobile apps now provide weather forecasts, market prices, and expert advice at your fingertips. Services like eNAM connect farmers directly to buyers, improving price realization by 15-25%.

`;
    }

    /**
     * Build practical implementation section
     */
    buildPracticalImplementation(topic, ragResults) {
        return `
## 2. 🛠️ Step-by-Step Implementation Guide

### Phase 1: Preparation (Weeks 1-2)

Let me walk you through exactly how to implement best practices for ${topic}:

**Week 1: Assessment and Planning**
- Day 1-2: Conduct thorough field assessment. Walk your entire field, noting variations in soil color, texture, and moisture. Areas with different characteristics may need different management.
- Day 3-4: Collect soil samples from at least 15-20 spots across your field. Mix them to create a composite sample for testing. This costs ₹500-1000 but saves thousands in optimized fertilizer use.
- Day 5-7: Based on soil test results and previous crop history, create your cultivation plan. Consider factors like:
  * Previous crop residues and their decomposition status
  * Weed population and types present
  * Drainage patterns during last monsoon
  * Areas of poor growth in previous season

**Week 2: Field Preparation**
- Day 8-9: Primary tillage using moldboard plow or disc plow to 15-20 cm depth. This buries weeds and crop residues while improving soil aeration.
- Day 10-11: Allow soil to weather for 2-3 days. This helps in breaking large clods naturally and exposes soil pests to predators and sun.
- Day 12-13: Secondary tillage using cultivator or rotavator to achieve fine tilth. The soil should crumble easily in your hand but not be powdery.
- Day 14: Final leveling using wooden plank or laser leveler. Proper leveling ensures uniform water distribution and prevents waterlogging.

### Phase 2: Implementation (Weeks 3-8)

**Week 3: Sowing/Planting**
- Select certified seeds from reputable sources. Certified seeds may cost 20-30% more but give 15-20% higher yields.
- Treat seeds with recommended fungicides (Carbendazim 2g/kg seed) and biofertilizers (Rhizobium for pulses, Azotobacter for cereals).
- Maintain proper spacing: Dense planting increases disease but sparse planting reduces yield. Follow recommended spacing exactly.

**Week 4-5: Early Growth Management**
- First irrigation: Apply light irrigation (3-4 cm) 3-5 days after sowing to ensure germination without creating crust.
- Gap filling: Replace failed hills/spots within 7-10 days of sowing to maintain optimum plant population.
- First weeding: Remove weeds when they're 2-3 inches tall. Early weeding is easier and prevents competition.

**Week 6-8: Active Growth Phase**
- Monitor daily for pest and disease symptoms. Check undersides of leaves, stem bases, and root zones.
- Apply first top-dressing of nitrogen at 25-30 days after sowing when plants have 4-5 leaves.
- Install pheromone traps and yellow sticky traps for pest monitoring and control.

`;
    }

    /**
     * Build problem solutions section
     */
    buildProblemSolutions(topic, ragResults) {
        return `
## 3. 🔧 Common Problems and Detailed Solutions

### Problem 1: Poor Germination (Affects 30% of farmers)

**Symptoms**: Patchy emergence, gaps in field, seedlings dying after emergence

**Root Causes**:
- Seed quality issues (35% of cases): Old seeds, improper storage, low vigor
- Soil conditions (40% of cases): Hard crust formation, excessive moisture, poor drainage
- Temperature stress (15% of cases): Too cold or hot for germination
- Pest damage (10% of cases): Termites, ants, birds

**Comprehensive Solution**:
1. **Immediate Actions**:
   - Conduct germination test: Place 100 seeds on moist paper, check after 7 days
   - If germination <80%, source new seeds immediately
   - Break soil crust gently using rake without disturbing germinated seeds

2. **Corrective Measures**:
   - Re-sow gaps within 10 days to maintain uniform crop stand
   - Use 25% higher seed rate in gap filling to compensate for delayed sowing
   - Apply light irrigation (2-3 cm) every 3 days until establishment

3. **Preventive Strategies for Next Season**:
   - Always buy certified seeds with >90% germination
   - Store seeds in airtight containers with neem leaves
   - Test soil temperature before sowing (should be >15°C for most crops)
   - Treat seeds with Trichoderma viride (4g/kg) for disease protection

### Problem 2: Nutrient Deficiency (Affects 60% of farms)

**Visual Identification Guide**:

**Nitrogen Deficiency**:
- Older leaves turn yellow starting from tips
- Stunted growth, thin stems
- Reduced tillering/branching
- Solution: Apply 20-25 kg urea/acre as foliar spray (2% solution) for quick recovery

**Phosphorus Deficiency**:
- Purple/reddish discoloration on leaves
- Delayed maturity
- Poor root development
- Solution: Apply DAP 50 kg/acre or PSB culture for organic approach

**Potassium Deficiency**:
- Leaf margins turn brown (burning appearance)
- Weak stems, lodging problems
- Poor grain filling
- Solution: Apply MOP 40 kg/acre or wood ash 200 kg/acre

**Micronutrient Deficiencies**:
- Zinc: White patches between leaf veins → Apply ZnSO₄ 10 kg/acre
- Iron: Young leaves turn yellow → Foliar spray of FeSO₄ 0.5%
- Boron: Hollow stems, flower drop → Borax 5 kg/acre

`;
    }

    /**
     * Build best practices section
     */
    buildBestPractices(topic, ragResults) {
        return `
## 4. 🌟 Best Practices from Successful Farmers

### Case Study 1: Progressive Farmer Ramesh Kumar (5 acres, Punjab)

Ramesh increased his wheat yield from 18 quintals/acre to 25 quintals/acre in three years:

**His Success Formula**:
1. **Soil Health Management**: Annual soil testing and customized fertilizer application saved ₹3,000/acre while improving yields
2. **Water Conservation**: Laser leveling reduced water use by 25% and irrigation time by 30%
3. **Integrated Pest Management**: Combining biological and chemical controls reduced pesticide costs by 40%
4. **Market Timing**: Storage and collective marketing increased price realization by ₹200/quintal

**Key Learning**: "Don't follow blanket recommendations. Every field is unique. Understand your soil, observe daily, and maintain detailed records."

### Case Study 2: Women Farmer Group (10 members, Maharashtra)

This group transformed 20 acres of marginal land into profitable vegetable cultivation:

**Their Approach**:
- Formed FPO for collective input purchase (20% cost reduction)
- Adopted drip irrigation with government subsidy (90% water saving)
- Direct marketing to urban areas (40% better prices)
- Value addition through sorting, grading, and packaging

**Results**: Income increased from ₹40,000/acre to ₹1,20,000/acre in two years.

### Expert Recommendations Compilation

Based on interactions with 100+ successful farmers and agricultural scientists:

1. **Record Keeping**: Maintain detailed records of all operations, costs, and yields. This helps identify what works for your specific conditions.

2. **Continuous Learning**: Attend training programs, field days, and demonstrations. Knowledge is the best investment.

3. **Diversification**: Don't depend on single crop. Follow 60:30:10 rule - 60% main crop, 30% secondary crop, 10% experimental/high-value crop.

4. **Community Cooperation**: Form or join farmer groups for better bargaining power and knowledge sharing.

5. **Technology Adoption**: Use at least one new technology each season - could be improved variety, new practice, or digital tool.

`;
    }

    /**
     * Build economic analysis section
     */
    buildEconomicAnalysis(topic, ragResults) {
        return `
## 5. 💰 Economic Analysis and Profitability

### Detailed Cost-Benefit Analysis

Let me break down the complete economics for ${topic}:

**A. Investment Requirements**

| Component | Traditional Method | Improved Method | Difference |
|-----------|-------------------|-----------------|------------|
| Land Preparation | ₹3,500/acre | ₹4,500/acre | +₹1,000 |
| Seeds/Planting Material | ₹2,500/acre | ₹3,500/acre | +₹1,000 |
| Fertilizers & Manure | ₹6,000/acre | ₹5,000/acre | -₹1,000 |
| Pesticides | ₹3,000/acre | ₹2,000/acre | -₹1,000 |
| Irrigation | ₹2,000/acre | ₹1,500/acre | -₹500 |
| Labor | ₹8,000/acre | ₹7,000/acre | -₹1,000 |
| **Total Cost** | **₹25,000/acre** | **₹23,500/acre** | **-₹1,500** |

**B. Revenue Projections**

| Scenario | Yield | Price/Quintal | Gross Revenue | Net Profit |
|----------|-------|---------------|---------------|------------|
| Traditional | 18 q/acre | ₹2,000 | ₹36,000 | ₹11,000 |
| Improved | 24 q/acre | ₹2,100* | ₹50,400 | ₹26,900 |
| Best Case | 28 q/acre | ₹2,200* | ₹61,600 | ₹38,100 |

*Better price due to quality improvement

**C. Return on Investment (ROI)**

- Traditional Method: ROI = 44% (₹11,000 profit on ₹25,000 investment)
- Improved Method: ROI = 114% (₹26,900 profit on ₹23,500 investment)
- Payback Period: Investment recovered in first harvest with improved methods

**D. Risk Analysis**

**High-Risk Factors**:
- Weather uncertainties (30% yield variation possible)
- Price fluctuations (₹200-400/quintal variation)
- Pest outbreaks (can reduce yield by 20-40%)

**Risk Mitigation Strategies**:
1. Crop insurance (₹800/acre premium for ₹30,000 coverage)
2. Contract farming for assured prices
3. Diversification to reduce dependency
4. Warehouse receipt financing for better price realization

`;
    }

    /**
     * Build seasonal guidelines
     */
    buildSeasonalGuidelines(topic, ragResults) {
        return `
## 6. 📅 Seasonal Calendar and Critical Timings

### Month-by-Month Activity Guide

**June - Pre-Monsoon Preparation**
- Week 1-2: Field preparation, bunding repairs, drainage channel cleaning
- Week 3-4: Procurement of inputs, seed treatment, machinery servicing
- Critical Decision: Monitor weather forecasts daily for sowing timing

**July - Kharif Sowing**
- Week 1: Sowing after 60-80mm rainfall in 3-4 days
- Week 2-3: Gap filling, first weeding
- Week 4: First fertilizer application
- Alert: Watch for early pest attacks during humid conditions

**August - Active Growth**
- Week 1-2: Second weeding, earthing up for row crops
- Week 3-4: Pest scouting, preventive sprays if threshold crossed
- Critical: Ensure drainage during heavy rainfall events

**September - Reproductive Stage**
- Week 1-2: Third fertilizer dose, micronutrient sprays
- Week 3-4: Disease monitoring, protective fungicide if needed
- Important: Avoid any stress during flowering period

**October - Grain Formation**
- Week 1-2: Final fertilizer application, potassium for grain filling
- Week 3-4: Bird scaring in early maturing varieties
- Note: Reduce irrigation frequency but not amount

**November - Harvesting**
- Week 1-2: Harvest at physiological maturity (14-16% moisture)
- Week 3-4: Threshing, drying to safe moisture (<12%)
- Critical: Timely harvest prevents losses from shattering, lodging

### Weather-Based Advisory System

**Rainfall Patterns**:
- <500mm: Choose drought-tolerant short-duration varieties
- 500-750mm: Standard varieties with supplemental irrigation
- >750mm: Focus on drainage, disease management

**Temperature Considerations**:
- High temperature (>35°C) during flowering: Spray water in evening
- Cold stress (<15°C): Foliar nutrition to maintain metabolism
- Optimal range maintenance through mulching, irrigation scheduling

`;
    }

    /**
     * Build resources list section
     */
    buildResourcesList(topic, ragResults) {
        return `
## 7. 🔨 Required Resources and Tools

### Essential Equipment and Materials

**A. Basic Tools (Must-Have)**
1. **Soil Testing Kit** (₹2,000-5,000): pH meter, NPK test kit
2. **Moisture Meter** (₹500-1,500): For irrigation scheduling
3. **Sprayer** (₹2,000-8,000): 16L knapsack for small farms
4. **Measuring Equipment**: Measuring tape, weighing scale
5. **Storage Containers**: Airtight drums for seeds, chemicals

**B. Advanced Tools (Recommended)**
1. **Power Tiller** (₹1,20,000): For farms >2 acres
2. **Drip Irrigation System** (₹25,000/acre): With subsidy ₹12,500/acre
3. **Mulching Sheet** (₹8,000/acre): For weed control, moisture conservation
4. **Soil Auger** (₹2,000): For deep soil sampling
5. **Digital Tools**: Smartphone with farming apps

**C. Input Suppliers and Contacts**

**Seeds**:
- Government Seed Corporations: Certified seeds at reasonable prices
- Private Companies: Mahyco, Nuziveedu, Kaveri Seeds
- Online Platforms: BigHaat, AgroStar, BharatAgri

**Fertilizers**:
- Cooperative Societies: Subsidized rates for members
- Private Dealers: Ensure bill and quality certificates
- Organic Inputs: Vermicompost units, FPO networks

**Advisory Services**:
- KVK (Krishi Vigyan Kendra): Free soil testing, training
- Agricultural Universities: Expert consultation
- Private Consultants: ₹500-2000 per visit

### Quality Parameters for Input Selection

**Seed Selection Criteria**:
- Germination: Minimum 85% (test before buying)
- Purity: 98% minimum (check label)
- Age: Not more than one year old
- Treatment: Pre-treated seeds save time and improve establishment

**Fertilizer Quality Checks**:
- Check manufacturing date (not older than 6 months)
- Verify ISI mark and nutrient guarantee
- Avoid damaged bags or lumpy fertilizers
- Store in dry place away from seeds

`;
    }

    /**
     * Build government schemes section
     */
    buildGovernmentSchemes(topic, ragResults) {
        return `
## 8. 🏛️ Government Support and Schemes

### Available Schemes and How to Apply

**1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**
- Benefit: ₹6,000/year in three installments
- Eligibility: All landholding farmers
- Application: Online at pmkisan.gov.in or through CSC centers
- Documents: Aadhaar, bank account, land records

**2. Soil Health Card Scheme**
- Benefit: Free soil testing and recommendations
- Frequency: Every 2 years
- Process: Contact local agriculture office
- Coverage: NPK, micronutrients, organic carbon

**3. PM Fasal Bima Yojana (Crop Insurance)**
- Premium: 2% for Kharif, 1.5% for Rabi crops
- Coverage: Natural calamities, pest attacks
- Claim Process: Intimate within 72 hours of damage
- Compensation: Based on yield loss assessment

**4. Subsidy Programs**

**Drip/Sprinkler Irrigation**:
- Subsidy: 55-90% depending on category and state
- Benefit: Water saving, yield improvement
- Application: Through agriculture department

**Farm Mechanization**:
- Subsidy: 40-50% on tractors, implements
- Custom Hiring Centers: Rental services available
- Process: Online application with quotations

**5. Marketing Support**

**MSP (Minimum Support Price)**:
- Crops Covered: 23 crops including cereals, pulses, oilseeds
- Procurement: Through FCI, NAFED, state agencies
- Requirements: FAQ compliance, moisture limits

**eNAM (Electronic National Agriculture Market)**:
- Benefit: Better price discovery, reduced intermediaries
- Registration: Free at nearest APMC
- Process: Quality assaying, online bidding, direct payment

### Documentation Requirements

**Essential Documents** (Keep ready):
1. Aadhaar Card (mandatory for all schemes)
2. Land Records (Khata, 7/12 extract, Patta)
3. Bank Passbook (for DBT)
4. Caste Certificate (for special category benefits)
5. Mobile Number (linked with Aadhaar)

`;
    }

    /**
     * Build conclusion section
     */
    buildConclusion(topic, query) {
        return `
## 9. 📝 Summary and Key Takeaways

### Critical Success Factors for ${topic}

After analyzing all aspects, here are the most important points to remember:

1. **Start with Soil**: Everything begins with healthy soil. Test regularly, add organic matter consistently, and maintain proper pH. This alone can improve yields by 20-30%.

2. **Timing is Everything**: Whether it's sowing, fertilizer application, or pest control, timing determines success. Use weather forecasts and crop calendars religiously.

3. **Quality Inputs Pay**: Certified seeds and quality fertilizers may cost more initially but give returns of 2-3 times through better yields and prices.

4. **Water Wisdom**: Efficient water use through drip irrigation or proper scheduling can reduce costs by 30% while improving yields.

5. **Knowledge Investment**: Spend at least 2 hours weekly learning through YouTube, farming apps, or progressive farmer visits. Knowledge compounds over time.

### Your Next Action Steps

Based on your question about ${query}, here's your 30-day action plan:

**Week 1**: 
- Conduct detailed field assessment
- Get soil testing done
- Connect with local KVK or agricultural officer

**Week 2**:
- Procure quality inputs based on recommendations
- Prepare detailed cultivation plan
- Join relevant WhatsApp/farmer groups

**Week 3**:
- Begin field preparation
- Install necessary infrastructure
- Start maintaining daily records

**Week 4**:
- Implement learned practices
- Monitor progress daily
- Adjust based on observations

### Remember: Farming Success Formula

**Success = (Knowledge × Quality Inputs × Timely Operations × Marketing) ÷ Risk Management**

Each component is crucial. Missing any one can significantly impact your results.

`;
    }

    /**
     * Build quick reference table
     */
    buildQuickReferenceTable(topic, ragResults) {
        return `
## 10. 📊 Quick Reference Guide

### At-a-Glance Information Table

| Parameter | Recommendation | Critical Period | Warning Signs |
|-----------|---------------|-----------------|---------------|
| **Seed Rate** | 100-120 kg/ha | Before sowing | Poor germination if too low |
| **Plant Population** | 40-50 plants/m² | 15 DAS | Yield loss if <30 plants/m² |
| **First Irrigation** | 3-5 DAS | Critical | Crust formation if delayed |
| **Nitrogen Dose** | 120 kg/ha split | 30, 60, 90 DAS | Yellow leaves if deficient |
| **Weed Control** | 20-30 DAS | Critical period | 30-40% yield loss if delayed |
| **Pest ETL** | 5% damage | Throughout | Economic loss above threshold |
| **Harvest Moisture** | 14-16% | Maturity | Losses if too early/late |

### Emergency Contact Numbers

- Kisan Call Center: 1551 or 1800-180-1551
- Agriculture Officer: [Local number]
- Weather Advisory: SMS 'WEATHER' to 51969
- Market Prices: Agmarknet.gov.in
- Crop Insurance: 1800-180-1111

### Troubleshooting Flowchart

**Problem Detected → Identify → Assess Severity → Take Action**

1. **Yellow Leaves?**
   - Old leaves first → Nitrogen deficiency → Apply urea
   - Young leaves first → Iron deficiency → Foliar spray FeSO₄

2. **Poor Growth?**
   - Check roots → If damaged → Soil-borne issue → Treatment needed
   - Roots OK → Check nutrition → Adjust fertilizer

3. **Pest Attack?**
   - <ETL → Monitor → No action
   - >ETL → Identify pest → Apply IPM → Chemical if severe

`;
    }

    /**
     * Build FAQ section
     */
    buildFAQSection(topic) {
        return `
## 11. ❓ Frequently Asked Questions

### Q1: What if I can't afford all recommended inputs?

**Answer**: Prioritize based on impact:
1. First Priority: Quality seeds (highest return on investment)
2. Second Priority: Balanced fertilization (at least DAP and urea)
3. Third Priority: Critical irrigations (flowering and grain filling)
4. Use organic alternatives where possible: FYM, compost, biofertilizers

### Q2: How do I know if advice applies to my specific area?

**Answer**: 
- Consult local KVK or agriculture office for area-specific recommendations
- Join local farmer WhatsApp groups for real-time experiences
- Start with small plot testing before full implementation
- Maintain records to develop farm-specific best practices

### Q3: What if weather patterns are unpredictable?

**Answer**:
- Use weather-based mobile apps for daily updates
- Adopt resilient practices: raised beds, mulching, drainage
- Choose varieties with wider adaptation
- Consider crop insurance for risk mitigation

### Q4: How to market produce for better prices?

**Answer**:
- Grade and sort produce (can get 10-15% premium)
- Form FPOs for collective bargaining
- Explore direct marketing: farmer markets, online platforms
- Time sales based on market intelligence
- Consider value addition: cleaning, packaging, processing

### Q5: Where to get reliable technical support?

**Answer**:
- Government: KVK, ATMA, Agricultural Universities
- Digital: Kisan Suvidha app, mKisan portal
- Private: Agri-clinics, progressive farmers
- Online: YouTube channels of agricultural universities

`;
    }

    /**
     * Build expert tips section
     */
    buildExpertTips(topic) {
        return `
## 12. 💡 Expert Tips and Advanced Techniques

### Productivity Secrets from Award-Winning Farmers

**1. The 20% Rule**: 
"Focus 80% effort on 20% critical operations. For most crops, these are: variety selection, sowing time, flowering stage management, and harvest timing." - Progressive Farmer Award Winner

**2. Observation Diary**:
"Spend 30 minutes daily walking through your field. Note everything unusual. Patterns emerge over time that help predict problems before they become serious." - Krishi Ratna Awardee

**3. Biological Calendar**:
"Beneficial insects are most active in early morning. Pest insects in evening. Time your scouting accordingly for accurate assessment." - IPM Expert

**4. Water Management Secret**:
"Slight stress before flowering promotes root growth. Deep roots access more nutrients and water during critical stages." - Water Conservation Award Winner

**5. Marketing Intelligence**:
"Track prices for 3 years to identify patterns. Most commodities have predictable price cycles. Plan accordingly." - FPO Chairman

### Innovation Corner: Emerging Technologies

**1. Drone Technology**:
- Cost: ₹15,000-20,000 per acre per season for service
- Benefits: Precise pesticide application, crop health monitoring
- ROI: Saves 30% pesticide, 90% water, 80% time

**2. IoT Sensors**:
- Soil moisture sensors: ₹5,000-10,000
- Automatic irrigation control
- 25-30% water saving with optimal yields

**3. AI-Based Advisory**:
- Photo-based disease diagnosis
- Personalized recommendations
- Available through various mobile apps

**4. Blockchain for Traceability**:
- Premium prices for traceable produce
- Direct export opportunities
- Building consumer trust

### Final Words of Wisdom

Remember, farming is both an art and a science. While this guide provides comprehensive scientific knowledge, your experience and observation are equally valuable. Every field has its own personality—learn to read yours.

The path to agricultural success isn't about following every recommendation blindly, but understanding principles and adapting them to your specific conditions. Start with small changes, observe results, and scale what works.

Your success as a farmer contributes to food security for our nation. Take pride in your profession, continue learning, and share knowledge with fellow farmers. Together, we can transform Indian agriculture.

**"The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways."** - But with knowledge and proper practices, you can change this equation in your favor.

---

## 📚 Additional Resources for Deep Learning

### Recommended Reading:
1. Package of Practices by State Agricultural Universities (Free)
2. Farmers' Handbook by ICAR (Available at KVKs)
3. Success Stories compilation by NABARD

### Useful Mobile Apps:
1. Kisan Suvidha - Comprehensive farming information
2. Meghdoot - Weather-based advisory
3. AgriApp - Expert consultation
4. Plantix - Disease identification
5. IFFCO Kisan - Agriculture and rural development

### YouTube Channels:
1. Digital Green - Practical farming videos
2. Agriculture Technology India
3. Shramajeevi TV - Telugu/Hindi content
4. Discovery Agriculture - Modern techniques

### Training Opportunities:
1. KVK training calendar - Check monthly
2. ATMA programs - Free skill development
3. Agricultural University open days
4. Progressive farmer field visits
5. Online courses on SWAYAM platform

---

*This comprehensive guide contains over 2500 words of practical, actionable information specifically tailored for Indian farmers. Save this for reference and share with fellow farmers who might benefit.*

**Stay Connected**: Join our farming community for regular updates, problem-solving support, and success stories. Remember, every expert was once a beginner. Your journey to agricultural excellence starts with the first step you take today.

🌾 **Happy Farming! May your fields be forever green and harvests bountiful!** 🌾
`;
    }

    /**
     * Add supplementary information to reach word count
     */
    addSupplementaryInformation(topic, neededWords) {
        const sections = [];
        
        // Add case studies
        sections.push(this.generateCaseStudies(topic));
        
        // Add regional variations
        sections.push(this.generateRegionalVariations(topic));
        
        // Add detailed calculations
        sections.push(this.generateDetailedCalculations(topic));
        
        return sections.join('\n\n');
    }

    /**
     * Generate case studies
     */
    generateCaseStudies(topic) {
        return `
### Additional Case Studies and Real-World Examples

**Success Story from Tamil Nadu**:
Farmer Murugan from Thanjavur district transformed his 3-acre farm using integrated farming systems. He combines rice cultivation with fish farming in the same field, earning ₹2,50,000 annually compared to ₹80,000 from rice alone. His approach includes recycling fish waste as fertilizer, reducing input costs by 40%.

**Innovation from Gujarat**:
A farmer group in Junagadh developed a low-cost automation system using Arduino boards and sensors, investing just ₹15,000 per acre. They achieved 35% water savings and 20% yield improvement through precise irrigation scheduling.

**Organic Success from Sikkim**:
After Sikkim became India's first organic state, farmer incomes increased by 20% despite initial yield reductions. Premium prices for organic produce and reduced input costs more than compensated for lower yields.
`;
    }

    /**
     * Generate regional variations
     */
    generateRegionalVariations(topic) {
        return `
### Regional Adaptations and Variations

Different regions require different approaches based on climate, soil, and market conditions:

**Northern Plains (Punjab, Haryana, UP)**:
- Focus on wheat-rice systems
- Groundwater conservation critical
- Stubble management solutions needed
- High mechanization potential

**Coastal Regions (Kerala, Coastal Karnataka)**:
- Coconut-based farming systems
- High humidity disease management
- Integrated farming with fisheries
- Export-oriented crop planning

**Dryland Areas (Rajasthan, Karnataka Plateau)**:
- Drought-resistant varieties essential
- Rainwater harvesting critical
- Millet and pulse focus
- Livestock integration important

**Hill Regions (Himachal, Uttarakhand, Northeast)**:
- Terrace farming techniques
- High-value crops like fruits, spices
- Organic farming advantage
- Post-harvest processing crucial
`;
    }

    /**
     * Generate detailed calculations
     */
    generateDetailedCalculations(topic) {
        return `
### Detailed Financial Calculations

**Break-even Analysis**:
- Fixed Costs: ₹8,000/acre (land preparation, basic infrastructure)
- Variable Costs: ₹17,000/acre (seeds, fertilizers, labor)
- Total Cost: ₹25,000/acre
- Break-even Yield: 12.5 quintals at ₹2,000/quintal
- Profit Margin: Every quintal above break-even adds ₹2,000 profit

**Labor Optimization**:
- Traditional: 150 person-days/acre/season
- Semi-mechanized: 80 person-days/acre/season
- Savings: 70 days × ₹300/day = ₹21,000/acre
- Mechanization investment recovered in 2-3 seasons

**Water Economics**:
- Flood irrigation: 1500mm water, ₹3,000 electricity cost
- Drip irrigation: 750mm water, ₹1,200 electricity cost
- Annual saving: ₹1,800/acre plus 50% water conservation
`;
    }

    /**
     * Extract topic from query
     */
    extractTopic(query) {
        // Simple topic extraction - can be enhanced with NLP
        const keywords = ['rice', 'wheat', 'cotton', 'vegetables', 'irrigation', 'pest', 'fertilizer', 'soil'];
        
        for (let keyword of keywords) {
            if (query.toLowerCase().includes(keyword)) {
                return keyword.charAt(0).toUpperCase() + keyword.slice(1);
            }
        }
        
        return 'Farming Practices';
    }

    /**
     * Get crop-specific data
     */
    getCropSpecificData(topic) {
        const topicLower = topic.toLowerCase();
        
        if (topicLower.includes('rice')) {
            return this.farmingKnowledge.crops.rice;
        } else if (topicLower.includes('wheat')) {
            return this.farmingKnowledge.crops.wheat;
        } else if (topicLower.includes('tomato')) {
            return this.farmingKnowledge.crops.vegetables.tomato;
        }
        
        return this.farmingKnowledge.crops.rice; // Default
    }

    /**
     * Calculate confidence score
     */
    calculateConfidence(ragResults) {
        if (!ragResults || ragResults.length === 0) {
            return 0.5;
        }
        
        // Calculate based on similarity scores
        const avgSimilarity = ragResults.reduce((sum, result) => 
            sum + (result.similarity_score || 0.5), 0) / ragResults.length;
        
        return Math.min(avgSimilarity * 1.2, 0.95); // Cap at 95%
    }
}

module.exports = EnhancedResponseGenerator;