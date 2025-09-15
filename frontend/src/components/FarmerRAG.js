import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FarmerRAG.css';

const FarmerRAG = ({ user }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        checkSystemStatus();
        fetchCategories();
    }, []);

    const checkSystemStatus = async () => {
        try {
            const response = await axios.get('/api/rag/status');
            setSystemStatus(response.data.status);
        } catch (error) {
            console.error('Error checking RAG system status:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/rag/categories');
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const setupRagSystem = async () => {
        setLoading(true);
        try {
            // First generate dataset
            await axios.post('/api/rag/generate-dataset');
            // Then setup RAG system
            await axios.post('/api/rag/setup-system');
            // Check status again
            await checkSystemStatus();
            setLoading(false);
        } catch (error) {
            console.error('Error setting up RAG system:', error);
            setLoading(false);
        }
    };

    const queryRAG = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);

        try {
            const response = await axios.post('/api/rag/query', {
                query: query,
                topK: 3
            });

            setResponse(response.data.data);
        } catch (error) {
            console.error('Error querying RAG system:', error);
            setResponse({
                error: true,
                response: 'Sorry, I encountered an error processing your query. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const searchByCategory = async (category) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/rag/search-by-category', {
                category: category,
                query: query,
                limit: 5
            });
            
            // Format the response to match RAG response format
            const problems = response.data.data.problems;
            if (problems && problems.length > 0) {
                const formattedResponse = {
                    query: `Problems in ${category}`,
                    response: problems.map((p, i) => 
                        `**Problem ${i + 1}:** ${p.problem}\n**Solution:** ${p.solution}\n**Crop:** ${p.crop}`
                    ).join('\n\n---\n\n'),
                    sources: problems,
                    confidence: 1.0
                };
                setResponse(formattedResponse);
            }
        } catch (error) {
            console.error('Error searching by category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            queryRAG();
        }
    };

    const sampleQueries = [
        "My rice crop is not growing well",
        "How to control pests in tomatoes?",
        "Soil is too dry for cultivation",
        "Yellowing leaves in my wheat field",
        "Best irrigation methods",
        "Market prices are low for my crops"
    ];

    if (!systemStatus) {
        return (
            <div className="farmer-rag loading">
                <div className="rag-spinner"></div>
                <p>Loading RAG system...</p>
            </div>
        );
    }

    return (
        <div className="farmer-rag">
            <div className="rag-header">
                <h2>🌾 Farmer AI Assistant</h2>
                <p>Get instant solutions to your farming problems using AI</p>
            </div>

            {/* System Status */}
            <div className="rag-status">
                <div className="status-item">
                    <span className={`status-indicator ${systemStatus.dataset_exists ? 'active' : 'inactive'}`}>
                        {systemStatus.dataset_exists ? '✅' : '❌'}
                    </span>
                    <span>Dataset: {systemStatus.dataset_size || 0} problems</span>
                </div>
                <div className="status-item">
                    <span className={`status-indicator ${systemStatus.rag_system_exists ? 'active' : 'inactive'}`}>
                        {systemStatus.rag_system_exists ? '✅' : '❌'}
                    </span>
                    <span>RAG System: {systemStatus.rag_system_exists ? 'Ready' : 'Not Setup'}</span>
                </div>
            </div>

            {/* Setup Button */}
            {!systemStatus.rag_system_exists && (
                <div className="setup-section">
                    <p>RAG system is not set up yet. Click below to initialize:</p>
                    <button 
                        onClick={setupRagSystem} 
                        disabled={loading}
                        className="setup-button"
                    >
                        {loading ? '🔧 Setting up...' : '🚀 Setup RAG System'}
                    </button>
                </div>
            )}

            {/* Query Interface */}
            {systemStatus.rag_system_exists && (
                <>
                    <div className="query-section">
                        <div className="query-input-container">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask any farming question... (e.g., 'My rice crop is not growing well')"
                                rows="3"
                                className="query-input"
                            />
                            <button 
                                onClick={queryRAG} 
                                disabled={loading || !query.trim()}
                                className="query-button"
                            >
                                {loading ? '🔍 Searching...' : '🔍 Ask AI'}
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="categories-section">
                        <h3>Browse by Category</h3>
                        <div className="categories-grid">
                            {categories.map((category) => (
                                <div 
                                    key={category.id}
                                    className="category-card"
                                    onClick={() => searchByCategory(category.id)}
                                >
                                    <h4>{category.name}</h4>
                                    <p>{category.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sample Queries */}
                    <div className="samples-section">
                        <h3>Try these sample questions:</h3>
                        <div className="sample-queries">
                            {sampleQueries.map((sample, index) => (
                                <button
                                    key={index}
                                    className="sample-query"
                                    onClick={() => setQuery(sample)}
                                >
                                    {sample}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Response */}
                    {response && (
                        <div className="response-section">
                            <h3>🎯 AI Response</h3>
                            {response.error ? (
                                <div className="error-response">
                                    <p>{response.response}</p>
                                </div>
                            ) : (
                                <div className="ai-response">
                                    <div className="response-metadata">
                                        <span className="confidence-score">
                                            Confidence: {(response.confidence * 100).toFixed(1)}%
                                        </span>
                                        <span className="sources-count">
                                            {response.sources?.length || 0} sources found
                                        </span>
                                    </div>
                                    <div className="response-content">
                                        {response.response.split('\n').map((line, index) => (
                                            <p key={index} className={
                                                line.startsWith('**') ? 'response-heading' : 'response-text'
                                            }>
                                                {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                                            </p>
                                        ))}
                                    </div>
                                    {response.sources && response.sources.length > 0 && (
                                        <div className="response-sources">
                                            <h4>📚 Sources</h4>
                                            {response.sources.map((source, index) => (
                                                <div key={index} className="source-item">
                                                    <div className="source-category">
                                                        {source.category.replace('_', ' ').toUpperCase()}
                                                    </div>
                                                    <div className="source-crop">
                                                        Crop: {source.crop}
                                                    </div>
                                                    <div className="source-similarity">
                                                        Relevance: {(source.similarity * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FarmerRAG;