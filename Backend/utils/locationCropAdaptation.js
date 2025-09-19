/**
 * Location and Crop-Specific Adaptation System
 * Provides intelligent crop-location matching and adaptation for farming advice
 */

class LocationCropAdaptation {
    constructor() {
        this.locationData = this.loadLocationData();
        this.cropSuitability = this.loadCropSuitability();
        this.agroclimaticZones = this.loadAgroclimaticZones();
        this.unusualCombinations = this.loadUnusualCombinations();
    }

    /**
     * Load comprehensive location data for India
     */
    loadLocationData() {
        return {
            states: {
                'punjab': {
                    climate: 'semi-arid',
                    rainfall: '400-700mm',
                    temperature: {'winter': '5-20°C', 'summer': '25-45°C'},
                    soil_types: ['alluvial', 'sandy_loam'],
                    major_crops: ['wheat', 'rice', 'cotton', 'sugarcane', 'maize'],
                    irrigation: 'canal_tubewell',
                    cropping_pattern: 'rice-wheat',
                    challenges: ['water_depletion', 'soil_degradation', 'stubble_burning']
                },
                'haryana': {
                    climate: 'semi-arid',
                    rainfall: '350-650mm',
                    temperature: {'winter': '3-18°C', 'summer': '25-48°C'},
                    soil_types: ['alluvial', 'sandy'],
                    major_crops: ['wheat', 'rice', 'cotton', 'bajra', 'mustard'],
                    irrigation: 'canal_tubewell',
                    cropping_pattern: 'rice-wheat',
                    challenges: ['groundwater_depletion', 'salinity', 'heat_stress']
                },
                'rajasthan': {
                    climate: 'arid_semi-arid',
                    rainfall: '100-600mm',
                    temperature: {'winter': '5-25°C', 'summer': '30-50°C'},
                    soil_types: ['sandy', 'sandy_loam', 'saline'],
                    major_crops: ['bajra', 'jowar', 'wheat', 'mustard', 'guar'],
                    irrigation: 'tubewell_limited',
                    cropping_pattern: 'drought_tolerant',
                    challenges: ['water_scarcity', 'sand_storms', 'extreme_heat']
                },
                'uttar pradesh': {
                    climate: 'subtropical',
                    rainfall: '600-1200mm',
                    temperature: {'winter': '5-25°C', 'summer': '25-45°C'},
                    soil_types: ['alluvial', 'clayey_loam'],
                    major_crops: ['wheat', 'rice', 'sugarcane', 'potato', 'pulses'],
                    irrigation: 'canal_tubewell_pond',
                    cropping_pattern: 'rice-wheat-sugarcane',
                    challenges: ['waterlogging', 'pest_pressure', 'fragmented_holdings']
                },
                'bihar': {
                    climate: 'subtropical',
                    rainfall: '1000-1400mm',
                    temperature: {'winter': '8-25°C', 'summer': '25-45°C'},
                    soil_types: ['alluvial', 'clayey'],
                    major_crops: ['rice', 'wheat', 'maize', 'pulses', 'jute'],
                    irrigation: 'canal_pond_flood',
                    cropping_pattern: 'rice-wheat',
                    challenges: ['flooding', 'drainage', 'soil_fertility']
                },
                'west bengal': {
                    climate: 'humid_subtropical',
                    rainfall: '1400-2500mm',
                    temperature: {'winter': '10-28°C', 'summer': '25-40°C'},
                    soil_types: ['alluvial', 'laterite', 'clayey'],
                    major_crops: ['rice', 'jute', 'tea', 'potato', 'vegetables'],
                    irrigation: 'natural_rainfall',
                    cropping_pattern: 'rice-rice-potato',
                    challenges: ['cyclones', 'high_humidity', 'pest_disease']
                },
                'maharashtra': {
                    climate: 'tropical_semi-arid',
                    rainfall: '400-3000mm',
                    temperature: {'winter': '12-30°C', 'summer': '25-45°C'},
                    soil_types: ['black_soil', 'red_soil', 'alluvial'],
                    major_crops: ['cotton', 'sugarcane', 'soybean', 'wheat', 'rice'],
                    irrigation: 'rainfed_canal_drip',
                    cropping_pattern: 'cotton-wheat_soybean-wheat',
                    challenges: ['erratic_rainfall', 'drought', 'pest_resistance']
                },
                'karnataka': {
                    climate: 'tropical_monsoon',
                    rainfall: '500-3000mm',
                    temperature: {'winter': '15-32°C', 'summer': '22-40°C'},
                    soil_types: ['red_soil', 'black_soil', 'laterite'],
                    major_crops: ['rice', 'ragi', 'cotton', 'sugarcane', 'coffee'],
                    irrigation: 'canal_tank_borewell',
                    cropping_pattern: 'kharif-rabi-summer',
                    challenges: ['water_disputes', 'climate_variability', 'coffee_pest']
                },
                'andhra pradesh': {
                    climate: 'tropical',
                    rainfall: '600-1200mm',
                    temperature: {'winter': '18-30°C', 'summer': '28-45°C'},
                    soil_types: ['red_soil', 'black_soil', 'alluvial'],
                    major_crops: ['rice', 'cotton', 'groundnut', 'chili', 'turmeric'],
                    irrigation: 'canal_tank_borewell',
                    cropping_pattern: 'rice-pulse_cotton-chickpea',
                    challenges: ['cyclones', 'salinity', 'groundwater_depletion']
                },
                'tamil nadu': {
                    climate: 'tropical',
                    rainfall: '800-1200mm',
                    temperature: {'winter': '20-30°C', 'summer': '28-42°C'},
                    soil_types: ['red_soil', 'black_soil', 'alluvial'],
                    major_crops: ['rice', 'cotton', 'sugarcane', 'groundnut', 'banana'],
                    irrigation: 'tank_canal_borewell',
                    cropping_pattern: 'rice-rice_cotton-pulse',
                    challenges: ['water_scarcity', 'salinity', 'pest_resistance']
                }
            },
            regions: {
                'indo-gangetic_plain': ['punjab', 'haryana', 'uttar pradesh', 'bihar'],
                'western_ghats': ['kerala', 'karnataka', 'goa', 'maharashtra'],
                'deccan_plateau': ['andhra pradesh', 'telangana', 'karnataka', 'maharashtra'],
                'eastern_ghats': ['odisha', 'andhra pradesh', 'tamil nadu'],
                'thar_desert': ['rajasthan', 'gujarat'],
                'coastal_plains': ['west bengal', 'odisha', 'andhra pradesh', 'tamil nadu', 'kerala']
            }
        };
    }

    /**
     * Load crop suitability matrix
     */
    loadCropSuitability() {
        return {
            'rice': {
                ideal_conditions: {
                    rainfall: '1000-2000mm',
                    temperature: '20-35°C',
                    soil_type: ['clayey', 'alluvial'],
                    water_requirement: 'high',
                    growing_season: 'kharif'
                },
                suitable_states: ['west bengal', 'andhra pradesh', 'tamil nadu', 'punjab', 'haryana', 'uttar pradesh'],
                marginal_states: ['bihar', 'odisha', 'chhattisgarh'],
                unsuitable_states: ['rajasthan_desert', 'gujarat_kutch', 'ladakh']
            },
            'wheat': {
                ideal_conditions: {
                    rainfall: '300-750mm',
                    temperature: '10-25°C',
                    soil_type: ['alluvial', 'black_soil'],
                    water_requirement: 'moderate',
                    growing_season: 'rabi'
                },
                suitable_states: ['punjab', 'haryana', 'uttar pradesh', 'madhya pradesh', 'rajasthan'],
                marginal_states: ['bihar', 'west bengal', 'maharashtra'],
                unsuitable_states: ['kerala', 'tamil_nadu_coastal', 'assam']
            },
            'cotton': {
                ideal_conditions: {
                    rainfall: '500-1000mm',
                    temperature: '20-35°C',
                    soil_type: ['black_soil', 'alluvial'],
                    water_requirement: 'moderate_high',
                    growing_season: 'kharif'
                },
                suitable_states: ['maharashtra', 'gujarat', 'andhra pradesh', 'karnataka', 'punjab'],
                marginal_states: ['haryana', 'rajasthan', 'odisha'],
                unsuitable_states: ['himachal pradesh', 'uttarakhand', 'assam']
            },
            'sugarcane': {
                ideal_conditions: {
                    rainfall: '1000-1500mm',
                    temperature: '20-35°C',
                    soil_type: ['alluvial', 'black_soil'],
                    water_requirement: 'very_high',
                    growing_season: 'annual'
                },
                suitable_states: ['uttar pradesh', 'maharashtra', 'karnataka', 'tamil nadu'],
                marginal_states: ['punjab', 'haryana', 'bihar'],
                unsuitable_states: ['rajasthan', 'himachal pradesh', 'jharkhand']
            },
            'bajra': {
                ideal_conditions: {
                    rainfall: '250-600mm',
                    temperature: '25-35°C',
                    soil_type: ['sandy', 'sandy_loam'],
                    water_requirement: 'low',
                    growing_season: 'kharif'
                },
                suitable_states: ['rajasthan', 'gujarat', 'haryana', 'maharashtra'],
                marginal_states: ['punjab', 'karnataka', 'andhra pradesh'],
                unsuitable_states: ['kerala', 'west bengal', 'assam']
            },
            'vegetables': {
                tomato: {
                    ideal_conditions: {
                        rainfall: '600-1000mm',
                        temperature: '18-27°C',
                        soil_type: ['well_drained_loam'],
                        water_requirement: 'moderate',
                        growing_season: 'rabi_summer'
                    },
                    suitable_states: ['karnataka', 'andhra pradesh', 'maharashtra', 'odisha'],
                    marginal_states: ['punjab', 'haryana', 'uttar pradesh'],
                    unsuitable_states: ['rajasthan_desert', 'assam_flood_prone']
                },
                onion: {
                    ideal_conditions: {
                        rainfall: '600-1000mm',
                        temperature: '15-25°C',
                        soil_type: ['well_drained_sandy_loam'],
                        water_requirement: 'moderate',
                        growing_season: 'rabi'
                    },
                    suitable_states: ['maharashtra', 'karnataka', 'gujarat', 'andhra pradesh'],
                    marginal_states: ['rajasthan', 'madhya pradesh'],
                    unsuitable_states: ['assam', 'himachal pradesh']
                }
            }
        };
    }

    /**
     * Load agroclimatic zones
     */
    loadAgroclimaticZones() {
        return {
            'zone_1_cold_arid': {
                states: ['jammu kashmir', 'himachal pradesh', 'uttarakhand'],
                characteristics: 'Cold, low rainfall, high altitude',
                suitable_crops: ['apple', 'barley', 'peas', 'potato'],
                challenges: ['frost', 'short_season', 'transportation']
            },
            'zone_2_hot_arid': {
                states: ['rajasthan', 'gujarat'],
                characteristics: 'Hot, very low rainfall, sandy soil',
                suitable_crops: ['bajra', 'jowar', 'guar', 'desert_beans'],
                challenges: ['extreme_heat', 'water_scarcity', 'sand_storms']
            },
            'zone_3_semi_arid': {
                states: ['punjab', 'haryana', 'western_uttar_pradesh'],
                characteristics: 'Moderate rainfall, extreme temperatures',
                suitable_crops: ['wheat', 'rice', 'cotton', 'mustard'],
                challenges: ['groundwater_depletion', 'salinity']
            },
            'zone_4_humid_subtropical': {
                states: ['eastern_uttar_pradesh', 'bihar', 'west_bengal'],
                characteristics: 'High rainfall, humid, fertile soil',
                suitable_crops: ['rice', 'jute', 'wheat', 'vegetables'],
                challenges: ['waterlogging', 'disease_pressure']
            },
            'zone_5_coastal': {
                states: ['kerala', 'karnataka_coast', 'goa'],
                characteristics: 'High rainfall, humid, laterite soil',
                suitable_crops: ['coconut', 'rice', 'spices', 'cashew'],
                challenges: ['cyclones', 'soil_acidity', 'pest_pressure']
            }
        };
    }

    /**
     * Load unusual crop-location combinations that need special handling
     */
    loadUnusualCombinations() {
        return {
            'rice_in_desert': {
                combinations: ['rice + rajasthan', 'rice + thar desert', 'paddy + arid'],
                feasibility: 'not_recommended',
                reasons: ['Extremely high water requirement', 'Unsuitable climate', 'Economic unfeasibility'],
                alternatives: ['Bajra', 'Jowar', 'Guar', 'Desert beans'],
                exception_cases: ['With drip irrigation and saline water treatment (experimental only)']
            },
            'sugarcane_in_arid': {
                combinations: ['sugarcane + rajasthan', 'sugarcane + desert', 'sugarcane + low water'],
                feasibility: 'highly_challenging',
                reasons: ['Very high water requirement (2500mm)', 'Low profitability', 'Environmental concerns'],
                alternatives: ['Sweet sorghum', 'Sugar beet (winter)', 'Stevia'],
                exception_cases: ['Micro-irrigation with adequate water source']
            },
            'wheat_in_humid_tropics': {
                combinations: ['wheat + kerala', 'wheat + coastal areas', 'wheat + high humidity'],
                feasibility: 'challenging',
                reasons: ['High humidity promotes diseases', 'Lack of winter chill', 'Poor grain quality'],
                alternatives: ['Rice', 'Maize', 'Millets'],
                exception_cases: ['Hill areas with cooler temperatures']
            },
            'cotton_in_high_altitude': {
                combinations: ['cotton + hills', 'cotton + cold areas', 'cotton + himachal'],
                feasibility: 'not_suitable',
                reasons: ['Requires long warm season', 'Frost damage', 'Poor fiber development'],
                alternatives: ['Wool production', 'Temperate fruits', 'Vegetables'],
                exception_cases: ['None - completely unsuitable']
            }
        };
    }

    /**
     * Analyze query for location and crop information
     */
    analyzeQuery(query) {
        const analysis = {
            crop: null,
            location: null,
            season: null,
            specific_issue: null,
            unusual_combination: false,
            confidence: 0
        };

        const queryLower = query.toLowerCase();

        // Extract crop information
        const crops = ['rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'bajra', 'jowar', 'tomato', 'onion', 'potato'];
        for (const crop of crops) {
            if (queryLower.includes(crop) || queryLower.includes(crop + 's')) {
                analysis.crop = crop;
                analysis.confidence += 0.3;
                break;
            }
        }

        // Extract location information
        const states = Object.keys(this.locationData.states);
        for (const state of states) {
            if (queryLower.includes(state) || queryLower.includes(state.replace(' ', ''))) {
                analysis.location = state;
                analysis.confidence += 0.3;
                break;
            }
        }

        // Extract season information
        const seasons = ['kharif', 'rabi', 'summer', 'monsoon', 'winter'];
        for (const season of seasons) {
            if (queryLower.includes(season)) {
                analysis.season = season;
                analysis.confidence += 0.2;
                break;
            }
        }

        // Check for unusual combinations
        if (analysis.crop && analysis.location) {
            analysis.unusual_combination = this.checkUnusualCombination(analysis.crop, analysis.location);
            if (analysis.unusual_combination) {
                analysis.confidence += 0.2;
            }
        }

        return analysis;
    }

    /**
     * Check if crop-location combination is unusual
     */
    checkUnusualCombination(crop, location) {
        for (const [key, combination] of Object.entries(this.unusualCombinations)) {
            for (const combo of combination.combinations) {
                if (combo.includes(crop) && combo.includes(location)) {
                    return key;
                }
            }
        }
        return false;
    }

    /**
     * Generate location-specific adaptation advice
     */
    generateLocationAdaptation(crop, location, season = null) {
        const locationData = this.locationData.states[location];
        if (!locationData) {
            return this.generateGenericAdvice(crop);
        }

        let adaptation = `\n### 🌍 Location-Specific Adaptations for ${location.toUpperCase()}\n\n`;

        // Climate adaptation
        adaptation += `**Climate Considerations for ${locationData.climate} climate:**\n`;
        adaptation += `- Rainfall: ${locationData.rainfall} (plan irrigation accordingly)\n`;
        adaptation += `- Temperature: Winter ${locationData.temperature.winter}, Summer ${locationData.temperature.summer}\n`;
        adaptation += `- Soil types: ${locationData.soil_types.join(', ')}\n\n`;

        // Specific adaptations based on location challenges
        adaptation += `**Local Challenges and Solutions:**\n`;
        locationData.challenges.forEach((challenge, index) => {
            adaptation += `${index + 1}. **${challenge.replace('_', ' ').toUpperCase()}**: ${this.getSolutionForChallenge(challenge, crop)}\n`;
        });

        // Cropping pattern recommendation
        adaptation += `\n**Recommended Cropping Pattern:** ${locationData.cropping_pattern}\n`;
        adaptation += `**Dominant Irrigation Method:** ${locationData.irrigation.replace('_', ' + ')}\n\n`;

        return adaptation;
    }

    /**
     * Generate advice for unusual crop-location combinations
     */
    generateUnusualCombinationAdvice(crop, location) {
        const combinationKey = this.checkUnusualCombination(crop, location);
        if (!combinationKey) {
            return '';
        }

        const combination = this.unusualCombinations[combinationKey];
        
        let advice = `\n## ⚠️ Important Advisory: Unusual Crop-Location Combination\n\n`;
        advice += `**Status**: ${combination.feasibility.replace('_', ' ').toUpperCase()}\n\n`;

        advice += `**Why ${crop} cultivation in ${location} is challenging:**\n`;
        combination.reasons.forEach((reason, index) => {
            advice += `${index + 1}. ${reason}\n`;
        });

        advice += `\n**Recommended Alternatives:**\n`;
        combination.alternatives.forEach((alt, index) => {
            advice += `${index + 1}. **${alt}**: Much better suited for local conditions\n`;
        });

        if (combination.exception_cases.length > 0 && combination.exception_cases[0] !== 'None - completely unsuitable') {
            advice += `\n**Possible Exception Cases:**\n`;
            combination.exception_cases.forEach((exception, index) => {
                advice += `${index + 1}. ${exception}\n`;
            });
        }

        advice += `\n**Recommendation**: Consider switching to recommended alternatives for better success and profitability.\n\n`;

        return advice;
    }

    /**
     * Get solution for specific location challenge
     */
    getSolutionForChallenge(challenge, crop) {
        const solutions = {
            'water_depletion': `Use drip irrigation for ${crop}, practice water conservation techniques, rainwater harvesting`,
            'soil_degradation': `Add organic matter, balanced fertilization, crop rotation including legumes`,
            'stubble_burning': `Use crop residue management techniques, happy seeder for direct sowing`,
            'groundwater_depletion': `Shift to less water-intensive crops, improve irrigation efficiency`,
            'salinity': `Use salt-tolerant varieties, gypsum application, improved drainage`,
            'heat_stress': `Choose heat-tolerant varieties, provide shade during critical growth stages`,
            'water_scarcity': `Drought-tolerant varieties, mulching, efficient irrigation scheduling`,
            'sand_storms': `Wind barriers, soil binding crops, protective structures`,
            'extreme_heat': `Heat-tolerant varieties, protective irrigation, shade management`,
            'waterlogging': `Improved drainage, raised bed cultivation, waterlogging-tolerant varieties`,
            'pest_pressure': `IPM practices, resistant varieties, biological control agents`,
            'fragmented_holdings': `Cooperative farming, contract farming, shared machinery`,
            'flooding': `Flood-tolerant varieties, improved drainage, early warning systems`,
            'drainage': `Subsurface drainage, raised beds, proper field leveling`,
            'soil_fertility': `Soil testing, balanced nutrition, organic matter addition`,
            'cyclones': `Wind-resistant varieties, protective structures, crop insurance`,
            'high_humidity': `Proper ventilation, disease-resistant varieties, fungicide scheduling`,
            'pest_disease': `Regular monitoring, preventive sprays, resistant varieties`,
            'erratic_rainfall': `Drought-tolerant varieties, rainwater harvesting, crop insurance`,
            'drought': `Drought management practices, deficit irrigation, drought-tolerant crops`,
            'pest_resistance': `Integrated pest management, rotation of chemicals, biocontrol`,
            'climate_variability': `Climate-resilient varieties, diversified cropping, weather-based advisories`
        };

        return solutions[challenge] || 'Consult local agricultural extension services for specific solutions';
    }

    /**
     * Generate generic advice when location is not specified
     */
    generateGenericAdvice(crop) {
        return `\n### 🌍 Regional Adaptation Guidelines\n\n` +
               `Since specific location wasn't mentioned, here are general regional adaptations for ${crop}:\n\n` +
               `**For different regions:**\n` +
               `- **Northern Plains**: Focus on timely sowing and water management\n` +
               `- **Southern States**: Emphasize heat tolerance and pest management\n` +
               `- **Western Regions**: Priority on drought tolerance and water conservation\n` +
               `- **Eastern Areas**: Focus on drainage and disease management\n` +
               `- **Coastal Zones**: Emphasize cyclone preparedness and salinity management\n\n` +
               `**General Recommendation**: Specify your location for more targeted advice.\n\n`;
    }

    /**
     * Validate crop suitability for location
     */
    validateCropLocation(crop, location) {
        const suitability = this.cropSuitability[crop];
        if (!suitability) {
            return {
                status: 'unknown',
                message: 'Crop data not available for detailed analysis'
            };
        }

        if (suitability.suitable_states.includes(location)) {
            return {
                status: 'excellent',
                message: `${crop} is well-suited for ${location} with ideal growing conditions`
            };
        }

        if (suitability.marginal_states.includes(location)) {
            return {
                status: 'marginal',
                message: `${crop} can be grown in ${location} but with additional care and possibly lower yields`
            };
        }

        if (suitability.unsuitable_states.some(state => state.includes(location))) {
            return {
                status: 'unsuitable',
                message: `${crop} is not recommended for ${location} due to unfavorable conditions`
            };
        }

        return {
            status: 'uncertain',
            message: `Limited data available for ${crop} in ${location}. Consult local experts`
        };
    }
}

module.exports = LocationCropAdaptation;