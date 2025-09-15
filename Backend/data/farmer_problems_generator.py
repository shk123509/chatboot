#!/usr/bin/env python3
"""
Farmer Problems and Solutions Generator
Generates 3000+ comprehensive farming problems with solutions
"""

import json
import random
from datetime import datetime

# Categories of farming problems
CATEGORIES = {
    "crop_diseases": [
        "Fungal infections in {crop}",
        "Bacterial diseases affecting {crop}",
        "Viral diseases in {crop} plants",
        "Root rot in {crop}",
        "Leaf spot disease in {crop}",
        "Powdery mildew on {crop}",
        "Rust disease in {crop}",
        "Blight affecting {crop}",
        "Wilt disease in {crop}",
        "Mosaic virus in {crop}"
    ],
    
    "pest_control": [
        "Aphid infestation on {crop}",
        "Whitefly attack on {crop}",
        "Caterpillar damage to {crop}",
        "Thrips infestation in {crop}",
        "Spider mite problem in {crop}",
        "Bollworm attack on {crop}",
        "Stem borer in {crop}",
        "Cutworm damage to {crop}",
        "Armyworm infestation in {crop}",
        "Scale insect problem on {crop}"
    ],
    
    "soil_issues": [
        "Soil acidity affecting {crop} growth",
        "Alkaline soil problems for {crop}",
        "Soil compaction in {crop} fields",
        "Poor drainage in {crop} cultivation",
        "Soil erosion in {crop} farms",
        "Nutrient deficiency in {crop} soil",
        "Salinity problems in {crop} fields",
        "Low organic matter in {crop} soil",
        "Soil contamination affecting {crop}",
        "Hard pan formation in {crop} fields"
    ],
    
    "weather_problems": [
        "Drought stress affecting {crop}",
        "Excessive rainfall damaging {crop}",
        "Frost damage to {crop}",
        "Heat stress in {crop}",
        "Hail damage to {crop}",
        "Wind damage affecting {crop}",
        "Flooding in {crop} fields",
        "Cyclone damage to {crop}",
        "Unseasonal rain affecting {crop}",
        "Temperature fluctuation damaging {crop}"
    ],
    
    "irrigation_problems": [
        "Water scarcity for {crop} irrigation",
        "Poor irrigation scheduling for {crop}",
        "Waterlogging in {crop} fields",
        "Irrigation system clogging in {crop} farms",
        "Uneven water distribution in {crop}",
        "High water table affecting {crop}",
        "Saline water irrigation problems for {crop}",
        "Drip irrigation failure in {crop}",
        "Sprinkler system issues in {crop}",
        "Canal irrigation problems for {crop}"
    ],
    
    "livestock_issues": [
        "Cattle disease affecting farm productivity",
        "Poultry disease outbreak",
        "Goat health problems on farm",
        "Buffalo reproductive issues",
        "Pig disease management",
        "Sheep parasitic infections",
        "Dairy cattle mastitis problem",
        "Poultry egg production decline",
        "Livestock feed shortage",
        "Animal vaccination issues"
    ],
    
    "market_economic": [
        "Low market price for {crop}",
        "Lack of market access for {crop}",
        "Post-harvest losses in {crop}",
        "Storage problems for {crop}",
        "Transportation issues for {crop}",
        "Quality standards not met for {crop}",
        "Middleman exploitation in {crop} sales",
        "Lack of processing facilities for {crop}",
        "Export quality issues in {crop}",
        "Contract farming problems with {crop}"
    ],
    
    "seed_planting": [
        "Poor seed germination in {crop}",
        "Low quality seeds for {crop}",
        "Wrong planting time for {crop}",
        "Incorrect seed spacing in {crop}",
        "Seed treatment issues for {crop}",
        "Hybrid seed problems in {crop}",
        "Seed storage issues affecting {crop}",
        "Contaminated seeds in {crop}",
        "Wrong variety selection for {crop}",
        "Seed certification problems for {crop}"
    ]
}

# Solutions database
SOLUTIONS = {
    "crop_diseases": [
        "Apply appropriate fungicides and ensure good air circulation",
        "Use disease-resistant varieties and crop rotation",
        "Implement integrated disease management practices",
        "Improve drainage and avoid overwatering",
        "Use organic fungicides like neem oil or copper-based sprays",
        "Remove infected plant parts and burn them safely",
        "Apply preventive sprays during vulnerable growth stages",
        "Maintain proper plant spacing for air circulation",
        "Use biocontrol agents and beneficial microorganisms",
        "Follow proper sanitation and field hygiene practices"
    ],
    
    "pest_control": [
        "Use integrated pest management combining biological and chemical control",
        "Apply neem-based organic pesticides and beneficial insects",
        "Install pheromone traps and sticky traps for monitoring",
        "Practice crop rotation to break pest life cycles",
        "Use resistant varieties and companion planting",
        "Apply targeted pesticides during pest vulnerable stages",
        "Maintain field sanitation and remove crop residues",
        "Use botanical extracts and bio-pesticides",
        "Encourage natural predators and parasites",
        "Monitor regularly and take early action"
    ],
    
    "soil_issues": [
        "Apply lime to reduce soil acidity and improve pH",
        "Add organic matter like compost and farmyard manure",
        "Implement controlled traffic farming to reduce compaction",
        "Create drainage channels and raised beds",
        "Use cover crops to prevent erosion and improve soil structure",
        "Apply balanced fertilizers based on soil test results",
        "Leach saline soils with good quality water",
        "Practice minimum tillage and use green manures",
        "Remediate contaminated soil using appropriate techniques",
        "Break hard pans through deep plowing or subsoiling"
    ],
    
    "weather_problems": [
        "Implement water conservation and drought-tolerant varieties",
        "Create proper drainage systems and raised beds",
        "Use frost protection methods like smoking or sprinklers",
        "Provide shade nets and mulching for heat protection",
        "Install hail nets and protective structures",
        "Create windbreaks and use resistant varieties",
        "Build flood control measures and early warning systems",
        "Develop cyclone-resistant infrastructure and crop insurance",
        "Adjust planting schedules based on weather forecasts",
        "Use climate-resilient varieties and practices"
    ],
    
    "irrigation_problems": [
        "Implement water harvesting and efficient irrigation systems",
        "Use soil moisture sensors and irrigation scheduling tools",
        "Install drainage systems and control water application",
        "Clean and maintain irrigation systems regularly",
        "Level fields and use precision irrigation methods",
        "Install subsurface drainage systems",
        "Treat saline water or find alternative sources",
        "Check and repair drip system components",
        "Maintain proper pressure and clean sprinkler heads",
        "Improve canal maintenance and water distribution"
    ],
    
    "livestock_issues": [
        "Implement proper vaccination schedules and veterinary care",
        "Maintain biosecurity and quarantine measures",
        "Provide balanced nutrition and clean water",
        "Use artificial insemination and breeding management",
        "Follow disease prevention and treatment protocols",
        "Control parasites through regular deworming",
        "Practice proper milking hygiene and mastitis prevention",
        "Optimize housing conditions and environmental management",
        "Ensure adequate feed supply and nutritional balance",
        "Maintain vaccination records and health monitoring"
    ],
    
    "market_economic": [
        "Join farmer producer organizations and cooperatives",
        "Develop direct marketing channels and value addition",
        "Improve post-harvest handling and storage facilities",
        "Use proper packaging and grading systems",
        "Develop cold storage and transportation networks",
        "Obtain quality certifications and follow standards",
        "Eliminate middlemen through direct sales platforms",
        "Establish processing units and value-added products",
        "Meet export requirements and international standards",
        "Use contract farming with proper agreements"
    ],
    
    "seed_planting": [
        "Use certified seeds and proper seed treatment",
        "Test seed viability before planting",
        "Follow recommended planting calendar and timing",
        "Maintain proper row and plant spacing",
        "Use appropriate seed treatment chemicals",
        "Select suitable hybrid varieties for local conditions",
        "Store seeds in dry, cool, and pest-free conditions",
        "Source seeds from certified dealers only",
        "Choose varieties suited to local climate and soil",
        "Ensure seed certification and quality parameters"
    ]
}

# Crop types
CROPS = [
    "rice", "wheat", "maize", "sugarcane", "cotton", "soybean", "groundnut", 
    "sunflower", "mustard", "sesame", "pearl millet", "sorghum", "barley",
    "chickpea", "pigeon pea", "black gram", "green gram", "lentil", "field pea",
    "potato", "onion", "tomato", "chili", "brinjal", "okra", "cucumber",
    "watermelon", "muskmelon", "pumpkin", "bottle gourd", "bitter gourd",
    "cabbage", "cauliflower", "carrot", "radish", "beetroot", "turnip",
    "spinach", "fenugreek", "coriander", "mint", "curry leaves",
    "mango", "banana", "papaya", "guava", "citrus", "coconut", "areca nut",
    "cashew", "pepper", "cardamom", "turmeric", "ginger", "garlic"
]

def generate_problems_and_solutions():
    """Generate comprehensive list of farmer problems and solutions"""
    problems_solutions = []
    problem_id = 1
    
    # Generate problems for each category and crop combination
    for category, problem_templates in CATEGORIES.items():
        for problem_template in problem_templates:
            for crop in CROPS:
                # Generate multiple variations for each crop-problem combination
                for i in range(2):  # 2 variations per combination
                    problem = problem_template.format(crop=crop)
                    solution = random.choice(SOLUTIONS[category])
                    
                    # Add specific crop information to solution
                    if "{crop}" in solution:
                        solution = solution.replace("{crop}", crop)
                    
                    # Create problem-solution pair
                    pair = {
                        "id": problem_id,
                        "category": category,
                        "crop": crop,
                        "problem": f"Problem {problem_id}: {problem}?",
                        "solution": f"Solution: {solution}.",
                        "severity": random.choice(["low", "medium", "high"]),
                        "season": random.choice(["kharif", "rabi", "zaid", "perennial"]),
                        "region": random.choice(["north", "south", "east", "west", "central"]),
                        "created_date": datetime.now().isoformat()
                    }
                    
                    problems_solutions.append(pair)
                    problem_id += 1
    
    # Add the original 50 problems from your list
    original_problems = [
        ("Problem 1: Crop not growing?", "Solution: Test soil, ensure proper irrigation, use organic pesticides."),
        ("Problem 2: Weather issues?", "Solution: Check local weather forecasts and protect crops accordingly."),
        ("Problem 3: Leaves yellowing?", "Solution: Use nitrogen-rich fertilizer."),
        ("Problem 4: Soil dry?", "Solution: Implement drip irrigation."),
        ("Problem 5: Pest attacks?", "Solution: Use neem oil or eco-friendly pesticides."),
        ("Problem 6: Low crop yield?", "Solution: Use certified seeds and organic manure."),
        ("Problem 7: Heavy rains?", "Solution: Ensure proper drainage and protect seedlings."),
        ("Problem 8: Heat stress?", "Solution: Mulching helps retain soil moisture."),
        ("Problem 9: Poor soil fertility?", "Solution: Crop rotation and add compost."),
        ("Problem 10: Seeds not germinating?", "Solution: Use certified seeds and proper sowing depth."),
        ("Problem 11: Fungal disease on crops?", "Solution: Apply appropriate fungicides and improve air circulation."),
        ("Problem 12: Flooding in fields?", "Solution: Build raised beds or drainage canals."),
        ("Problem 13: Lack of labor?", "Solution: Use mechanized tools or community labor sharing."),
        ("Problem 14: Drought conditions?", "Solution: Harvest rainwater and implement water-saving irrigation."),
        ("Problem 15: Soil erosion?", "Solution: Plant cover crops and build terraces on slopes."),
        ("Problem 16: Salinity in soil?", "Solution: Leach soil with fresh water and use salt-tolerant crops."),
        ("Problem 17: Weeds overgrowing?", "Solution: Manual weeding, mulching, or herbicide application."),
        ("Problem 18: Market price drop?", "Solution: Join cooperatives or direct-to-consumer sales."),
        ("Problem 19: Crop damage by birds?", "Solution: Use scarecrows, nets, or reflective tape."),
        ("Problem 20: Overfertilization?", "Solution: Test soil and use balanced nutrient management."),
        ("Problem 21: Pests resistant to chemicals?", "Solution: Rotate pesticides and use integrated pest management."),
        ("Problem 22: Lack of access to quality seeds?", "Solution: Buy certified seeds or government-supported programs."),
        ("Problem 23: Livestock damaging crops?", "Solution: Build fencing or rotational grazing systems."),
        ("Problem 24: Soil compaction?", "Solution: Use reduced tillage and organic matter to loosen soil."),
        ("Problem 25: Crop lodging (falling over)?", "Solution: Use support stakes and plant resistant varieties."),
        ("Problem 26: Cold/frost damage?", "Solution: Cover plants or use frost-resistant crops."),
        ("Problem 27: Water contamination?", "Solution: Use safe water sources and test for chemicals."),
        ("Problem 28: Inadequate storage?", "Solution: Build silos, warehouses, or use cold storage facilities."),
        ("Problem 29: Infestation by locusts?", "Solution: Early warning, traps, and coordinated pesticide use."),
        ("Problem 30: Soil nutrient imbalance?", "Solution: Conduct soil testing and apply fertilizers accordingly."),
        ("Problem 31: Unpredictable monsoon?", "Solution: Diversify crops and use drought-tolerant varieties."),
        ("Problem 32: Crop theft?", "Solution: Secure fields and use community watch."),
        ("Problem 33: High cost of machinery?", "Solution: Rent or share machinery cooperatively."),
        ("Problem 34: Salinity intrusion in coastal farms?", "Solution: Use raised beds and salt-tolerant crops."),
        ("Problem 35: Poor pollination?", "Solution: Plant flowering plants to attract bees or hand pollinate."),
        ("Problem 36: Excessive rainfall?", "Solution: Build drainage and raised planting beds."),
        ("Problem 37: Crop nutrient deficiency?", "Solution: Apply micronutrients and foliar sprays."),
        ("Problem 38: Low organic matter in soil?", "Solution: Add compost, green manure, and cover crops."),
        ("Problem 39: Infestation by rodents?", "Solution: Traps, safe rodenticides, and field hygiene."),
        ("Problem 40: Weed resistance to herbicides?", "Solution: Rotate herbicides and use mechanical weeding."),
        ("Problem 41: Poor irrigation scheduling?", "Solution: Use soil moisture sensors or irrigation calculators."),
        ("Problem 42: Excessive pesticide use?", "Solution: Integrated pest management and natural predators."),
        ("Problem 43: Crop diseases due to humidity?", "Solution: Improve ventilation and spacing."),
        ("Problem 44: Poor seed germination due to old seeds?", "Solution: Use fresh, certified seeds and pre-treat them."),
        ("Problem 45: Livestock disease affecting productivity?", "Solution: Vaccinate animals and maintain hygiene."),
        ("Problem 46: Soil acidity?", "Solution: Apply lime and grow acid-tolerant crops."),
        ("Problem 47: Deforestation affecting microclimate?", "Solution: Plant trees around fields and agroforestry."),
        ("Problem 48: Poor access to market info?", "Solution: Use mobile apps, local co-ops, or extension services."),
        ("Problem 49: Excess heat and sun scorch?", "Solution: Shade nets and mulching."),
        ("Problem 50: Contamination of produce?", "Solution: Follow hygiene protocols, wash before storage or sale.")
    ]
    
    # Add original problems to the dataset
    for i, (problem, solution) in enumerate(original_problems, 1):
        pair = {
            "id": problem_id,
            "category": "general",
            "crop": "general",
            "problem": problem,
            "solution": solution,
            "severity": "medium",
            "season": "all",
            "region": "all",
            "created_date": datetime.now().isoformat(),
            "original": True
        }
        problems_solutions.append(pair)
        problem_id += 1
    
    return problems_solutions

def save_to_file(data, filename):
    """Save data to JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    print("🌾 Generating comprehensive farmer problems and solutions dataset...")
    
    # Generate problems and solutions
    problems_data = generate_problems_and_solutions()
    
    print(f"✅ Generated {len(problems_data)} problem-solution pairs")
    
    # Save to file
    save_to_file(problems_data, "farmer_problems_dataset.json")
    
    # Generate summary statistics
    categories = {}
    crops = {}
    
    for item in problems_data:
        category = item['category']
        crop = item['crop']
        
        categories[category] = categories.get(category, 0) + 1
        crops[crop] = crops.get(crop, 0) + 1
    
    print("\n📊 Dataset Statistics:")
    print(f"Total Problems: {len(problems_data)}")
    print(f"Categories: {len(categories)}")
    print(f"Crops Covered: {len(crops)}")
    
    print("\n🗂️ Category Distribution:")
    for category, count in sorted(categories.items()):
        print(f"  {category}: {count} problems")
    
    print("\n🌱 Top 10 Crops by Problem Count:")
    top_crops = sorted(crops.items(), key=lambda x: x[1], reverse=True)[:10]
    for crop, count in top_crops:
        print(f"  {crop}: {count} problems")
    
    print(f"\n💾 Dataset saved to: farmer_problems_dataset.json")
    print("🎉 Farmer problems dataset generation completed!")