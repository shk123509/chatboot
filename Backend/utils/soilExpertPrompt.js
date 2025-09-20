/**
 * Agricultural Soil Expert Prompt System
 * Provides quick, structured soil problem diagnosis and solutions
 */

class SoilExpertAnalyzer {
    constructor() {
        this.soilProblems = {
            // Nutrient Deficiencies
            'nitrogen_deficiency': {
                symptoms: ['yellowing', 'yellow leaves', 'pale green', 'stunted growth', 'lower leaves yellow'],
                problem: 'Nitrogen deficiency',
                cause: 'Inadequate nitrogen supply, heavy rainfall leaching, or poor organic matter',
                solutions: [
                    'Apply urea @ 100-120 kg/acre or ammonium sulfate',
                    'Use organic sources like FYM (10 tons/acre) or compost',
                    'Apply foliar spray of urea (2%) for quick response',
                    'Ensure proper irrigation to avoid nutrient leaching'
                ]
            },
            'phosphorus_deficiency': {
                symptoms: ['purple leaves', 'dark green', 'poor root development', 'delayed flowering'],
                problem: 'Phosphorus deficiency', 
                cause: 'Low soil phosphorus, high pH reducing P availability, or cold soil conditions',
                solutions: [
                    'Apply DAP @ 60-80 kg/acre or single super phosphate',
                    'Use rock phosphate (200 kg/acre) for long-term supply',
                    'Maintain soil pH between 6.0-7.0 for better P uptake',
                    'Apply organic matter to improve P availability'
                ]
            },
            'potassium_deficiency': {
                symptoms: ['brown edges', 'leaf burn', 'yellowing margins', 'weak stems'],
                problem: 'Potassium deficiency',
                cause: 'Low soil K levels, excessive irrigation, or sandy soil with poor K retention',
                solutions: [
                    'Apply muriate of potash @ 40-60 kg/acre',
                    'Use potassium sulfate for sulfur-sensitive crops',
                    'Apply wood ash (5-10 kg/acre) as organic K source',
                    'Reduce excessive irrigation to prevent K leaching'
                ]
            },
            
            // pH Issues
            'acidic_soil': {
                symptoms: ['poor growth', 'aluminum toxicity', 'nutrient lockup', 'pH below 6'],
                problem: 'Soil acidity',
                cause: 'Excessive use of acidic fertilizers, high rainfall, or natural soil formation',
                solutions: [
                    'Apply agricultural lime @ 2-4 tons/acre based on soil test',
                    'Use dolomite lime for Mg deficient soils',
                    'Apply organic matter like compost to buffer pH',
                    'Test soil pH regularly and adjust accordingly'
                ]
            },
            'alkaline_soil': {
                symptoms: ['iron chlorosis', 'yellowing', 'nutrient deficiency', 'pH above 8'],
                problem: 'Soil alkalinity',
                cause: 'High carbonate content, poor drainage, or saline irrigation water',
                solutions: [
                    'Apply sulfur @ 200-400 kg/acre to lower pH',
                    'Use acidic fertilizers like ammonium sulfate',
                    'Apply organic matter (5-10 tons/acre) regularly',
                    'Improve drainage to prevent salt accumulation'
                ]
            },
            
            // Physical Problems
            'soil_compaction': {
                symptoms: ['hard soil', 'poor drainage', 'stunted roots', 'water pooling'],
                problem: 'Soil compaction',
                cause: 'Heavy machinery, overgrazing, or working wet soil',
                solutions: [
                    'Deep ploughing once before planting season',
                    'Add organic matter (FYM 8-10 tons/acre)',
                    'Use cover crops to improve soil structure',
                    'Avoid working soil when too wet'
                ]
            },
            'waterlogging': {
                symptoms: ['yellowing', 'wilting', 'root rot', 'standing water'],
                problem: 'Waterlogging and poor drainage',
                cause: 'Poor soil drainage, heavy clay, or blocked drainage channels',
                solutions: [
                    'Create drainage channels around fields',
                    'Make raised beds for better drainage', 
                    'Apply gypsum @ 500 kg/acre to improve clay structure',
                    'Plant drainage-tolerant crops in problem areas'
                ]
            },
            'drought_stress': {
                symptoms: ['wilting', 'dry soil', 'cracked ground', 'poor growth'],
                problem: 'Water stress and poor moisture retention',
                cause: 'Sandy soil, low organic matter, or inadequate irrigation',
                solutions: [
                    'Apply mulch to conserve soil moisture',
                    'Add organic matter (compost 5 tons/acre)',
                    'Install drip irrigation system for efficient water use',
                    'Use drought-resistant crop varieties'
                ]
            },
            
            // Salinity Issues
            'salt_stress': {
                symptoms: ['white crust', 'poor germination', 'stunted growth', 'leaf burn'],
                problem: 'Soil salinity',
                cause: 'Poor quality irrigation water, over-fertilization, or poor drainage',
                solutions: [
                    'Flush soil with good quality water',
                    'Apply gypsum @ 1-2 tons/acre to displace sodium',
                    'Improve drainage to leach out salts',
                    'Use salt-tolerant crop varieties'
                ]
            },
            
            // Organic Matter Issues
            'low_organic_matter': {
                symptoms: ['poor soil structure', 'low fertility', 'hard soil', 'poor water holding'],
                problem: 'Low organic matter content',
                cause: 'Continuous cultivation without organic inputs or burning crop residues',
                solutions: [
                    'Apply FYM or compost @ 8-10 tons/acre annually',
                    'Practice green manuring with legume crops',
                    'Retain crop residues and avoid burning',
                    'Use vermicompost @ 2-3 tons/acre'
                ]
            }
        };
    }

    /**
     * Analyze soil problem based on symptoms description
     */
    analyzeSoilProblem(description) {
        const desc = description.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;

        // Score each problem based on symptom matches
        for (const [key, problem] of Object.entries(this.soilProblems)) {
            let score = 0;
            
            problem.symptoms.forEach(symptom => {
                if (desc.includes(symptom)) {
                    score += 1;
                }
            });
            
            // Check for related keywords
            if (desc.includes('yellow') && key.includes('nitrogen')) score += 2;
            if (desc.includes('hard') && key.includes('compaction')) score += 2;
            if (desc.includes('water') && key.includes('waterlog')) score += 2;
            if (desc.includes('salt') && key.includes('salt')) score += 2;
            if (desc.includes('acid') && key.includes('acidic')) score += 2;
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = problem;
            }
        }

        return bestMatch;
    }

    /**
     * Generate structured soil expert response
     */
    generateResponse(description) {
        const analysis = this.analyzeSoilProblem(description);
        
        if (!analysis) {
            return {
                problem: "Insufficient information for accurate diagnosis",
                cause: "Need more specific symptoms or soil test data",
                solutions: [
                    "Conduct soil test for pH, NPK, and organic matter",
                    "Describe specific plant symptoms (leaf color, growth pattern)",
                    "Check soil texture and drainage conditions",
                    "Consider recent weather and farming practices"
                ]
            };
        }

        return {
            problem: analysis.problem,
            cause: analysis.cause,
            solutions: analysis.solutions
        };
    }

    /**
     * Format response according to specified template
     */
    formatSoilExpertResponse(description) {
        const response = this.generateResponse(description);
        
        let formattedResponse = `**Problem Identified:** ${response.problem}\n\n`;
        formattedResponse += `**Cause:** ${response.cause}\n\n`;
        formattedResponse += `**Solution:**\n`;
        
        response.solutions.forEach((solution, index) => {
            formattedResponse += `${index + 1}. ${solution}\n`;
        });

        return formattedResponse;
    }
}

module.exports = SoilExpertAnalyzer;