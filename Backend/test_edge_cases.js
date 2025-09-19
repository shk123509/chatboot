/**
 * Comprehensive Edge Case and Unusual Scenario Testing
 * Tests the Enhanced Response Generator with challenging crop-location combinations
 * and edge cases to ensure robust error handling and intelligent responses
 */

const EnhancedResponseGenerator = require('./utils/enhancedResponseGenerator');
const ResponseFormatter = require('./utils/responseFormatter');

class EdgeCaseTestSuite {
    constructor() {
        this.generator = new EnhancedResponseGenerator();
        this.formatter = new ResponseFormatter();
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Starting Comprehensive Edge Case Test Suite...\n');
        
        const testSuites = [
            { name: 'Unusual Crop-Location Combinations', tests: this.getUnusualCombinationTests() },
            { name: 'Extreme Climate Scenarios', tests: this.getExtremeClimateTests() },
            { name: 'Invalid Input Handling', tests: this.getInvalidInputTests() },
            { name: 'Response Length and Performance', tests: this.getPerformanceTests() },
            { name: 'Multi-language Edge Cases', tests: this.getLanguageTests() },
            { name: 'Formatting and Chunking', tests: this.getFormattingTests() }
        ];

        for (const suite of testSuites) {
            console.log(`\n📋 Test Suite: ${suite.name}`);
            console.log('='.repeat(60));
            
            for (let i = 0; i < suite.tests.length; i++) {
                const test = suite.tests[i];
                console.log(`\n${i + 1}. ${test.description}`);
                console.log(`Query: "${test.query}"`);
                
                try {
                    const startTime = Date.now();
                    const response = this.generator.generateDetailedResponse(
                        test.query, 
                        [], 
                        test.language || 'en',
                        test.options || {}
                    );
                    const endTime = Date.now();
                    
                    const result = this.validateTestResult(test, response, endTime - startTime);
                    this.testResults.push(result);
                    
                    this.displayTestResult(result);
                    
                } catch (error) {
                    const result = {
                        testName: test.description,
                        query: test.query,
                        success: false,
                        error: error.message,
                        expectedBehavior: test.expected
                    };
                    this.testResults.push(result);
                    console.log('❌ Test Failed with Error:', error.message);
                }
                
                console.log('─'.repeat(40));
            }
        }
        
        this.generateTestSummary();
    }

    getUnusualCombinationTests() {
        return [
            {
                description: 'Rice cultivation in Rajasthan desert',
                query: 'How can I grow rice in Rajasthan desert?',
                expected: {
                    shouldWarn: true,
                    shouldSuggestAlternatives: true,
                    alternativeCrops: ['bajra', 'jowar', 'guar'],
                    minWordCount: 800
                }
            },
            {
                description: 'Sugarcane in arid climate',
                query: 'I want to grow sugarcane in Rajasthan with limited water',
                expected: {
                    shouldWarn: true,
                    shouldSuggestAlternatives: true,
                    alternativeCrops: ['sweet sorghum', 'sugar beet'],
                    minWordCount: 800
                }
            },
            {
                description: 'Cotton in high altitude cold region',
                query: 'Can I cultivate cotton in Himachal Pradesh hills?',
                expected: {
                    shouldWarn: true,
                    feasibility: 'not_suitable',
                    minWordCount: 600
                }
            },
            {
                description: 'Wheat in humid tropical coastal area',
                query: 'Growing wheat in Kerala coastal region during monsoon',
                expected: {
                    shouldWarn: true,
                    challenges: ['high humidity', 'disease pressure'],
                    minWordCount: 800
                }
            },
            {
                description: 'Tropical crop in temperate region',
                query: 'How to grow banana in Punjab winter?',
                expected: {
                    shouldWarn: false, // Marginal but possible
                    challenges: ['cold stress', 'frost protection'],
                    minWordCount: 1500
                }
            }
        ];
    }

    getExtremeClimateTests() {
        return [
            {
                description: 'Farming during extreme drought',
                query: 'What crops can survive with less than 200mm rainfall per year?',
                expected: {
                    cropSuggestions: ['bajra', 'jowar', 'cactus pear'],
                    techniques: ['drought management', 'water harvesting'],
                    minWordCount: 2000
                }
            },
            {
                description: 'Farming in flood-prone areas',
                query: 'Best crops for areas that flood every year in Bihar',
                expected: {
                    cropSuggestions: ['flood-tolerant rice', 'jute'],
                    techniques: ['raised bed', 'flood management'],
                    minWordCount: 2000
                }
            },
            {
                description: 'High salinity soil farming',
                query: 'Crops for highly saline soil with EC > 8 dS/m',
                expected: {
                    cropSuggestions: ['salicornia', 'quinoa', 'barley'],
                    techniques: ['soil reclamation', 'salt management'],
                    minWordCount: 1500
                }
            },
            {
                description: 'Extreme heat conditions',
                query: 'Farming when temperature regularly exceeds 48°C in summer',
                expected: {
                    techniques: ['shade farming', 'heat stress management'],
                    timing: ['early morning', 'late evening'],
                    minWordCount: 1500
                }
            }
        ];
    }

    getInvalidInputTests() {
        return [
            {
                description: 'Empty query',
                query: '',
                expected: {
                    shouldError: true,
                    errorHandling: true
                }
            },
            {
                description: 'Very short query',
                query: 'crop',
                expected: {
                    shouldProvideGeneral: true,
                    minWordCount: 1000
                }
            },
            {
                description: 'Nonsensical query',
                query: 'How to grow invisible unicorn crops on Mars?',
                expected: {
                    shouldProvideGeneral: true,
                    shouldSuggestRephrase: true,
                    minWordCount: 500
                }
            },
            {
                description: 'Query with only location',
                query: 'Punjab farming',
                expected: {
                    shouldProvideLocationInfo: true,
                    shouldSuggestCrops: true,
                    minWordCount: 1500
                }
            },
            {
                description: 'Very long query (500+ words)',
                query: 'I am a farmer from Punjab and I have been growing wheat for the last 20 years but now I am facing many problems including declining groundwater levels, increasing cost of fertilizers, labor shortage, climate change effects like unpredictable weather patterns, pest resistance issues, market price fluctuations, and soil health degradation due to continuous monoculture practices and I want to know what alternative crops I can grow that will be profitable and sustainable while also being suitable for the semi-arid climate of Punjab with limited water availability and I also want to know about government schemes and subsidies available for crop diversification and modern farming techniques like drip irrigation and organic farming methods that can help me reduce input costs and improve soil health while maintaining or increasing my income from farming activities and I also want to understand the market demand for different crops and export opportunities that might be available for small and medium farmers like me who have around 10-15 acres of land',
                expected: {
                    shouldHandleLongQuery: true,
                    shouldExtractKeyPoints: true,
                    minWordCount: 2500
                }
            }
        ];
    }

    getPerformanceTests() {
        return [
            {
                description: 'Standard query performance test',
                query: 'Best practices for organic tomato farming in Maharashtra',
                expected: {
                    maxResponseTime: 5000, // 5 seconds
                    minWordCount: 2000,
                    maxWordCount: 4000
                }
            },
            {
                description: 'Complex multi-topic query',
                query: 'Integrated farming system with rice, fish, duck, vegetables and biogas in West Bengal',
                expected: {
                    maxResponseTime: 8000,
                    minWordCount: 3000,
                    shouldCoverAllTopics: true
                }
            }
        ];
    }

    getLanguageTests() {
        return [
            {
                description: 'Hindi query with mixed script',
                query: 'मेरी wheat crop में पीले leaves हैं, क्या करूं?',
                language: 'hi',
                expected: {
                    minWordCount: 1500,
                    shouldHandleMixedScript: true
                }
            },
            {
                description: 'Punjabi farming terms in English query',
                query: 'How to grow sarson and ganna together in Punjab?',
                expected: {
                    minWordCount: 2000,
                    shouldRecognizeLocalTerms: true
                }
            }
        ];
    }

    getFormattingTests() {
        return [
            {
                description: 'HTML formatting with collapsible sections',
                query: 'Complete guide to rice cultivation',
                options: {
                    includeFormatting: true,
                    formatType: 'html',
                    enableChunking: true
                },
                expected: {
                    shouldHaveHTML: true,
                    shouldHaveCollapsible: true,
                    shouldHaveChunks: true
                }
            },
            {
                description: 'Markdown formatting only',
                query: 'Wheat disease management strategies',
                options: {
                    includeFormatting: true,
                    formatType: 'markdown',
                    enableChunking: false
                },
                expected: {
                    shouldHaveMarkdown: true,
                    shouldNotHaveHTML: true
                }
            }
        ];
    }

    validateTestResult(test, response, responseTime) {
        const result = {
            testName: test.description,
            query: test.query,
            success: true,
            issues: [],
            metrics: {
                wordCount: response.wordCount || response.content.split(' ').length,
                responseTime: responseTime,
                confidence: response.confidence,
                hasValidation: !!response.validation,
                hasFormatting: !!response.formatted,
                specialCase: response.specialCase
            }
        };

        // Validate based on expected behavior
        if (test.expected) {
            const expected = test.expected;

            // Check word count
            if (expected.minWordCount && result.metrics.wordCount < expected.minWordCount) {
                result.issues.push(`Word count ${result.metrics.wordCount} below minimum ${expected.minWordCount}`);
            }

            if (expected.maxWordCount && result.metrics.wordCount > expected.maxWordCount) {
                result.issues.push(`Word count ${result.metrics.wordCount} above maximum ${expected.maxWordCount}`);
            }

            // Check response time
            if (expected.maxResponseTime && result.metrics.responseTime > expected.maxResponseTime) {
                result.issues.push(`Response time ${result.metrics.responseTime}ms exceeds limit ${expected.maxResponseTime}ms`);
            }

            // Check for warnings in unusual combinations
            if (expected.shouldWarn && !response.specialCase) {
                result.issues.push('Expected warning for unusual combination but none found');
            }

            // Check error handling
            if (expected.shouldError && !response.error) {
                result.issues.push('Expected error but response succeeded');
            }

            // Check formatting
            if (expected.shouldHaveHTML && !response.formatted?.html) {
                result.issues.push('Expected HTML formatting but not found');
            }

            if (expected.shouldHaveChunks && !response.formatted?.chunks) {
                result.issues.push('Expected response chunking but not found');
            }
        }

        result.success = result.issues.length === 0;
        return result;
    }

    displayTestResult(result) {
        if (result.success) {
            console.log('✅ Test Passed');
        } else {
            console.log('⚠️  Test Issues Found:');
            result.issues.forEach(issue => console.log(`   - ${issue}`));
        }

        console.log(`📊 Metrics:`);
        console.log(`   - Word Count: ${result.metrics.wordCount}`);
        console.log(`   - Response Time: ${result.metrics.responseTime}ms`);
        console.log(`   - Confidence: ${result.metrics.confidence}`);
        if (result.metrics.specialCase) {
            console.log(`   - Special Case: ${result.metrics.specialCase}`);
        }
    }

    generateTestSummary() {
        console.log('\n🏆 Test Suite Summary');
        console.log('='.repeat(60));

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log(`📊 Overall Results:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
        console.log(`   Issues Found: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);

        // Performance metrics
        const responseTimes = this.testResults
            .filter(r => r.metrics.responseTime)
            .map(r => r.metrics.responseTime);
        
        if (responseTimes.length > 0) {
            console.log(`\n⏱️  Performance Metrics:`);
            console.log(`   Average Response Time: ${Math.round(responseTimes.reduce((a,b) => a+b) / responseTimes.length)}ms`);
            console.log(`   Fastest Response: ${Math.min(...responseTimes)}ms`);
            console.log(`   Slowest Response: ${Math.max(...responseTimes)}ms`);
        }

        // Word count metrics
        const wordCounts = this.testResults
            .filter(r => r.metrics.wordCount)
            .map(r => r.metrics.wordCount);
        
        if (wordCounts.length > 0) {
            console.log(`\n📝 Response Length Metrics:`);
            console.log(`   Average Word Count: ${Math.round(wordCounts.reduce((a,b) => a+b) / wordCounts.length)}`);
            console.log(`   Shortest Response: ${Math.min(...wordCounts)} words`);
            console.log(`   Longest Response: ${Math.max(...wordCounts)} words`);
        }

        // Special cases detected
        const specialCases = this.testResults.filter(r => r.metrics.specialCase);
        if (specialCases.length > 0) {
            console.log(`\n🔍 Special Cases Detected: ${specialCases.length}`);
            specialCases.forEach(r => {
                console.log(`   - ${r.testName}: ${r.metrics.specialCase}`);
            });
        }

        // Failed tests details
        if (failedTests > 0) {
            console.log(`\n❌ Tests with Issues:`);
            this.testResults.filter(r => !r.success).forEach(r => {
                console.log(`   - ${r.testName}:`);
                r.issues.forEach(issue => console.log(`     • ${issue}`));
            });
        }

        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (passedTests / totalTests >= 0.9) {
            console.log('   ✅ Excellent performance! System handles edge cases well.');
        } else if (passedTests / totalTests >= 0.7) {
            console.log('   ⚠️  Good performance with some areas for improvement.');
        } else {
            console.log('   🔧 Several issues detected. Review failed tests and improve handling.');
        }

        if (responseTimes.some(t => t > 3000)) {
            console.log('   🐌 Some responses are slow. Consider optimization for complex queries.');
        }

        if (wordCounts.some(w => w < 1000)) {
            console.log('   📝 Some responses are too short. Improve content generation for edge cases.');
        }

        console.log(`\n🎯 Edge Case Testing Complete!`);
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate: passedTests / totalTests
        };
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new EdgeCaseTestSuite();
    testSuite.runAllTests()
        .then(summary => {
            process.exit(summary.successRate >= 0.8 ? 0 : 1);
        })
        .catch(error => {
            console.error('Test suite execution failed:', error);
            process.exit(1);
        });
}

module.exports = EdgeCaseTestSuite;