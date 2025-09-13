const express = require('express');
const router = express.Router();

// Helper function to get default image for category
function getDefaultImageForCategory(category) {
  const categoryImages = {
    general: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    entertainment: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&q=80',
    health: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    science: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
  };
  return categoryImages[category] || categoryImages.general;
}

// Enhanced mock news data with realistic content and high-quality images
const getMockNews = (category = 'general', pageSize = 6, page = 1) => {
  const timestamp = Date.now() + (page * 1000); // Vary timestamp by page
  
  // Real news sites for authentic URLs
  const newsSites = {
    general: ['https://www.reuters.com', 'https://www.bbc.com', 'https://www.cnn.com'],
    technology: ['https://www.theverge.com', 'https://www.wired.com', 'https://techcrunch.com'],
    business: ['https://www.bloomberg.com', 'https://www.forbes.com', 'https://www.wsj.com'],
    sports: ['https://www.espn.com', 'https://www.skysports.com', 'https://www.sportingnews.com'],
    health: ['https://www.healthline.com', 'https://www.medicalnewstoday.com', 'https://www.webmd.com'],
    entertainment: ['https://www.variety.com', 'https://www.hollywoodreporter.com', 'https://www.eonline.com'],
    science: ['https://www.sciencedaily.com', 'https://www.nature.com', 'https://www.scientificamerican.com']
  };
  
  const mockArticles = {
    general: [
      {
        title: "Breaking: Major Technology Breakthrough in AI Research Announced Today",
        description: "Scientists at leading tech companies have made a significant discovery in artificial intelligence that could revolutionize how we interact with digital devices and process information.",
        url: `https://www.techcrunch.com/2024/ai-breakthrough-${timestamp}-1`,
        urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        author: "Sarah Johnson",
        publishedAt: new Date().toISOString(),
        source: { name: "TechCrunch", id: "techcrunch", url: "https://techcrunch.com" }
      },
      {
        title: "Global Climate Summit: World Leaders Unite on Carbon Reduction Goals",
        description: "In a historic agreement, over 190 countries have committed to ambitious new carbon reduction targets, with major economies pledging to achieve net-zero emissions by 2050.",
        url: `https://www.bbc.com/news/world-${timestamp}-2`,
        urlToImage: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&q=80",
        author: "Emma Thompson",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "BBC News", id: "bbc-news", url: "https://www.bbc.com" }
      },
      {
        title: "Stock Markets Rally as Tech Giants Report Record Earnings",
        description: "Major indices hit all-time highs as Apple, Microsoft, and Google exceed quarterly expectations, with investors showing renewed confidence in the technology sector.",
        url: `https://www.bloomberg.com/news/articles/markets-rally-${timestamp}-3`,
        urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
        author: "Michael Chen",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "Bloomberg", id: "bloomberg", url: "https://www.bloomberg.com" }
      },
      {
        title: "Revolutionary Cancer Treatment Shows 90% Success Rate in Trials",
        description: "A groundbreaking immunotherapy treatment has shown unprecedented success in clinical trials, offering new hope for patients with previously untreatable cancers.",
        url: `https://www.reuters.com/health/cancer-treatment-${timestamp}-4`,
        urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
        author: "Dr. Robert Martinez",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: "Reuters Health", id: "reuters", url: "https://www.reuters.com" }
      },
      {
        title: "James Webb Telescope Discovers Potentially Habitable Exoplanet",
        description: "NASA's James Webb Space Telescope has identified an Earth-like planet with signs of water vapor in its atmosphere, located just 120 light-years from Earth.",
        url: `https://www.nasa.gov/news/webb-discovery-${timestamp}-5`,
        urlToImage: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80",
        author: "Dr. Lisa Anderson",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: "NASA", id: "nasa", url: "https://www.nasa.gov" }
      },
      {
        title: "Tesla Unveils Next-Generation Battery Technology",
        description: "Electric vehicle giant Tesla announces breakthrough in battery technology, promising 1000-mile range and 10-minute charging times for future models.",
        url: `https://www.wsj.com/articles/tesla-battery-tech-${timestamp}-6`,
        urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bfec180c73?w=800&q=80",
        author: "James Wilson",
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: "Wall Street Journal", id: "wsj", url: "https://www.wsj.com" }
      },
      {
        title: "India Launches Ambitious Green Energy Initiative",
        description: "The government announces a $50 billion investment in renewable energy infrastructure, aiming to generate 500GW from clean sources by 2030.",
        url: `https://www.cnn.com/india/energy-${timestamp}-7`,
        urlToImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
        author: "Priya Sharma",
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: "CNN", id: "cnn", url: "https://www.cnn.com" }
      },
      {
        title: "Quantum Internet Successfully Tested Between Major Cities",
        description: "Scientists achieve quantum entanglement over 600 kilometers, marking a major step toward unhackable quantum communications networks.",
        url: `https://www.nature.com/articles/quantum-internet-${timestamp}-8`,
        urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        author: "Prof. Zhang Wei",
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: "Nature", id: "nature", url: "https://www.nature.com" }
      }
    ],
    business: [
      {
        title: "Apple Becomes First Company to Reach $4 Trillion Market Cap",
        description: "Apple Inc. makes history as its market valuation crosses the $4 trillion mark, driven by strong iPhone sales and growing services revenue.",
        url: `https://www.forbes.com/apple-market-cap-${timestamp}-1`,
        urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
        author: "David Roberts",
        publishedAt: new Date().toISOString(),
        source: { name: "Forbes", id: "forbes", url: "https://www.forbes.com" }
      },
      {
        title: "Global Supply Chain Recovery Accelerates",
        description: "International trade routes show significant improvement as logistics companies expand operations.",
        url: "https://ft.com/supply-chain",
        urlToImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
        author: "Trade Correspondent",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Financial Times" }
      },
      {
        title: "Cryptocurrency Market Sees Renewed Interest",
        description: "Digital assets gain momentum as institutional investors increase their exposure.",
        url: "https://coindesk.com/crypto-surge",
        urlToImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
        author: "Crypto Analyst",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "CoinDesk" }
      }
    ],
    technology: [
      {
        title: "Quantum Computing Breakthrough Achieves New Record",
        description: "Researchers demonstrate quantum supremacy with practical applications in cryptography.",
        url: "https://wired.com/quantum-computing",
        urlToImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
        author: "Tech Researcher",
        publishedAt: new Date().toISOString(),
        source: { name: "Wired" }
      },
      {
        title: "5G Networks Expand to Rural Communities",
        description: "Telecommunication companies accelerate 5G rollout to underserved areas.",
        url: "https://techcrunch.com/5g-expansion",
        urlToImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
        author: "Network Specialist",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "TechCrunch" }
      },
      {
        title: "Robotics Industry Sees Unprecedented Growth",
        description: "Advanced robots transform manufacturing and healthcare sectors worldwide.",
        url: "https://ieee.org/robotics-growth",
        urlToImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
        author: "Robotics Expert",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "IEEE Spectrum" }
      }
    ],
    health: [
      {
        title: "Revolutionary Gene Therapy Shows Promise",
        description: "Clinical trials demonstrate significant success in treating rare genetic disorders.",
        url: "https://nature.com/gene-therapy",
        urlToImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
        author: "Medical Correspondent",
        publishedAt: new Date().toISOString(),
        source: { name: "Nature Medicine" }
      },
      {
        title: "Mental Health Awareness Gains Global Momentum",
        description: "Countries worldwide implement new policies to support mental health initiatives.",
        url: "https://who.int/mental-health",
        urlToImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80",
        author: "Health Policy Expert",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "WHO News" }
      },
      {
        title: "Vaccine Development Accelerates for Emerging Diseases",
        description: "International collaboration speeds up vaccine research for tropical diseases.",
        url: "https://lancet.com/vaccine-development",
        urlToImage: "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=800&q=80",
        author: "Vaccine Researcher",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "The Lancet" }
      }
    ],
    entertainment: [
      {
        title: "Streaming Services Announce Major Content Expansion",
        description: "Leading platforms invest billions in original programming for global audiences.",
        url: "https://variety.com/streaming-expansion",
        urlToImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80",
        author: "Entertainment Reporter",
        publishedAt: new Date().toISOString(),
        source: { name: "Variety" }
      },
      {
        title: "Music Industry Celebrates Record-Breaking Concert Tour",
        description: "International artist's world tour becomes highest-grossing in history.",
        url: "https://billboard.com/concert-tour",
        urlToImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
        author: "Music Journalist",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Billboard" }
      },
      {
        title: "Gaming Industry Reaches New Heights with VR Technology",
        description: "Virtual reality gaming experiences transform entertainment landscape.",
        url: "https://ign.com/vr-gaming",
        urlToImage: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80",
        author: "Gaming Expert",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "IGN" }
      }
    ],
    sports: [
      {
        title: "Olympics Preparation Intensifies as Athletes Peak",
        description: "World-class athletes enter final training phase for upcoming Olympic Games.",
        url: "https://espn.com/olympics-prep",
        urlToImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
        author: "Sports Reporter",
        publishedAt: new Date().toISOString(),
        source: { name: "ESPN" }
      },
      {
        title: "Football League Announces Revolutionary Rule Changes",
        description: "Major football associations implement new regulations to enhance player safety.",
        url: "https://skysports.com/football-rules",
        urlToImage: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
        author: "Football Analyst",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Sky Sports" }
      },
      {
        title: "Tennis Star Makes Historic Grand Slam Victory",
        description: "Young athlete becomes youngest player to win all four major tournaments.",
        url: "https://tennis.com/grand-slam",
        urlToImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
        author: "Tennis Correspondent",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "Tennis Magazine" }
      }
    ]
  };

  const articles = mockArticles[category] || mockArticles.general;
  return articles.slice(0, pageSize);
};

// Base route for news - redirects to top headlines
router.get('/', async (req, res) => {
  // Redirect to /top with query parameters
  const queryString = new URLSearchParams(req.query).toString();
  return res.redirect(`/api/news/top${queryString ? '?' + queryString : ''}`);
});

// GET /api/news/top?country=in&category=sports&page=1&pageSize=6
// Returns high-quality mock news data with real URLs and images
router.get('/top', async (req, res) => {
  try {
    const country = req.query.country || 'in';
    const category = req.query.category || 'general';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize || req.query.max) || 6;

    console.log(`Fetching ${category} news for ${country}, page ${page}`);
    
    // Always use high-quality mock data for consistent experience
    const mockArticles = getMockNews(category, pageSize, page);
    
    // Simulate realistic response
    return res.json({
      status: 'ok',
      totalResults: 100, // Simulate having more articles available
      articles: mockArticles,
      source: 'newsboard-api',
      page: page,
      pageSize: pageSize
    });
  } catch (err) {
    console.error('News proxy error:', err);
    // Ultimate fallback
    const mockArticles = getMockNews('general', pageSize);
    return res.json({
      status: 'ok',
      totalResults: mockArticles.length,
      articles: mockArticles,
      source: 'mock-fallback'
    });
  }
});

// Utility: ensure unique articles by URL/title
function dedupeArticles(articles = []) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const key = (a.url || a.title || '').toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(a);
    }
  }
  return out;
}

// GET /api/news/search?q=bitcoin&category=business&sortBy=relevancy&page=1&pageSize=12
// Search news articles
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Search query is required' });
    }

    const category = req.query.category || 'general';
    const sortBy = req.query.sortBy || 'publishedAt';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 12;

    console.log(`Searching for: ${query} in ${category}`);
    
    // Generate search results based on query and category
    const baseArticles = getMockNews(category, pageSize * 2, page);
    const timestamp = Date.now();
    
    // Create search-specific articles
    const searchResults = baseArticles.map((article, index) => ({
      ...article,
      title: `${query.charAt(0).toUpperCase() + query.slice(1)}: ${article.title}`,
      description: `${article.description} Related to your search for ${query}.`,
      url: `${article.url.split('?')[0]}/search/${query.replace(/\s+/g, '-')}-${timestamp}-${index}`,
      relevance: Math.random() // Simulate relevance scoring
    }));
    
    // Sort by relevance if requested
    if (sortBy === 'relevancy') {
      searchResults.sort((a, b) => b.relevance - a.relevance);
    }
    
    return res.json({
      status: 'ok',
      totalResults: 50, // Simulate having many results
      articles: searchResults.slice(0, pageSize),
      source: 'newsboard-search',
      query: query,
      page: page
    });
  } catch (err) {
    console.error('News search error:', err);
    // Ultimate fallback
    const mockResults = [{
      title: "Search functionality temporarily unavailable",
      description: "We're working to restore full search capabilities. Please try again later.",
      url: "https://example.com/search-error",
      urlToImage: "https://via.placeholder.com/400x200/dc3545/ffffff?text=Search+Error",
      author: "NewsBoard Team",
      publishedAt: new Date().toISOString(),
      source: { name: "NewsBoard" }
    }];
    
    return res.json({
      status: 'ok',
      totalResults: 1,
      articles: mockResults,
      source: 'error-fallback'
    });
  }
});

// GET /api/news/trending?topics=5
// Get trending topics based on recent popular searches
router.get('/trending', async (req, res) => {
  try {
    const topicsCount = parseInt(req.query.topics) || 10;
    const country = req.query.country || 'in';

    // Popular trending topics
    const trendingTopics = [
      'artificial intelligence', 'climate change', 'cryptocurrency', 
      'space exploration', 'renewable energy', 'cybersecurity',
      'electric vehicles', 'quantum computing', 'biotechnology',
      'social media', 'pandemic recovery', 'economic growth'
    ];

    const topics = trendingTopics.slice(0, topicsCount);
    
    // Generate trending data with mock articles
    const trendingData = topics.slice(0, 5).map(topic => {
      const categoryArticles = getMockNews('general', 2);
      return {
        topic,
        articles: categoryArticles.map(article => ({
          ...article,
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)}: ${article.title}`,
          description: `Latest developments in ${topic}. ${article.description}`,
          url: `${article.url}/trending/${topic.replace(/\s+/g, '-')}`
        })),
        totalResults: 10
      };
    });
    
    return res.json({
      status: 'ok',
      trending: topics,
      trendingWithArticles: trendingData,
      source: 'generated-trending'
    });
  } catch (err) {
    console.error('Trending topics error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to get trending topics' });
  }
});

module.exports = router;
