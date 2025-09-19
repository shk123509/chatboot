const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const EnhancedResponseGenerator = require('../utils/enhancedResponseGenerator');

/**
 * Farmer RAG API Routes
 * Integrates Python RAG system with Express backend
 */

// Initialize Enhanced Response Generator
const enhancedGenerator = new EnhancedResponseGenerator();

// Path to Python scripts
const DATA_DIR = path.join(__dirname, '..', 'data');
const PYTHON_SCRIPTS = {
    generator: path.join(DATA_DIR, 'farmer_problems_generator.py'),
    rag_system: path.join(DATA_DIR, 'farmer_rag_system.py')
};

// Utility function to run Python scripts
const runPythonScript = (scriptPath, args = []) => {
    return new Promise((resolve, reject) => {
        const python = spawn('python', [scriptPath, ...args]);
        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(`Python script failed with code ${code}: ${stderr}`));
            }
        });
    });
};

/**
 * @route   POST /api/rag/generate-dataset
 * @desc    Generate comprehensive farmer problems dataset
 * @access  Public
 */
router.post('/generate-dataset', async (req, res) => {
    try {
        console.log('🌾 Starting farmer problems dataset generation...');
        
        const output = await runPythonScript(PYTHON_SCRIPTS.generator);
        
        // Parse the output to extract statistics
        const lines = output.split('\n');
        const statsLine = lines.find(line => line.includes('Generated'));
        const totalProblems = statsLine ? parseInt(statsLine.match(/\d+/)[0]) : 0;

        res.json({
            success: true,
            message: 'Farmer problems dataset generated successfully',
            totalProblems,
            output: output.trim(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error generating dataset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate dataset',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/rag/setup-system
 * @desc    Setup and initialize RAG system
 * @access  Public
 */
router.post('/setup-system', async (req, res) => {
    try {
        console.log('🔧 Setting up RAG system...');
        
        const output = await runPythonScript(PYTHON_SCRIPTS.rag_system);
        
        res.json({
            success: true,
            message: 'RAG system setup completed successfully',
            output: output.trim(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error setting up RAG system:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to setup RAG system',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/rag/query-enhanced
 * @desc    Query with enhanced comprehensive response generator (2000+ words)
 * @access  Public
 */
router.post('/query-enhanced', async (req, res) => {
    try {
        const { query, language = 'en' } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query is required'
            });
        }

        console.log(`🌾 Processing enhanced query: ${query}`);

        // Extract additional options from request
        const { 
            includeFormatting = false, 
            formatType = 'markdown',
            enableValidation = true,
            enableChunking = false 
        } = req.body;

        // Generate comprehensive detailed response using Enhanced Response Generator
        const enhancedResponse = enhancedGenerator.generateDetailedResponse(query, [], language, {
            includeFormatting: includeFormatting,
            formatType: formatType,
            validateResponse: enableValidation,
            enableChunking: enableChunking
        });

        console.log(`✅ Generated comprehensive response: ${enhancedResponse.wordCount} words, confidence: ${enhancedResponse.confidence}`);
        
        // Validate response length to ensure no truncation
        if (enhancedResponse.content.length > 50000) {
            console.warn('⚠️  Warning: Response exceeds 50k characters, may be truncated in some contexts');
        }

        res.json({
            success: true,
            data: {
                query: query,
                response: enhancedResponse.content,
                metadata: {
                    wordCount: enhancedResponse.wordCount,
                    confidence: enhancedResponse.confidence,
                    enhanced: true,
                    generatedAt: new Date().toISOString(),
                    language: language,
                    queryAnalysis: enhancedResponse.queryAnalysis,
                    validation: enhancedResponse.validation,
                    specialCase: enhancedResponse.specialCase,
                    responseLength: enhancedResponse.content.length,
                    truncated: enhancedResponse.content.length > 50000
                },
                formatted: enhancedResponse.formatted // Will be null if formatting not requested
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error in enhanced query:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process enhanced query',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/rag/query
 * @desc    Query the RAG system for farmer solutions
 * @access  Public
 */
router.post('/query', async (req, res) => {
    try {
        const { query, topK = 3 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query is required'
            });
        }

        console.log(`🔍 Processing query: ${query}`);

        // Create temporary Python script to query RAG system
        const queryScript = `
import sys
import os
sys.path.append('${DATA_DIR.replace(/\\/g, '/')}')

from farmer_rag_system import FarmerRAGSystem
import json

try:
    # Initialize and load RAG system
    rag_system = FarmerRAGSystem()
    rag_system.load_system('${path.join(DATA_DIR, 'rag_system').replace(/\\/g, '/')}')
    
    # Generate response
    result = rag_system.generate_response('${query}', top_k=${topK})
    
    # Output as JSON
    print(json.dumps(result, ensure_ascii=False))
    
except Exception as e:
    error_result = {
        "error": str(e),
        "query": "${query}",
        "response": "Sorry, I encountered an error processing your query. Please try again.",
        "sources": [],
        "confidence": 0.0
    }
    print(json.dumps(error_result, ensure_ascii=False))
`;

        // Write temporary script
        const tempScriptPath = path.join(DATA_DIR, 'temp_query.py');
        fs.writeFileSync(tempScriptPath, queryScript);

        try {
            const output = await runPythonScript(tempScriptPath);
            
            // Clean up temporary file
            fs.unlinkSync(tempScriptPath);
            
            // Parse JSON response
            const result = JSON.parse(output.trim());
            
            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (scriptError) {
            // Clean up temporary file even if error occurs
            if (fs.existsSync(tempScriptPath)) {
                fs.unlinkSync(tempScriptPath);
            }
            throw scriptError;
        }

    } catch (error) {
        console.error('❌ Error querying RAG system:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process query',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/rag/status
 * @desc    Check RAG system status
 * @access  Public
 */
router.get('/status', (req, res) => {
    try {
        const datasetPath = path.join(DATA_DIR, 'farmer_problems_dataset.json');
        const ragSystemPath = path.join(DATA_DIR, 'rag_system');
        
        const status = {
            dataset_exists: fs.existsSync(datasetPath),
            rag_system_exists: fs.existsSync(ragSystemPath),
            data_directory: DATA_DIR
        };

        // Get dataset size if it exists
        if (status.dataset_exists) {
            try {
                const datasetData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
                status.dataset_size = datasetData.length;
            } catch (e) {
                status.dataset_size = 'Error reading dataset';
            }
        }

        // Check RAG system files
        if (status.rag_system_exists) {
            const ragFiles = fs.readdirSync(ragSystemPath);
            status.rag_files = ragFiles;
            status.vector_index_exists = ragFiles.includes('vector_index.faiss');
            status.chunks_data_exists = ragFiles.includes('chunks_data.json');
        }

        res.json({
            success: true,
            status,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error checking status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check status',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/rag/categories
 * @desc    Get available problem categories
 * @access  Public
 */
router.get('/categories', (req, res) => {
    try {
        const categories = [
            { id: 'crop_diseases', name: 'Crop Diseases', description: 'Fungal, bacterial, and viral diseases affecting crops' },
            { id: 'pest_control', name: 'Pest Control', description: 'Insect pests and pest management strategies' },
            { id: 'soil_issues', name: 'Soil Issues', description: 'Soil health, fertility, and management problems' },
            { id: 'weather_problems', name: 'Weather Problems', description: 'Weather-related challenges and solutions' },
            { id: 'irrigation_problems', name: 'Irrigation Problems', description: 'Water management and irrigation issues' },
            { id: 'livestock_issues', name: 'Livestock Issues', description: 'Animal health and livestock management' },
            { id: 'market_economic', name: 'Market & Economic', description: 'Marketing, pricing, and economic challenges' },
            { id: 'seed_planting', name: 'Seed & Planting', description: 'Seed quality, germination, and planting issues' },
            { id: 'general', name: 'General', description: 'General farming questions and solutions' }
        ];

        res.json({
            success: true,
            categories,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error getting categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get categories',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/rag/search-by-category
 * @desc    Search problems by specific category
 * @access  Public
 */
router.post('/search-by-category', async (req, res) => {
    try {
        const { category, query = '', limit = 10 } = req.body;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const datasetPath = path.join(DATA_DIR, 'farmer_problems_dataset.json');
        
        if (!fs.existsSync(datasetPath)) {
            return res.status(404).json({
                success: false,
                message: 'Dataset not found. Please generate dataset first.'
            });
        }

        const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        
        // Filter by category
        let filteredProblems = dataset.filter(problem => 
            problem.category === category || (category === 'general' && problem.category === 'general')
        );

        // If query provided, filter by query text
        if (query.trim()) {
            const queryLower = query.toLowerCase();
            filteredProblems = filteredProblems.filter(problem =>
                problem.problem.toLowerCase().includes(queryLower) ||
                problem.solution.toLowerCase().includes(queryLower) ||
                problem.crop.toLowerCase().includes(queryLower)
            );
        }

        // Limit results
        const results = filteredProblems.slice(0, parseInt(limit));

        res.json({
            success: true,
            data: {
                category,
                query,
                total_found: filteredProblems.length,
                returned: results.length,
                problems: results
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error searching by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search by category',
            error: error.message
        });
    }
});

module.exports = router;