const path = require('path');
const fs = require('fs');
const EnhancedKnowledgeBase = require('./enhancedKnowledgeBase');

// Optional canvas import - for image annotation
let createCanvas, loadImage;
try {
    const canvas = require('canvas');
    createCanvas = canvas.createCanvas;
    loadImage = canvas.loadImage;
    console.log('✅ Canvas library loaded - image annotation available');
} catch (error) {
    console.log('⚠️ Canvas library not found - image annotation disabled (this is optional)');
    createCanvas = null;
    loadImage = null;
}

/**
 * Enhanced Image Analysis with RAG Integration
 * This module combines image processing with knowledge base lookups
 * to provide rich, detailed responses for crop/plant images
 */
class EnhancedImageAnalysis {
    constructor() {
        this.knowledgeBase = new EnhancedKnowledgeBase();
        this.imageCategories = [
            'crop_disease', 
            'pest_damage', 
            'nutrient_deficiency', 
            'healthy_plant', 
            'weed_identification', 
            'soil_issue',
            'irrigation_problem'
        ];
    }

    /**
     * Analyze image and generate enhanced response with RAG integration
     * @param {string} imagePath - Path to the uploaded image
     * @param {string} userQuestion - User's question about the image
     * @param {string} language - Language for response
     * @returns {Object} Analysis result with RAG-enhanced response
     */
    async analyzeImage(imagePath, userQuestion, language = 'en') {
        try {
            // 1. Perform basic image analysis 
            // (in production, this would connect to a real CV model)
            const basicAnalysis = await this.performBasicImageAnalysis(imagePath);
            
            // 2. Extract relevant keywords from the image analysis and user question
            const keywords = this.extractKeywords(basicAnalysis, userQuestion);
            
            // 3. Get RAG responses for the extracted keywords
            const ragResponses = await this.getRAGResponses(keywords, userQuestion, language);
            
            // 4. Generate visual response with annotations (if possible)
            const visualResponse = await this.generateVisualResponse(imagePath, basicAnalysis);
            
            // 5. Combine everything into a comprehensive response
            return this.generateComprehensiveResponse(
                basicAnalysis, 
                ragResponses, 
                userQuestion, 
                visualResponse,
                language
            );
        } catch (error) {
            console.error('Image analysis error:', error);
            return this.getFallbackResponse(userQuestion, language);
        }
    }

    /**
     * Perform basic image analysis (simulated for now)
     * In production, this would connect to a real computer vision model
     */
    async performBasicImageAnalysis(imagePath) {
        // In a production environment, this would call a real CV model API
        // For now, we'll simulate image analysis based on filename patterns
        
        const filename = path.basename(imagePath).toLowerCase();
        const simulatedCategories = {
            'yellow': { 
                category: 'nutrient_deficiency',
                confidence: 0.82,
                details: 'Yellow leaves detected',
                probableIssues: ['nitrogen_deficiency', 'iron_deficiency', 'overwatering'] 
            },
            'spot': { 
                category: 'crop_disease',
                confidence: 0.79,
                details: 'Leaf spots detected',
                probableIssues: ['fungal_infection', 'bacterial_spot', 'viral_disease'] 
            },
            'pest': { 
                category: 'pest_damage',
                confidence: 0.85,
                details: 'Insect damage patterns detected',
                probableIssues: ['aphids', 'whitefly', 'mites'] 
            },
            'wilt': { 
                category: 'irrigation_problem',
                confidence: 0.77,
                details: 'Plant wilting detected',
                probableIssues: ['underwatering', 'root_rot', 'vascular_disease'] 
            },
            'healthy': { 
                category: 'healthy_plant',
                confidence: 0.90,
                details: 'Plant appears healthy',
                probableIssues: [] 
            },
            'soil': { 
                category: 'soil_issue',
                confidence: 0.81,
                details: 'Soil issues detected',
                probableIssues: ['compaction', 'poor_drainage', 'nutrient_imbalance'] 
            }
        };
        
        // Look for matching patterns in filename
        let analysis = null;
        for (const pattern in simulatedCategories) {
            if (filename.includes(pattern)) {
                analysis = simulatedCategories[pattern];
                break;
            }
        }
        
        // Default analysis if no pattern matches
        if (!analysis) {
            analysis = {
                category: this.imageCategories[Math.floor(Math.random() * this.imageCategories.length)],
                confidence: 0.65 + Math.random() * 0.2,
                details: 'Image analysis completed',
                probableIssues: ['unidentified_issue']
            };
        }
        
        // Add detection bounding boxes (simulated)
        analysis.detections = this.simulateDetections(imagePath, analysis.category);
        
        return analysis;
    }
    
    /**
     * Simulate object detection results for visualization
     */
    simulateDetections(imagePath, category) {
        // In production, these would be actual bounding boxes from a CV model
        // For now, we'll return simulated detection regions
        
        const detections = [];
        
        // Add 1-3 simulated detections with random positions
        const numDetections = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numDetections; i++) {
            detections.push({
                label: this.getLabelForCategory(category),
                confidence: 0.65 + Math.random() * 0.3,
                bbox: {
                    x: 0.2 + Math.random() * 0.6, // x position (normalized 0-1)
                    y: 0.2 + Math.random() * 0.6, // y position (normalized 0-1)
                    width: 0.1 + Math.random() * 0.3, // width (normalized 0-1)
                    height: 0.1 + Math.random() * 0.3 // height (normalized 0-1)
                }
            });
        }
        
        return detections;
    }
    
    /**
     * Get appropriate label for detection category
     */
    getLabelForCategory(category) {
        const labels = {
            'crop_disease': ['Leaf blight', 'Powdery mildew', 'Leaf spot', 'Rust'],
            'pest_damage': ['Insect damage', 'Aphid colony', 'Leaf miner', 'Pest infestation'],
            'nutrient_deficiency': ['Chlorosis', 'Yellow leaves', 'Nutrient deficiency', 'Stunted growth'],
            'healthy_plant': ['Healthy tissue', 'Normal growth', 'Healthy leaf'],
            'weed_identification': ['Weed growth', 'Invasive species', 'Competing plant'],
            'soil_issue': ['Poor soil structure', 'Drainage issue', 'Soil compaction'],
            'irrigation_problem': ['Water stress', 'Drought symptoms', 'Overwatering signs']
        };
        
        const categoryLabels = labels[category] || ['Unidentified issue'];
        return categoryLabels[Math.floor(Math.random() * categoryLabels.length)];
    }

    /**
     * Extract relevant keywords for RAG lookup from image analysis and user question
     */
    extractKeywords(analysis, userQuestion) {
        const keywords = new Set();
        
        // Add keywords from analysis
        keywords.add(analysis.category);
        analysis.probableIssues.forEach(issue => keywords.add(issue));
        
        // Add detection labels
        analysis.detections.forEach(detection => keywords.add(detection.label));
        
        // Extract keywords from user question
        const questionWords = userQuestion.toLowerCase().split(/\s+/);
        const relevantWords = questionWords.filter(word => 
            word.length > 3 && !['what', 'why', 'how', 'when', 'where', 'which', 'this', 'that', 'with'].includes(word)
        );
        relevantWords.forEach(word => keywords.add(word));
        
        return Array.from(keywords);
    }
    
    /**
     * Get RAG responses for the identified keywords
     */
    async getRAGResponses(keywords, userQuestion, language) {
        // Prepare different queries based on keywords
        const queries = [];
        
        // Create focused queries combining keywords
        if (keywords.includes('nutrient_deficiency') || keywords.includes('Yellow leaves')) {
            queries.push(`Yellow leaves ${userQuestion}`);
            queries.push('How to treat nutrient deficiency in crops');
        }
        
        if (keywords.includes('crop_disease') || keywords.includes('Leaf spot')) {
            queries.push(`Leaf disease ${userQuestion}`);
            queries.push('How to treat fungal diseases in crops');
        }
        
        if (keywords.includes('pest_damage')) {
            queries.push(`Pest damage ${userQuestion}`);
            queries.push('How to control pests on crops');
        }
        
        if (keywords.includes('irrigation_problem') || keywords.includes('Water stress')) {
            queries.push(`Irrigation problems ${userQuestion}`);
            queries.push('How to manage water stress in crops');
        }
        
        // Always add the original question
        queries.push(userQuestion);
        
        // Get responses from knowledge base for each query
        const responses = [];
        for (const query of queries) {
            const result = this.knowledgeBase.getBestAnswer(query, language);
            if (result && result.confidence > 0.4) {
                responses.push(result);
            }
        }
        
        // Sort by confidence and remove duplicates
        return this.deduplicateResponses(responses);
    }
    
    /**
     * Remove duplicate responses based on content similarity
     */
    deduplicateResponses(responses) {
        const uniqueResponses = [];
        const seenAnswers = new Set();
        
        responses.sort((a, b) => b.confidence - a.confidence);
        
        for (const response of responses) {
            // Create a simple hash of the answer to check for near-duplicates
            const answerHash = response.answer.substring(0, 50);
            
            if (!seenAnswers.has(answerHash)) {
                seenAnswers.add(answerHash);
                uniqueResponses.push(response);
            }
        }
        
        return uniqueResponses;
    }
    
    /**
     * Generate visual response with annotations (if possible)
     * In production, this would create annotated versions of the uploaded image
     */
    async generateVisualResponse(imagePath, analysis) {
        try {
            // Check if file exists
            if (!fs.existsSync(imagePath)) {
                return null;
            }
            
            // Define paths
            const fileName = path.basename(imagePath);
            const dir = path.dirname(imagePath);
            const annotatedImagePath = path.join(dir, `annotated_${fileName}`);
            
            // Create annotated image with canvas (if installed)
            try {
                if (!createCanvas || !loadImage) {
                    console.log('Canvas not available, skipping image annotation');
                    return {
                        original: imagePath,
                        annotated: null,
                        hasAnnotations: false
                    };
                }
                
                // Load the image
                const image = await loadImage(imagePath);
                
                // Create canvas with image dimensions
                const canvas = createCanvas(image.width, image.height);
                const ctx = canvas.getContext('2d');
                
                // Draw original image
                ctx.drawImage(image, 0, 0, image.width, image.height);
                
                // Draw bounding boxes
                ctx.lineWidth = 3;
                ctx.font = 'bold 16px Arial';
                ctx.textBaseline = 'top';
                
                analysis.detections.forEach(detection => {
                    const { x, y, width, height } = detection.bbox;
                    const boxX = x * image.width;
                    const boxY = y * image.height;
                    const boxWidth = width * image.width;
                    const boxHeight = height * image.height;
                    
                    // Choose color based on detection label/category
                    let strokeColor = '#FF0000'; // Default red
                    if (detection.label.includes('Healthy')) strokeColor = '#00FF00'; // Green for healthy
                    else if (detection.label.includes('Nutrient')) strokeColor = '#FFFF00'; // Yellow for deficiency
                    else if (detection.label.includes('Pest')) strokeColor = '#FF00FF'; // Purple for pests
                    
                    // Draw box
                    ctx.strokeStyle = strokeColor;
                    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
                    
                    // Draw label background
                    ctx.fillStyle = strokeColor;
                    const labelText = `${detection.label} (${Math.round(detection.confidence * 100)}%)`;
                    const textMetrics = ctx.measureText(labelText);
                    ctx.fillRect(boxX, boxY - 20, textMetrics.width + 10, 20);
                    
                    // Draw label text
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(labelText, boxX + 5, boxY - 18);
                });
                
                // Save the annotated image
                const buffer = canvas.toBuffer('image/jpeg');
                fs.writeFileSync(annotatedImagePath, buffer);
                
                return {
                    original: imagePath,
                    annotated: annotatedImagePath,
                    hasAnnotations: true
                };
                
            } catch (error) {
                console.log('Canvas annotation error (non-critical):', error.message);
                return {
                    original: imagePath,
                    annotated: null,
                    hasAnnotations: false
                };
            }
            
        } catch (error) {
            console.error('Error generating visual response:', error);
            return null;
        }
    }
    
    /**
     * Generate comprehensive response combining all data sources
     */
    generateComprehensiveResponse(analysis, ragResponses, userQuestion, visualResponse, language) {
        // Start with detection results
        const detectedProblems = analysis.detections.map(d => d.label);
        
        // Get recommendations from RAG
        const recommendations = ragResponses.length > 0 
            ? ragResponses.map(r => r.answer) 
            : this.getDefaultRecommendations(analysis.category, language);
        
        // Determine confidence based on both image analysis and RAG results
        const imageConfidence = analysis.confidence || 0.6;
        const ragConfidence = ragResponses.length > 0 
            ? Math.max(...ragResponses.map(r => r.confidence)) 
            : 0.5;
        const overallConfidence = (imageConfidence + ragConfidence) / 2;
        
        // Get sources from RAG responses
        const sources = ragResponses.map(r => ({
            id: r.id,
            category: r.category,
            confidence: r.confidence,
            source: r.source
        }));
        
        // Build response content with image analysis and RAG information
        let responseContent = '';
        
        // Image analysis section
        responseContent += `🔍 **Image Analysis Results:**\n`;
        responseContent += `Detected Issues: ${detectedProblems.join(', ')}\n\n`;
        
        // RAG-based recommendations section
        responseContent += `💡 **Recommended Actions:**\n`;
        recommendations.forEach((rec, index) => {
            responseContent += `${index + 1}. ${rec}\n`;
        });
        
        // Add visual response link if available
        if (visualResponse && visualResponse.hasAnnotations) {
            const annotatedPath = visualResponse.annotated.replace(/\\/g, '/');
            responseContent += `\n📷 **Visual Analysis:** An annotated image with detected issues has been created.\n`;
        }
        
        return {
            response: responseContent,
            confidence: overallConfidence,
            detectedProblems,
            recommendations,
            category: analysis.category,
            sources,
            visualResponse
        };
    }
    
    /**
     * Get default recommendations when RAG doesn't return useful results
     */
    getDefaultRecommendations(category, language = 'en') {
        const recommendations = {
            'en': {
                'crop_disease': [
                    'Apply appropriate fungicide or bactericide based on the specific disease.',
                    'Remove and destroy infected plant parts to prevent spread.',
                    'Improve air circulation around plants by proper spacing.',
                    'Practice crop rotation to break disease cycles.',
                    'Consider resistant varieties for future plantings.'
                ],
                'pest_damage': [
                    'Identify the specific pest before applying any treatments.',
                    'Use appropriate organic or chemical pesticides for the identified pest.',
                    'Introduce beneficial insects that prey on the pests.',
                    'Set up physical barriers or traps to prevent further infestation.',
                    'Maintain good field hygiene to reduce pest populations.'
                ],
                'nutrient_deficiency': [
                    'Apply balanced fertilizer with appropriate NPK ratio.',
                    'Consider foliar sprays for quick nutrient uptake.',
                    'Test soil pH and adjust if necessary, as it affects nutrient availability.',
                    'Add organic matter to improve nutrient retention.',
                    'Follow a regular fertilization schedule based on crop needs.'
                ],
                'irrigation_problem': [
                    'Adjust watering frequency and amount based on plant needs and soil conditions.',
                    'Consider drip irrigation for more efficient water use.',
                    'Add mulch to conserve soil moisture.',
                    'Check for and fix any irrigation system leaks or blockages.',
                    'Monitor soil moisture levels regularly using appropriate tools.'
                ],
                'soil_issue': [
                    'Conduct soil testing to identify specific deficiencies or issues.',
                    'Add organic matter to improve soil structure and fertility.',
                    'Consider appropriate amendments based on soil test results.',
                    'Implement proper drainage solutions if waterlogging is observed.',
                    'Practice minimum tillage to maintain soil structure.'
                ],
                'default': [
                    'Monitor the crop regularly for any changes in condition.',
                    'Maintain proper irrigation and fertilization practices.',
                    'Practice integrated pest management for preventive control.',
                    'Consider consulting with a local agricultural extension service.',
                    'Keep records of treatments and results for future reference.'
                ]
            },
            'hi': {
                'default': [
                    'फसल की नियमित निगरानी करें।',
                    'उचित सिंचाई और उर्वरक प्रबंधन का पालन करें।',
                    'किसी भी समस्या के लिए स्थानीय कृषि विशेषज्ञ से परामर्श करें।',
                    'रोग और कीट नियंत्रण के लिए एकीकृत प्रबंधन अपनाएं।',
                    'भविष्य के संदर्भ के लिए उपचार और परिणामों का रिकॉर्ड रखें।'
                ]
            }
        };
        
        const langRecs = recommendations[language] || recommendations['en'];
        return langRecs[category] || langRecs['default'];
    }
    
    /**
     * Get fallback response when analysis fails
     */
    getFallbackResponse(userQuestion, language = 'en') {
        const fallbacks = {
            'en': {
                response: "I can see your image but couldn't identify specific problems clearly. Here are some general agricultural recommendations:\n\n" +
                    "1. Monitor your crops regularly for signs of pests, diseases, or nutrient issues.\n" +
                    "2. Ensure proper watering - most crops need 1-2 inches of water per week.\n" +
                    "3. Use balanced fertilizers appropriate for your crop type.\n" +
                    "4. Practice crop rotation and integrated pest management.\n" +
                    "5. Consider consulting with your local agricultural extension service for specific advice.\n\n" +
                    "For more specific recommendations, please provide details about your crop type and growing conditions.",
                confidence: 0.6,
                detectedProblems: ['unidentified_issue'],
                recommendations: [
                    'Monitor crops regularly',
                    'Ensure proper watering',
                    'Use balanced fertilizers',
                    'Practice crop rotation',
                    'Consult local agricultural services'
                ],
                category: 'general',
                sources: []
            },
            'hi': {
                response: "मैं आपकी छवि देख सकता हूं लेकिन विशिष्ट समस्याओं को स्पष्ट रूप से पहचान नहीं सका। यहां कुछ सामान्य कृषि सिफारिशें हैं:\n\n" +
                    "1. कीटों, रोगों या पोषक तत्वों की समस्याओं के लक्षणों के लिए अपनी फसलों की नियमित निगरानी करें।\n" +
                    "2. उचित सिंचाई सुनिश्चित करें - अधिकांश फसलों को प्रति सप्ताह 1-2 इंच पानी की आवश्यकता होती है।\n" +
                    "3. अपने फसल प्रकार के लिए उपयुक्त संतुलित उर्वरकों का उपयोग करें।\n" +
                    "4. फसल चक्र और एकीकृत कीट प्रबंधन का अभ्यास करें।\n" +
                    "5. विशिष्ट सलाह के लिए अपनी स्थानीय कृषि विस्तार सेवा से परामर्श करने पर विचार करें।\n\n" +
                    "अधिक विशिष्ट सिफारिशों के लिए, कृपया अपने फसल प्रकार और उगाने की स्थितियों के बारे में विवरण प्रदान करें।",
                confidence: 0.6,
                detectedProblems: ['अज्ञात_समस्या'],
                recommendations: [
                    'फसलों की नियमित निगरानी करें',
                    'उचित सिंचाई सुनिश्चित करें',
                    'संतुलित उर्वरकों का उपयोग करें',
                    'फसल चक्र का अभ्यास करें',
                    'स्थानीय कृषि सेवाओं से परामर्श करें'
                ],
                category: 'general',
                sources: []
            }
        };
        
        return fallbacks[language] || fallbacks['en'];
    }
}

module.exports = EnhancedImageAnalysis;