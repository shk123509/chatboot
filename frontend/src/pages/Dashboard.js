import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      farmerStats: null,
      cropData: [],
      weatherInfo: null,
      farmingTips: [],
      marketPrices: [],
      seasonalTasks: [],
      loading: true,
      error: null,
      animationStarted: false
    };
  }

  async componentDidMount() {
    // Start animations
    setTimeout(() => this.setState({ animationStarted: true }), 100);

    const token = localStorage.getItem('token');
    if (!token) {
      this.setState({ error: 'Please login to view your dashboard', loading: false });
      return;
    }

    // Load all dashboard data
    await Promise.all([
      this.loadFarmerStats(),
      this.loadCropData(),
      this.loadWeatherData(),
      this.loadFarmingTips(),
      this.loadMarketPrices(),
      this.loadSeasonalTasks()
    ]);

    this.setState({ loading: false });
  }

  loadFarmerStats = async () => {
    try {
      // Simulated farmer statistics - in real app, this would come from your backend
      const stats = {
        totalLandArea: 12.5,
        activeCrops: 4,
        completedSeasons: 15,
        yieldEfficiency: 87,
        totalIncome: 450000,
        waterUsage: 2400,
        pesticidesUsed: 45,
        organicPercent: 65,
        cropRotations: 3,
        machineryUsage: 85
      };
      
      this.setState({ farmerStats: stats });
    } catch (error) {
      console.error('Failed to load farmer stats:', error);
    }
  };

  loadCropData = async () => {
    try {
      // Simulated crop data with Indian agricultural context
      const cropData = [
        { name: 'Rice', area: 4.2, yield: 3800, season: 'Kharif', status: 'Growing' },
        { name: 'Wheat', area: 3.8, yield: 4200, season: 'Rabi', status: 'Harvested' },
        { name: 'Sugarcane', area: 2.5, yield: 75000, season: 'Annual', status: 'Processing' },
        { name: 'Cotton', area: 2.0, yield: 2100, season: 'Kharif', status: 'Growing' }
      ];
      
      this.setState({ cropData });
    } catch (error) {
      console.error('Failed to load crop data:', error);
    }
  };

  loadWeatherData = async () => {
    try {
      // Simulated weather data
      const weatherInfo = {
        temperature: 28,
        humidity: 65,
        rainfall: 45,
        windSpeed: 12,
        uvIndex: 6,
        forecast: [
          { day: 'Today', temp: 28, icon: '☀️', rain: 0 },
          { day: 'Tomorrow', temp: 31, icon: '⛅', rain: 20 },
          { day: 'Day 3', temp: 27, icon: '🌧️', rain: 80 },
          { day: 'Day 4', temp: 26, icon: '🌦️', rain: 60 },
          { day: 'Day 5', temp: 29, icon: '☀️', rain: 10 }
        ]
      };
      
      this.setState({ weatherInfo });
    } catch (error) {
      console.error('Failed to load weather data:', error);
    }
  };

  loadFarmingTips = async () => {
    try {
      // Farmer-focused Q&A and tips
      const farmingTips = [
        {
          question: "What's the best time to plant rice in monsoon season?",
          answer: "Plant rice 2-3 weeks after monsoon onset when soil has adequate moisture. Optimal time is mid-June to early July.",
          category: "Planting",
          icon: "🌾"
        },
        {
          question: "How to identify wheat rust disease early?",
          answer: "Look for orange-brown pustules on leaves and stems. Early morning inspection is best. Apply fungicide immediately if detected.",
          category: "Disease Management",
          icon: "🔬"
        },
        {
          question: "What's the optimal irrigation schedule for sugarcane?",
          answer: "Water every 7-10 days during growth phase, reduce to 15-20 days during maturity. Stop irrigation 2-3 weeks before harvest.",
          category: "Irrigation",
          icon: "💧"
        },
        {
          question: "How to improve cotton yield naturally?",
          answer: "Use crop rotation with legumes, apply organic manure, practice inter-cropping with marigold for pest control.",
          category: "Yield Enhancement",
          icon: "🌱"
        }
      ];
      
      this.setState({ farmingTips });
    } catch (error) {
      console.error('Failed to load farming tips:', error);
    }
  };

  loadMarketPrices = async () => {
    try {
      // Simulated market prices in Indian context
      const marketPrices = [
        { crop: 'Rice', price: 2100, unit: 'per quintal', change: +150, trend: 'up' },
        { crop: 'Wheat', price: 2350, unit: 'per quintal', change: -50, trend: 'down' },
        { crop: 'Sugarcane', price: 350, unit: 'per quintal', change: +25, trend: 'up' },
        { crop: 'Cotton', price: 6200, unit: 'per quintal', change: +300, trend: 'up' }
      ];
      
      this.setState({ marketPrices });
    } catch (error) {
      console.error('Failed to load market prices:', error);
    }
  };

  loadSeasonalTasks = async () => {
    try {
      // Current seasonal tasks for farmers
      const seasonalTasks = [
        { task: 'Prepare fields for Rabi season', priority: 'High', dueDate: '2024-11-15', status: 'pending' },
        { task: 'Harvest Kharif crops', priority: 'High', dueDate: '2024-11-01', status: 'in-progress' },
        { task: 'Check irrigation systems', priority: 'Medium', dueDate: '2024-11-10', status: 'pending' },
        { task: 'Order seeds for next season', priority: 'Medium', dueDate: '2024-11-20', status: 'pending' }
      ];
      
      this.setState({ seasonalTasks });
    } catch (error) {
      console.error('Failed to load seasonal tasks:', error);
    }
  };

  // Chart data configurations
  getCropYieldChartData = () => {
    const { cropData } = this.state;
    return {
      labels: cropData.map(crop => crop.name),
      datasets: [
        {
          label: 'Yield (kg/hectare)',
          data: cropData.map(crop => crop.yield),
          backgroundColor: [
            'rgba(76, 175, 80, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(156, 39, 176, 0.8)',
            'rgba(244, 67, 54, 0.8)'
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(244, 67, 54, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  getLandDistributionData = () => {
    const { cropData } = this.state;
    return {
      labels: cropData.map(crop => crop.name),
      datasets: [
        {
          data: cropData.map(crop => crop.area),
          backgroundColor: [
            'rgba(33, 150, 243, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(233, 30, 99, 0.8)',
            'rgba(139, 195, 74, 0.8)'
          ],
          borderColor: [
            'rgba(33, 150, 243, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(233, 30, 99, 1)',
            'rgba(139, 195, 74, 1)'
          ],
          borderWidth: 3,
          hoverOffset: 20
        }
      ]
    };
  };

  getWeatherTrendData = () => {
    const { weatherInfo } = this.state;
    if (!weatherInfo) return {};
    
    return {
      labels: weatherInfo.forecast.map(day => day.day),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: weatherInfo.forecast.map(day => day.temp),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Rain Chance (%)',
          data: weatherInfo.forecast.map(day => day.rain),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  };

  render() {
    const { 
      farmerStats, 
      cropData, 
      weatherInfo, 
      farmingTips, 
      marketPrices, 
      seasonalTasks,
      loading, 
      error, 
      animationStarted 
    } = this.state;
    
    const { user } = this.props;

    if (loading) {
      return (
        <div className="dashboard-loading">
          <div className="loading-animation">
            <div className="tractor-loader">
              <span className="tractor-icon">🚜</span>
              <div className="loading-text">Loading your farm dashboard...</div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-error">
          <div className="error-content">
            <span className="error-icon">🌾</span>
            <h2>Access Denied</h2>
            <p>{error}</p>
            <Link to="/login" className="btn btn-primary">
              <span>🔑</span> Login to Continue
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-container">
        {/* Hero Section */}
        <div className={`dashboard-hero ${animationStarted ? 'animate-fadeInDown' : 'animate-hidden'}`}>
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="title-emoji">🌾</span>
                Welcome to Your Farm Dashboard
              </h1>
              <p className="hero-subtitle">
                Manage your crops, track yields, and grow your farming business
              </p>
            </div>
            <div className="hero-stats">
              <div className="quick-stat">
                <span className="stat-icon">🏡</span>
                <div className="stat-info">
                  <span className="stat-number">{farmerStats?.totalLandArea}</span>
                  <span className="stat-label">Acres</span>
                </div>
              </div>
              <div className="quick-stat">
                <span className="stat-icon">🌱</span>
                <div className="stat-info">
                  <span className="stat-number">{farmerStats?.activeCrops}</span>
                  <span className="stat-label">Active Crops</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className={`stats-grid ${animationStarted ? 'animate-fadeInUp animate-delay-200' : 'animate-hidden'}`}>
          <div className="stat-card gradient-green hover-lift">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Income</h3>
              <p className="stat-number">₹{(farmerStats?.totalIncome || 0).toLocaleString()}</p>
              <span className="stat-change positive">+12% this season</span>
            </div>
          </div>
          
          <div className="stat-card gradient-blue hover-lift">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Yield Efficiency</h3>
              <p className="stat-number">{farmerStats?.yieldEfficiency}%</p>
              <span className="stat-change positive">+5% from last year</span>
            </div>
          </div>
          
          <div className="stat-card gradient-purple hover-lift">
            <div className="stat-icon">🌿</div>
            <div className="stat-content">
              <h3>Organic Farming</h3>
              <p className="stat-number">{farmerStats?.organicPercent}%</p>
              <span className="stat-change positive">Sustainable growth</span>
            </div>
          </div>
          
          <div className="stat-card gradient-orange hover-lift">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>Crop Rotations</h3>
              <p className="stat-number">{farmerStats?.cropRotations}</p>
              <span className="stat-change neutral">This season</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className={`charts-section ${animationStarted ? 'animate-fadeInUp animate-delay-400' : 'animate-hidden'}`}>
          <div className="charts-grid">
            {/* Crop Yield Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3><span>📈</span> Crop Yield Analysis</h3>
              </div>
              <div className="chart-container">
                <Bar 
                  data={this.getCropYieldChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 12,
                        displayColors: false
                      }
                    },
                    scales: {
                      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
                      x: { grid: { color: 'rgba(255,255,255,0.1)' } }
                    }
                  }}
                />
              </div>
            </div>

            {/* Land Distribution */}
            <div className="chart-card">
              <div className="chart-header">
                <h3><span>🥧</span> Land Distribution</h3>
              </div>
              <div className="chart-container">
                <Doughnut 
                  data={this.getLandDistributionData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: { color: '#333', padding: 20 }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 12
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Weather Trend */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3><span>🌤️</span> Weather Forecast Trend</h3>
              </div>
              <div className="chart-container">
                <Line 
                  data={this.getWeatherTrendData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'top',
                        labels: { color: '#333', padding: 20 }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 12
                      }
                    },
                    scales: {
                      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
                      x: { grid: { color: 'rgba(255,255,255,0.1)' } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className={`content-grid ${animationStarted ? 'animate-fadeInUp animate-delay-600' : 'animate-hidden'}`}>
          {/* Weather Widget */}
          <div className="content-card weather-card">
            <div className="card-header">
              <h3><span>🌡️</span> Current Weather</h3>
            </div>
            <div className="weather-current">
              <div className="temp-display">
                <span className="temperature">{weatherInfo?.temperature}°C</span>
                <span className="weather-icon">☀️</span>
              </div>
              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-icon">💧</span>
                  <span>Humidity: {weatherInfo?.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌧️</span>
                  <span>Rainfall: {weatherInfo?.rainfall}mm</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💨</span>
                  <span>Wind: {weatherInfo?.windSpeed} km/h</span>
                </div>
              </div>
            </div>
            <div className="weather-forecast">
              {weatherInfo?.forecast.slice(1, 4).map((day, index) => (
                <div key={index} className="forecast-item">
                  <span className="forecast-day">{day.day}</span>
                  <span className="forecast-icon">{day.icon}</span>
                  <span className="forecast-temp">{day.temp}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Prices */}
          <div className="content-card market-card">
            <div className="card-header">
              <h3><span>💹</span> Market Prices</h3>
            </div>
            <div className="market-list">
              {marketPrices.map((item, index) => (
                <div key={index} className="market-item">
                  <div className="market-crop">
                    <span className="crop-name">{item.crop}</span>
                    <span className="crop-unit">{item.unit}</span>
                  </div>
                  <div className="market-price">
                    <span className="price">₹{item.price}</span>
                    <span className={`price-change ${item.trend}`}>
                      {item.change > 0 ? '+' : ''}₹{item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farming Q&A */}
          <div className="content-card tips-card full-width">
            <div className="card-header">
              <h3><span>💡</span> Farming Questions & Answers</h3>
            </div>
            <div className="tips-grid">
              {farmingTips.map((tip, index) => (
                <div key={index} className="tip-item hover-lift">
                  <div className="tip-header">
                    <span className="tip-icon">{tip.icon}</span>
                    <span className="tip-category">{tip.category}</span>
                  </div>
                  <h4 className="tip-question">{tip.question}</h4>
                  <p className="tip-answer">{tip.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Tasks */}
          <div className="content-card tasks-card">
            <div className="card-header">
              <h3><span>📋</span> Seasonal Tasks</h3>
            </div>
            <div className="tasks-list">
              {seasonalTasks.map((task, index) => (
                <div key={index} className={`task-item ${task.status}`}>
                  <div className="task-content">
                    <h4 className="task-name">{task.task}</h4>
                    <div className="task-meta">
                      <span className={`task-priority ${task.priority.toLowerCase()}`}>
                        {task.priority} Priority
                      </span>
                      <span className="task-date">Due: {task.dueDate}</span>
                    </div>
                  </div>
                  <div className={`task-status ${task.status}`}>
                    {task.status === 'completed' && '✅'}
                    {task.status === 'in-progress' && '🔄'}
                    {task.status === 'pending' && '⏳'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="content-card actions-card">
            <div className="card-header">
              <h3><span>🚀</span> Quick Actions</h3>
            </div>
            <div className="actions-grid">
              <Link to="/crops" className="action-btn gradient-green hover-scale">
                <span className="action-icon">🌱</span>
                <span>Manage Crops</span>
              </Link>
              <Link to="/chat" className="action-btn gradient-blue hover-scale">
                <span className="action-icon">💬</span>
                <span>Ask Expert</span>
              </Link>
              <Link to="/weather" className="action-btn gradient-purple hover-scale">
                <span className="action-icon">🌤️</span>
                <span>Weather Alert</span>
              </Link>
              <Link to="/market" className="action-btn gradient-orange hover-scale">
                <span className="action-icon">📊</span>
                <span>Market Trends</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;