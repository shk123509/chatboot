/**
 * Response Formatter Utility
 * Handles long responses with chunking, collapsible sections, and frontend-friendly formatting
 */

class ResponseFormatter {
    constructor() {
        this.maxChunkSize = 800; // Words per chunk
        this.sectionMarkers = ['##', '###', '####', '#####', '######'];
        this.collapsibleSections = [
            'Understanding the Basics',
            'Practical Implementation',
            'Economic Analysis', 
            'Seasonal Guidelines',
            'Government Schemes',
            'Tools and Resources',
            'Expert Tips'
        ];
    }

    /**
     * Format response for frontend consumption with chunking and collapsible sections
     */
    formatForFrontend(response, options = {}) {
        const {
            enableChunking = true,
            enableCollapsible = true,
            format = 'html', // 'html', 'markdown', 'json'
            maxInitialWords = 500,
            includeNavigation = true
        } = options;

        try {
            const formatted = {
                original: response,
                wordCount: response.split(' ').length,
                format: format,
                timestamp: new Date().toISOString()
            };

            if (enableChunking) {
                formatted.chunks = this.createChunks(response, maxInitialWords);
            }

            if (enableCollapsible) {
                formatted.sections = this.createCollapsibleSections(response);
            }

            if (format === 'html') {
                formatted.html = this.convertToHTML(response, enableCollapsible);
            }

            if (includeNavigation) {
                formatted.navigation = this.createNavigation(response);
            }

            // Add safe rendering metadata
            formatted.renderingInfo = {
                estimatedHeight: Math.ceil(formatted.wordCount / 10) + 'px',
                scrollable: formatted.wordCount > 1000,
                collapsedByDefault: formatted.wordCount > 2000,
                readTime: Math.ceil(formatted.wordCount / 200) + ' min read'
            };

            return formatted;

        } catch (error) {
            console.error('Error formatting response:', error);
            return {
                original: response,
                error: 'Formatting failed, displaying original response',
                wordCount: response.split(' ').length,
                format: 'plain'
            };
        }
    }

    /**
     * Create manageable chunks with "Read more" functionality
     */
    createChunks(response, initialWords = 500) {
        const words = response.split(' ');
        const chunks = [];
        
        // First chunk (always visible)
        const firstChunk = words.slice(0, initialWords).join(' ');
        chunks.push({
            id: 'chunk-0',
            content: firstChunk,
            wordCount: initialWords,
            type: 'initial',
            visible: true,
            hasMore: words.length > initialWords
        });

        // Remaining chunks
        let remaining = words.slice(initialWords);
        let chunkIndex = 1;

        while (remaining.length > 0) {
            const chunkSize = Math.min(this.maxChunkSize, remaining.length);
            const chunkWords = remaining.slice(0, chunkSize);
            
            chunks.push({
                id: `chunk-${chunkIndex}`,
                content: chunkWords.join(' '),
                wordCount: chunkSize,
                type: 'expandable',
                visible: false,
                isLast: remaining.length <= chunkSize
            });

            remaining = remaining.slice(chunkSize);
            chunkIndex++;
        }

        return {
            total: chunks.length,
            totalWords: words.length,
            initialVisible: initialWords,
            chunks: chunks
        };
    }

    /**
     * Create collapsible sections based on headers
     */
    createCollapsibleSections(response) {
        const lines = response.split('\n');
        const sections = [];
        let currentSection = null;
        let sectionId = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if line is a header
            const isHeader = this.sectionMarkers.some(marker => line.startsWith(marker));
            
            if (isHeader) {
                // Save previous section
                if (currentSection) {
                    sections.push(currentSection);
                }

                // Start new section
                const headerLevel = this.getHeaderLevel(line);
                const title = line.replace(/^#{1,6}\s*/, '').replace(/🌾|📋|💡|📊|🔧|💰|📅|🏛️|❓|🎯/g, '').trim();
                
                currentSection = {
                    id: `section-${sectionId++}`,
                    title: title,
                    level: headerLevel,
                    content: '',
                    wordCount: 0,
                    collapsible: this.isCollapsibleSection(title),
                    defaultOpen: headerLevel <= 2 || title.toLowerCase().includes('basic') || title.toLowerCase().includes('introduction')
                };
            } else if (currentSection && line.length > 0) {
                currentSection.content += line + '\n';
            }
        }

        // Add last section
        if (currentSection) {
            sections.push(currentSection);
        }

        // Calculate word counts
        sections.forEach(section => {
            section.wordCount = section.content.split(' ').filter(word => word.length > 0).length;
        });

        return sections;
    }

    /**
     * Convert markdown to HTML with collapsible sections
     */
    convertToHTML(response, enableCollapsible = true) {
        let html = response;

        // Convert headers
        html = html.replace(/^#{6}\s*(.+)$/gm, '<h6 class="farming-header h6">$1</h6>');
        html = html.replace(/^#{5}\s*(.+)$/gm, '<h5 class="farming-header h5">$1</h5>');
        html = html.replace(/^#{4}\s*(.+)$/gm, '<h4 class="farming-header h4">$1</h4>');
        html = html.replace(/^#{3}\s*(.+)$/gm, '<h3 class="farming-header h3">$1</h3>');
        html = html.replace(/^#{2}\s*(.+)$/gm, '<h2 class="farming-header h2">$1</h2>');
        html = html.replace(/^#{1}\s*(.+)$/gm, '<h1 class="farming-header h1">$1</h1>');

        // Convert formatting
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/`(.+?)`/g, '<code>$1</code>');

        // Convert lists
        html = html.replace(/^[-\*]\s*(.+)$/gm, '<li class="farming-list-item">$1</li>');
        html = html.replace(/(<li class="farming-list-item">.*<\/li>)/gs, '<ul class="farming-list">$1</ul>');

        // Convert line breaks
        html = html.replace(/\n\n/g, '</p><p class="farming-paragraph">');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraphs
        html = '<div class="farming-response"><p class="farming-paragraph">' + html + '</p></div>';

        // Add collapsible sections if enabled
        if (enableCollapsible) {
            html = this.addCollapsibleHTML(html);
        }

        return html;
    }

    /**
     * Add collapsible functionality to HTML
     */
    addCollapsibleHTML(html) {
        const sections = this.createCollapsibleSections(html);
        
        sections.forEach(section => {
            if (section.collapsible) {
                const sectionRegex = new RegExp(`(<h[2-6][^>]*>${section.title}</h[2-6]>)(.*?)(?=<h[1-6]|$)`, 'si');
                html = html.replace(sectionRegex, (match, header, content) => {
                    const isOpen = section.defaultOpen ? 'open' : '';
                    const buttonText = section.defaultOpen ? '🔽' : '▶️';
                    
                    return `
                        <div class="collapsible-section" data-section-id="${section.id}">
                            ${header}
                            <button class="collapsible-toggle" onclick="toggleSection('${section.id}')" aria-label="Toggle section">
                                <span class="toggle-icon">${buttonText}</span>
                                <span class="word-count">(${section.wordCount} words)</span>
                            </button>
                            <div class="collapsible-content ${isOpen}" id="content-${section.id}">
                                ${content}
                            </div>
                        </div>
                    `;
                });
            }
        });

        return html;
    }

    /**
     * Create navigation menu for long responses
     */
    createNavigation(response) {
        const sections = this.createCollapsibleSections(response);
        const navigation = {
            sections: sections.map(section => ({
                id: section.id,
                title: section.title,
                level: section.level,
                wordCount: section.wordCount,
                anchor: `#${section.id}`
            })),
            totalSections: sections.length,
            totalWords: response.split(' ').length,
            estimatedReadTime: Math.ceil(response.split(' ').length / 200)
        };

        return navigation;
    }

    /**
     * Helper methods
     */
    getHeaderLevel(line) {
        const match = line.match(/^(#{1,6})/);
        return match ? match[1].length : 0;
    }

    isCollapsibleSection(title) {
        return this.collapsibleSections.some(section => 
            title.toLowerCase().includes(section.toLowerCase())
        );
    }

    /**
     * Generate CSS for styling formatted responses
     */
    generateCSS() {
        return `
/* Farming Response Styles */
.farming-response {
    max-width: 100%;
    line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.farming-header {
    color: #2d5016;
    border-bottom: 2px solid #4a7c28;
    padding-bottom: 8px;
    margin: 20px 0 15px 0;
}

.farming-paragraph {
    margin: 15px 0;
    text-align: justify;
}

.farming-list {
    margin: 15px 0;
    padding-left: 25px;
}

.farming-list-item {
    margin: 8px 0;
    list-style-type: disc;
}

/* Collapsible Sections */
.collapsible-section {
    margin: 20px 0;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.collapsible-toggle {
    background: #f8f9fa;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #666;
}

.collapsible-toggle:hover {
    background: #e9ecef;
}

.collapsible-content {
    padding: 0 20px;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease;
}

.collapsible-content.open {
    max-height: none;
    padding: 20px;
}

.toggle-icon {
    font-size: 16px;
    margin-right: 10px;
}

.word-count {
    font-size: 12px;
    color: #999;
}

/* Responsive Design */
@media (max-width: 768px) {
    .farming-response {
        font-size: 16px;
    }
    
    .collapsible-content {
        padding: 0 15px;
    }
    
    .collapsible-content.open {
        padding: 15px;
    }
}

/* Read More Chunks */
.chunk-container {
    margin: 20px 0;
}

.chunk {
    margin-bottom: 15px;
}

.chunk.hidden {
    display: none;
}

.read-more-btn {
    background: #4a7c28;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin: 10px 0;
}

.read-more-btn:hover {
    background: #2d5016;
}

.reading-progress {
    position: sticky;
    top: 0;
    background: #fff;
    padding: 10px;
    border-bottom: 1px solid #eee;
    z-index: 100;
}

.progress-bar {
    height: 4px;
    background: #4a7c28;
    border-radius: 2px;
    transition: width 0.3s ease;
}
        `;
    }

    /**
     * Generate JavaScript for interactive functionality
     */
    generateJavaScript() {
        return `
// Farming Response Interactive JavaScript

function toggleSection(sectionId) {
    const content = document.getElementById('content-' + sectionId);
    const button = document.querySelector('[data-section-id="' + sectionId + '"] .toggle-icon');
    
    if (content && button) {
        const isOpen = content.classList.contains('open');
        
        if (isOpen) {
            content.classList.remove('open');
            button.textContent = '▶️';
        } else {
            content.classList.add('open');
            button.textContent = '🔽';
        }
    }
}

function showNextChunk() {
    const chunks = document.querySelectorAll('.chunk.hidden');
    if (chunks.length > 0) {
        chunks[0].classList.remove('hidden');
        
        // Update read more button
        const btn = document.querySelector('.read-more-btn');
        if (chunks.length === 1) {
            btn.style.display = 'none';
        } else {
            btn.textContent = 'Read More (' + (chunks.length - 1) + ' sections remaining)';
        }
    }
}

function expandAllSections() {
    const contents = document.querySelectorAll('.collapsible-content');
    const buttons = document.querySelectorAll('.toggle-icon');
    
    contents.forEach(content => content.classList.add('open'));
    buttons.forEach(button => button.textContent = '🔽');
}

function collapseAllSections() {
    const contents = document.querySelectorAll('.collapsible-content');
    const buttons = document.querySelectorAll('.toggle-icon');
    
    contents.forEach(content => content.classList.remove('open'));
    buttons.forEach(button => button.textContent = '▶️');
}

// Reading progress tracker
function updateReadingProgress() {
    const response = document.querySelector('.farming-response');
    if (!response) return;
    
    const scrolled = window.pageYOffset;
    const total = response.offsetHeight - window.innerHeight;
    const progress = Math.min((scrolled / total) * 100, 100);
    
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add reading progress if response is long
    const response = document.querySelector('.farming-response');
    if (response && response.textContent.split(' ').length > 1000) {
        const progressHTML = \`
            <div class="reading-progress">
                <div class="progress-bar"></div>
                <span class="progress-text">Reading Progress</span>
            </div>
        \`;
        response.insertAdjacentHTML('beforebegin', progressHTML);
        
        window.addEventListener('scroll', updateReadingProgress);
    }
    
    // Auto-collapse sections if response is very long
    const wordCount = response ? response.textContent.split(' ').length : 0;
    if (wordCount > 2500) {
        setTimeout(collapseAllSections, 1000);
    }
});
        `;
    }
}

module.exports = ResponseFormatter;