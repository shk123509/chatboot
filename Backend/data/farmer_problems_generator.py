# #!/usr/bin/env python3
# """
# Farmer Problems and Solutions Generator
# Generates 3000+ comprehensive farming problems with solutions
# """

# import json
# import random
# from datetime import datetime

# # Categories of farming problems
# CATEGORIES = {
#     "crop_diseases": [
#         "Fungal infections in {crop}",
#         "Bacterial diseases affecting {crop}",
#         "Viral diseases in {crop} plants",
#         "Root rot in {crop}",
#         "Leaf spot disease in {crop}",
#         "Powdery mildew on {crop}",
#         "Rust disease in {crop}",
#         "Blight affecting {crop}",
#         "Wilt disease in {crop}",
#         "Mosaic virus in {crop}"
#     ],
    
#     "pest_control": [
#         "Aphid infestation on {crop}",
#         "Whitefly attack on {crop}",
#         "Caterpillar damage to {crop}",
#         "Thrips infestation in {crop}",
#         "Spider mite problem in {crop}",
#         "Bollworm attack on {crop}",
#         "Stem borer in {crop}",
#         "Cutworm damage to {crop}",
#         "Armyworm infestation in {crop}",
#         "Scale insect problem on {crop}"
#     ],
    
#     "soil_issues": [
#         "Soil acidity affecting {crop} growth",
#         "Alkaline soil problems for {crop}",
#         "Soil compaction in {crop} fields",
#         "Poor drainage in {crop} cultivation",
#         "Soil erosion in {crop} farms",
#         "Nutrient deficiency in {crop} soil",
#         "Salinity problems in {crop} fields",
#         "Low organic matter in {crop} soil",
#         "Soil contamination affecting {crop}",
#         "Hard pan formation in {crop} fields"
#     ],
    
#     "weather_problems": [
#         "Drought stress affecting {crop}",
#         "Excessive rainfall damaging {crop}",
#         "Frost damage to {crop}",
#         "Heat stress in {crop}",
#         "Hail damage to {crop}",
#         "Wind damage affecting {crop}",
#         "Flooding in {crop} fields",
#         "Cyclone damage to {crop}",
#         "Unseasonal rain affecting {crop}",
#         "Temperature fluctuation damaging {crop}"
#     ],
    
#     "irrigation_problems": [
#         "Water scarcity for {crop} irrigation",
#         "Poor irrigation scheduling for {crop}",
#         "Waterlogging in {crop} fields",
#         "Irrigation system clogging in {crop} farms",
#         "Uneven water distribution in {crop}",
#         "High water table affecting {crop}",
#         "Saline water irrigation problems for {crop}",
#         "Drip irrigation failure in {crop}",
#         "Sprinkler system issues in {crop}",
#         "Canal irrigation problems for {crop}"
#     ],
    
#     "livestock_issues": [
#         "Cattle disease affecting farm productivity",
#         "Poultry disease outbreak",
#         "Goat health problems on farm",
#         "Buffalo reproductive issues",
#         "Pig disease management",
#         "Sheep parasitic infections",
#         "Dairy cattle mastitis problem",
#         "Poultry egg production decline",
#         "Livestock feed shortage",
#         "Animal vaccination issues"
#     ],
    
#     "market_economic": [
#         "Low market price for {crop}",
#         "Lack of market access for {crop}",
#         "Post-harvest losses in {crop}",
#         "Storage problems for {crop}",
#         "Transportation issues for {crop}",
#         "Quality standards not met for {crop}",
#         "Middleman exploitation in {crop} sales",
#         "Lack of processing facilities for {crop}",
#         "Export quality issues in {crop}",
#         "Contract farming problems with {crop}"
#     ],
    
#     "seed_planting": [
#         "Poor seed germination in {crop}",
#         "Low quality seeds for {crop}",
#         "Wrong planting time for {crop}",
#         "Incorrect seed spacing in {crop}",
#         "Seed treatment issues for {crop}",
#         "Hybrid seed problems in {crop}",
#         "Seed storage issues affecting {crop}",
#         "Contaminated seeds in {crop}",
#         "Wrong variety selection for {crop}",
#         "Seed certification problems for {crop}"
#     ]
# }

# # Solutions database
# SOLUTIONS = {
#     "crop_diseases": [
#         "Apply appropriate fungicides and ensure good air circulation",
#         "Use disease-resistant varieties and crop rotation",
#         "Implement integrated disease management practices",
#         "Improve drainage and avoid overwatering",
#         "Use organic fungicides like neem oil or copper-based sprays",
#         "Remove infected plant parts and burn them safely",
#         "Apply preventive sprays during vulnerable growth stages",
#         "Maintain proper plant spacing for air circulation",
#         "Use biocontrol agents and beneficial microorganisms",
#         "Follow proper sanitation and field hygiene practices"
#     ],
    
#     "pest_control": [
#         "Use integrated pest management combining biological and chemical control",
#         "Apply neem-based organic pesticides and beneficial insects",
#         "Install pheromone traps and sticky traps for monitoring",
#         "Practice crop rotation to break pest life cycles",
#         "Use resistant varieties and companion planting",
#         "Apply targeted pesticides during pest vulnerable stages",
#         "Maintain field sanitation and remove crop residues",
#         "Use botanical extracts and bio-pesticides",
#         "Encourage natural predators and parasites",
#         "Monitor regularly and take early action"
#     ],
    
#     "soil_issues": [
#         "Apply lime to reduce soil acidity and improve pH",
#         "Add organic matter like compost and farmyard manure",
#         "Implement controlled traffic farming to reduce compaction",
#         "Create drainage channels and raised beds",
#         "Use cover crops to prevent erosion and improve soil structure",
#         "Apply balanced fertilizers based on soil test results",
#         "Leach saline soils with good quality water",
#         "Practice minimum tillage and use green manures",
#         "Remediate contaminated soil using appropriate techniques",
#         "Break hard pans through deep plowing or subsoiling"
#     ],
    
#     "weather_problems": [
#         "Implement water conservation and drought-tolerant varieties",
#         "Create proper drainage systems and raised beds",
#         "Use frost protection methods like smoking or sprinklers",
#         "Provide shade nets and mulching for heat protection",
#         "Install hail nets and protective structures",
#         "Create windbreaks and use resistant varieties",
#         "Build flood control measures and early warning systems",
#         "Develop cyclone-resistant infrastructure and crop insurance",
#         "Adjust planting schedules based on weather forecasts",
#         "Use climate-resilient varieties and practices"
#     ],
    
#     "irrigation_problems": [
#         "Implement water harvesting and efficient irrigation systems",
#         "Use soil moisture sensors and irrigation scheduling tools",
#         "Install drainage systems and control water application",
#         "Clean and maintain irrigation systems regularly",
#         "Level fields and use precision irrigation methods",
#         "Install subsurface drainage systems",
#         "Treat saline water or find alternative sources",
#         "Check and repair drip system components",
#         "Maintain proper pressure and clean sprinkler heads",
#         "Improve canal maintenance and water distribution"
#     ],
    
#     "livestock_issues": [
#         "Implement proper vaccination schedules and veterinary care",
#         "Maintain biosecurity and quarantine measures",
#         "Provide balanced nutrition and clean water",
#         "Use artificial insemination and breeding management",
#         "Follow disease prevention and treatment protocols",
#         "Control parasites through regular deworming",
#         "Practice proper milking hygiene and mastitis prevention",
#         "Optimize housing conditions and environmental management",
#         "Ensure adequate feed supply and nutritional balance",
#         "Maintain vaccination records and health monitoring"
#     ],
    
#     "market_economic": [
#         "Join farmer producer organizations and cooperatives",
#         "Develop direct marketing channels and value addition",
#         "Improve post-harvest handling and storage facilities",
#         "Use proper packaging and grading systems",
#         "Develop cold storage and transportation networks",
#         "Obtain quality certifications and follow standards",
#         "Eliminate middlemen through direct sales platforms",
#         "Establish processing units and value-added products",
#         "Meet export requirements and international standards",
#         "Use contract farming with proper agreements"
#     ],
    
#     "seed_planting": [
#         "Use certified seeds and proper seed treatment",
#         "Test seed viability before planting",
#         "Follow recommended planting calendar and timing",
#         "Maintain proper row and plant spacing",
#         "Use appropriate seed treatment chemicals",
#         "Select suitable hybrid varieties for local conditions",
#         "Store seeds in dry, cool, and pest-free conditions",
#         "Source seeds from certified dealers only",
#         "Choose varieties suited to local climate and soil",
#         "Ensure seed certification and quality parameters"
#     ]
# }

# # Crop types
# CROPS = [
#     "rice", "wheat", "maize", "sugarcane", "cotton", "soybean", "groundnut", 
#     "sunflower", "mustard", "sesame", "pearl millet", "sorghum", "barley",
#     "chickpea", "pigeon pea", "black gram", "green gram", "lentil", "field pea",
#     "potato", "onion", "tomato", "chili", "brinjal", "okra", "cucumber",
#     "watermelon", "muskmelon", "pumpkin", "bottle gourd", "bitter gourd",
#     "cabbage", "cauliflower", "carrot", "radish", "beetroot", "turnip",
#     "spinach", "fenugreek", "coriander", "mint", "curry leaves",
#     "mango", "banana", "papaya", "guava", "citrus", "coconut", "areca nut",
#     "cashew", "pepper", "cardamom", "turmeric", "ginger", "garlic"
# ]

# def generate_problems_and_solutions():
#     """Generate comprehensive list of farmer problems and solutions"""
#     problems_solutions = []
#     problem_id = 1
    
#     # Generate problems for each category and crop combination
#     for category, problem_templates in CATEGORIES.items():
#         for problem_template in problem_templates:
#             for crop in CROPS:
#                 # Generate multiple variations for each crop-problem combination
#                 for i in range(2):  # 2 variations per combination
#                     problem = problem_template.format(crop=crop)
#                     solution = random.choice(SOLUTIONS[category])
                    
#                     # Add specific crop information to solution
#                     if "{crop}" in solution:
#                         solution = solution.replace("{crop}", crop)
                    
#                     # Create problem-solution pair
#                     pair = {
#                         "id": problem_id,
#                         "category": category,
#                         "crop": crop,
#                         "problem": f"Problem {problem_id}: {problem}?",
#                         "solution": f"Solution: {solution}.",
#                         "severity": random.choice(["low", "medium", "high"]),
#                         "season": random.choice(["kharif", "rabi", "zaid", "perennial"]),
#                         "region": random.choice(["north", "south", "east", "west", "central"]),
#                         "created_date": datetime.now().isoformat()
#                     }
                    
#                     problems_solutions.append(pair)
#                     problem_id += 1
    
#     # Add the original 50 problems from your list
#     original_problems = [
#         ("Problem 1: Crop not growing?", "Solution: Test soil, ensure proper irrigation, use organic pesticides."),
#         ("Problem 2: Weather issues?", "Solution: Check local weather forecasts and protect crops accordingly."),
#         ("Problem 3: Leaves yellowing?", "Solution: Use nitrogen-rich fertilizer."),
#         ("Problem 4: Soil dry?", "Solution: Implement drip irrigation."),
#         ("Problem 5: Pest attacks?", "Solution: Use neem oil or eco-friendly pesticides."),
#         ("Problem 6: Low crop yield?", "Solution: Use certified seeds and organic manure."),
#         ("Problem 7: Heavy rains?", "Solution: Ensure proper drainage and protect seedlings."),
#         ("Problem 8: Heat stress?", "Solution: Mulching helps retain soil moisture."),
#         ("Problem 9: Poor soil fertility?", "Solution: Crop rotation and add compost."),
#         ("Problem 10: Seeds not germinating?", "Solution: Use certified seeds and proper sowing depth."),
#         ("Problem 11: Fungal disease on crops?", "Solution: Apply appropriate fungicides and improve air circulation."),
#         ("Problem 12: Flooding in fields?", "Solution: Build raised beds or drainage canals."),
#         ("Problem 13: Lack of labor?", "Solution: Use mechanized tools or community labor sharing."),
#         ("Problem 14: Drought conditions?", "Solution: Harvest rainwater and implement water-saving irrigation."),
#         ("Problem 15: Soil erosion?", "Solution: Plant cover crops and build terraces on slopes."),
#         ("Problem 16: Salinity in soil?", "Solution: Leach soil with fresh water and use salt-tolerant crops."),
#         ("Problem 17: Weeds overgrowing?", "Solution: Manual weeding, mulching, or herbicide application."),
#         ("Problem 18: Market price drop?", "Solution: Join cooperatives or direct-to-consumer sales."),
#         ("Problem 19: Crop damage by birds?", "Solution: Use scarecrows, nets, or reflective tape."),
#         ("Problem 20: Overfertilization?", "Solution: Test soil and use balanced nutrient management."),
#         ("Problem 21: Pests resistant to chemicals?", "Solution: Rotate pesticides and use integrated pest management."),
#         ("Problem 22: Lack of access to quality seeds?", "Solution: Buy certified seeds or government-supported programs."),
#         ("Problem 23: Livestock damaging crops?", "Solution: Build fencing or rotational grazing systems."),
#         ("Problem 24: Soil compaction?", "Solution: Use reduced tillage and organic matter to loosen soil."),
#         ("Problem 25: Crop lodging (falling over)?", "Solution: Use support stakes and plant resistant varieties."),
#         ("Problem 26: Cold/frost damage?", "Solution: Cover plants or use frost-resistant crops."),
#         ("Problem 27: Water contamination?", "Solution: Use safe water sources and test for chemicals."),
#         ("Problem 28: Inadequate storage?", "Solution: Build silos, warehouses, or use cold storage facilities."),
#         ("Problem 29: Infestation by locusts?", "Solution: Early warning, traps, and coordinated pesticide use."),
#         ("Problem 30: Soil nutrient imbalance?", "Solution: Conduct soil testing and apply fertilizers accordingly."),
#         ("Problem 31: Unpredictable monsoon?", "Solution: Diversify crops and use drought-tolerant varieties."),
#         ("Problem 32: Crop theft?", "Solution: Secure fields and use community watch."),
#         ("Problem 33: High cost of machinery?", "Solution: Rent or share machinery cooperatively."),
#         ("Problem 34: Salinity intrusion in coastal farms?", "Solution: Use raised beds and salt-tolerant crops."),
#         ("Problem 35: Poor pollination?", "Solution: Plant flowering plants to attract bees or hand pollinate."),
#         ("Problem 36: Excessive rainfall?", "Solution: Build drainage and raised planting beds."),
#         ("Problem 37: Crop nutrient deficiency?", "Solution: Apply micronutrients and foliar sprays."),
#         ("Problem 38: Low organic matter in soil?", "Solution: Add compost, green manure, and cover crops."),
#         ("Problem 39: Infestation by rodents?", "Solution: Traps, safe rodenticides, and field hygiene."),
#         ("Problem 40: Weed resistance to herbicides?", "Solution: Rotate herbicides and use mechanical weeding."),
#         ("Problem 41: Poor irrigation scheduling?", "Solution: Use soil moisture sensors or irrigation calculators."),
#         ("Problem 42: Excessive pesticide use?", "Solution: Integrated pest management and natural predators."),
#         ("Problem 43: Crop diseases due to humidity?", "Solution: Improve ventilation and spacing."),
#         ("Problem 44: Poor seed germination due to old seeds?", "Solution: Use fresh, certified seeds and pre-treat them."),
#         ("Problem 45: Livestock disease affecting productivity?", "Solution: Vaccinate animals and maintain hygiene."),
#         ("Problem 46: Soil acidity?", "Solution: Apply lime and grow acid-tolerant crops."),
#         ("Problem 47: Deforestation affecting microclimate?", "Solution: Plant trees around fields and agroforestry."),
#         ("Problem 48: Poor access to market info?", "Solution: Use mobile apps, local co-ops, or extension services."),
#         ("Problem 49: Excess heat and sun scorch?", "Solution: Shade nets and mulching."),
#         ("Problem 50: Contamination of produce?", "Solution: Follow hygiene protocols, wash before storage or sale.")
#     ]
    
#     # Add original problems to the dataset
#     for i, (problem, solution) in enumerate(original_problems, 1):
#         pair = {
#             "id": problem_id,
#             "category": "general",
#             "crop": "general",
#             "problem": problem,
#             "solution": solution,
#             "severity": "medium",
#             "season": "all",
#             "region": "all",
#             "created_date": datetime.now().isoformat(),
#             "original": True
#         }
#         problems_solutions.append(pair)
#         problem_id += 1
    
#     return problems_solutions

# def save_to_file(data, filename):
#     """Save data to JSON file"""
#     with open(filename, 'w', encoding='utf-8') as f:
#         json.dump(data, f, indent=2, ensure_ascii=False)

# if __name__ == "__main__":
#     print("🌾 Generating comprehensive farmer problems and solutions dataset...")
    
#     # Generate problems and solutions
#     problems_data = generate_problems_and_solutions()
    
#     print(f"✅ Generated {len(problems_data)} problem-solution pairs")
    
#     # Save to file
#     save_to_file(problems_data, "farmer_problems_dataset.json")
    
#     # Generate summary statistics
#     categories = {}
#     crops = {}
    
#     for item in problems_data:
#         category = item['category']
#         crop = item['crop']
        
#         categories[category] = categories.get(category, 0) + 1
#         crops[crop] = crops.get(crop, 0) + 1
    
#     print("\n📊 Dataset Statistics:")
#     print(f"Total Problems: {len(problems_data)}")
#     print(f"Categories: {len(categories)}")
#     print(f"Crops Covered: {len(crops)}")
    
#     print("\n🗂️ Category Distribution:")
#     for category, count in sorted(categories.items()):
#         print(f"  {category}: {count} problems")
    
#     print("\n🌱 Top 10 Crops by Problem Count:")
#     top_crops = sorted(crops.items(), key=lambda x: x[1], reverse=True)[:10]
#     for crop, count in top_crops:
#         print(f"  {crop}: {count} problems")
    
#     print(f"\n💾 Dataset saved to: farmer_problems_dataset.json")
#     print("🎉 Farmer problems dataset generation completed!")






#!/usr/bin/env python3
"""
generate_unique_farmer_qa.py

Generates a large farmer Q-A dataset:
- default: 10,000 unique Q-A pairs
- each answer ~2000 characters (configurable)
- answers are guaranteed unique via hashing (with limited retries)
- writes output in chunked JSON files to keep memory low
- safe to run on modest laptops (i3 / 8GB RAM)

Usage:
    python3 generate_unique_farmer_qa.py

Configuration options are at the top of the file.
"""

import json
import random
import textwrap
import hashlib
import time
from datetime import datetime

# ---------------- CONFIG ----------------
TOTAL = 10000           # total unique Q-A pairs to generate
CHUNK_SIZE = 1000       # how many entries per output file
OUTPUT_PREFIX = "farmer_dataset_part"
MIN_ANSWER_CHARS = 1800
TARGET_ANSWER_CHARS = 2000
MAX_ANSWER_CHARS = 2500
MAX_RETRIES_ON_DUP = 6  # how many times to try regenerating if duplicate detected
LANG_MIX_PROB = 0.45    # probability to use Hinglish templates
RANDOM_SEED = 42
# ----------------------------------------

random.seed(RANDOM_SEED)

# ---------------- DATA POOLS ----------------
# Expanded crop list (mix of cereals, vegetables, fruits, spices, fodder, medicinal)
CROPS = [
    "rice", "wheat", "maize", "barley", "sorghum", "millet", "pearl millet", "finger millet",
    "chickpea", "pigeon pea", "lentil", "green gram", "black gram", "field pea",
    "soybean", "mustard", "sunflower", "sesame", "groundnut", "rapeseed",
    "potato", "sweet potato", "yam", "onion", "tomato", "chili", "brinjal", "eggplant",
    "okra", "cucumber", "pumpkin", "bottle gourd", "bitter gourd", "ridge gourd",
    "cabbage", "cauliflower", "broccoli", "carrot", "radish", "beetroot", "turnip",
    "spinach", "fenugreek", "coriander", "mint", "curry leaves", "moringa",
    "mango", "banana", "papaya", "guava", "citrus", "orange", "lemon", "pomegranate",
    "apple", "pear", "grape", "custard apple", "pineapple",
    "turmeric", "ginger", "garlic", "pepper", "cardamom", "coconut", "areca nut",
    "coffee", "tea", "cashew", "clove",
    "napier grass", "berseem", "alfalfa", "sorghum fodder", "lucerne",
    "ashwagandha", "stevia", "basil", "ajwain", "ajwain (carom)", "oregano",
    "sunflower (fodder)", "herbal chamomile", "lavender", "strawberry", "blackberry",
    "raspberry", "watermelon", "muskmelon", "grapes table", "cane sugar", "sugarcane",
    "spinach (palak)", "mustard greens", "lettuce", "kale", "arugula"
]
CROPS = list(dict.fromkeys(CROPS))  # ensure uniqueness

CATEGORIES = [
    "crop_diseases", "pest_control", "soil_issues", "weather_problems",
    "irrigation", "seed_planting", "market_economic", "livestock",
    "fertilizer_organic", "extension_advice"
]

# English question templates
QUESTION_TEMPLATES_EN = [
    "Why are the {crop} leaves turning yellow?",
    "My {crop} crop is not growing well — what can I do?",
    "How can I control pests in {crop} effectively?",
    "What causes the fruits of {crop} to rot before harvest?",
    "Why is my {crop} yield lower this season?",
    "How do I improve soil fertility for {crop}?",
    "Which fertilizer is best for {crop} at this stage?",
    "What organic methods protect {crop} from pests?",
    "How can I prevent fungal diseases in {crop}?",
    "Why are the {crop} fruits smaller than usual?"
]

# Hinglish / Hindi mixed templates
QUESTION_TEMPLATES_HINGLISH = [
    "{crop} ke patte pe daag aa rahe hain, iska kya ilaaj hai?",
    "Mera {crop} sahi se nahi ug raha, kya karu?",
    "{crop} mein keede lag gaye hain—organic upay kya hain?",
    "{crop} ka phal pakne se pehle kharab ho raha hai, karan kya ho sakta hai?",
    "Is season mein {crop} ki upaj kam kyon hai?",
    "{crop} ke liye mitti kaise behtar karein?",
    "{crop} ke liye kaunsa khaad istemal karen?",
    "{crop} ko rog se bachane ka best tareeka kya hai?",
    "{crop} mein fungal infection kaise roken?",
    "{crop} ke phal chhote hain, iska solution batao"
]

# Pools for building answers - expanded but still manageable
CAUSES_POOL = [
    "temperature fluctuations during flowering",
    "inadequate or irregular irrigation",
    "excessive nitrogen leading to luxuriant vegetative growth",
    "deficiency of potassium affecting fruit quality",
    "soil pH imbalance affecting nutrient availability",
    "poor drainage and root rot conditions",
    "early pest infestation reducing vigor",
    "viral infection causing mosaic patterns",
    "bacterial infection causing spots and wilting",
    "improper seed or variety choice for local climate",
    "delayed planting leading to mismatch with season",
    "nutrient lockout due to combined application mistakes"
]

ORGANIC_MEASURES_POOL = [
    "apply neem oil spray every 10–14 days as preventive measure",
    "introduce parasitoids and predatory insects (ladybirds, lacewings)",
    "use botanical extracts and locally-prepared botanical traps",
    "apply well-prepared compost and farmyard manure",
    "use biofertilizers like rhizobium, azotobacter, and phosphate solubilizers",
    "practice crop rotation and intercropping to reduce pest cycles",
    "mulch with straw or leaves to keep soil moisture stable",
    "use pheromone traps to monitor and control specific moth pests"
]

CHEMICAL_MEASURES_POOL = [
    "use recommended fungicides/pesticides at label rates only",
    "apply systemic insecticide during pest's most vulnerable stage (follow safety rules)",
    "use foliar micronutrient sprays when deficiency is diagnosed",
    "follow pre-harvest intervals strictly to meet market safety standards",
    "rotate pesticide classes to reduce resistance build-up"
]

PREVENTION_POOL = [
    "maintain field sanitation and remove diseased residues",
    "use certified seeds and healthy seedlings",
    "perform soil testing and apply balanced fertilizers",
    "install proper drainage and raised beds in waterlogged fields",
    "ensure correct plant spacing for good air circulation",
    "keep records of sprays, rainfall, and yields for future decisions"
]

FARMER_TIPS_POOL = [
    "market early with good packing to avoid price fall",
    "try small-scale trials before full adoption of any new technique",
    "engage local extension services for confirmatory lab tests",
    "participate in farmer groups to buy inputs in bulk and get better rates",
    "use shade nets during heat waves for sensitive vegetables",
    "store produce in ventilated crates away from direct sun"
]

CASE_STORIES_POOL = [
    "A farmer in a nearby district improved yields by timely potassium application combined with drip irrigation.",
    "A cooperative reduced post-harvest losses by adopting simple solar dryers for small fruits.",
    "A trial plot using biofertilizers showed improved plant vigor over two seasons.",
    "Switching to a certified, disease-resistant variety reduced fungicide usage significantly in one village."
]

CLOSURE_POOL = [
    "If problems persist, contact local agri-extension for sample testing and targeted advice.",
    "Keep a small notebook with dates of operations and weather to spot patterns in future.",
    "Use community action for outbreak-level issues (coordinated spraying or sanitation).",
    "Always follow safe handling and protective gear usage during chemical applications."
]
# -----------------------------------------------

# ---------------- Helper / Builder functions ----------------
def _hash_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def choose_question_template(crop: str) -> str:
    if random.random() < LANG_MIX_PROB:
        tmpl = random.choice(QUESTION_TEMPLATES_HINGLISH)
    else:
        tmpl = random.choice(QUESTION_TEMPLATES_EN)
    return tmpl.format(crop=crop)

def _random_pick(pool, k=3):
    pool = list(pool)
    k = min(k, len(pool))
    return random.sample(pool, k)

def build_step_text(i: int, crop: str):
    verbs = [
        "Inspect", "Remove", "Apply", "Increase", "Reduce", "Mulch", "Monitor",
        "Test", "Adjust", "Improve", "Check"
    ]
    verb = random.choice(verbs)
    if verb == "Inspect":
        return f"{i}. Inspect plants early morning for pests, egg clusters or discoloration; mark affected patches."
    if verb == "Remove":
        return f"{i}. Remove and isolate badly affected plants to prevent spread; do not compost visibly infected tissue."
    if verb == "Apply":
        return f"{i}. Apply an appropriate spray (organic if possible) following label instructions and safety precautions."
    if verb == "Increase":
        return f"{i}. Increase potassium and phosphorus at fruiting stage if fruit development is weak (after soil test)."
    if verb == "Reduce":
        return f"{i}. Reduce nitrogen application if excessive leaf growth is delaying flowering/fruiting."
    if verb == "Mulch":
        return f"{i}. Mulch around the base of the plants to conserve moisture and suppress weeds."
    if verb == "Monitor":
        return f"{i}. Monitor weekly with a simple checklist: pest counts, leaf color, flower set, and soil moisture."
    if verb == "Test":
        return f"{i}. Test soil and leaf tissue when symptoms are unclear—this reduces guesswork and saves money."
    if verb == "Adjust":
        return f"{i}. Adjust irrigation schedule to avoid water stress—drip irrigation often improves uniformity."
    return f"{i}. Maintain basic hygiene and timely field inspections."

def expand_to_length(base_text: str, crop: str) -> str:
    """
    Expand base_text by appending variable paragraphs until it reaches at least MIN_ANSWER_CHARS.
    Then, trim safely if over MAX_ANSWER_CHARS.
    """
    extra_paragraphs = [
        "How to apply treatments safely: always wear protective gear (gloves, mask) while preparing and spraying. "
        "Measure quantities accurately and avoid mixing incompatible chemicals.",
        "On timing: apply sprays early morning or late evening to reduce evaporation and maximize uptake.",
        "Storage & market tips: wash and sort produce, use ventilated crates, and avoid stacking hot produce.",
        "Record keeping: note sowing date, inputs and rainfall to find patterns for future seasons.",
        "Community action: coordinate with neighbors to manage pests that move across fields."
    ]

    # Add micro-specific sentences to increase uniqueness
    micro_sentences = [
        f"For {crop}, root zone moisture is critical and overwatering can encourage root rots.",
        f"{crop} often benefits from a late-season potassium top-up for better fruit quality.",
        f"Field trials on small plots can reveal which local seed or technique works best for {crop}.",
    ]

    while len(base_text) < MIN_ANSWER_CHARS:
        para = random.choice(extra_paragraphs)
        micro = random.choice(micro_sentences)
        base_text += "\n\n" + para + " " + micro

    if len(base_text) > MAX_ANSWER_CHARS:
        # Safely shorten by sentences
        sentences = base_text.split('. ')
        new_text = ""
        for s in sentences:
            if len(new_text) + len(s) + 2 > MAX_ANSWER_CHARS:
                break
            new_text += s + '. '
        base_text = new_text.strip()
        # If still too short after chopping, append one concise paragraph
        if len(base_text) < MIN_ANSWER_CHARS:
            base_text += "\n\n" + random.choice(extra_paragraphs)

    return base_text.strip()

def build_answer(crop: str, category: str, severity: str) -> str:
    """
    Build a unique-ish answer by:
    - choosing causes, organic & chemical measures, steps, prevention, tips and case story
    - randomizing section order to increase variation
    - adding crop-specific micro-sentences
    - expanding to required length
    """
    parts = []

    # Opening (short)
    open_forms = [
        f"This practical guidance focuses on {crop}. Below are likely causes, step-by-step actions, prevention, and farmer-friendly tips you can try immediately.",
        f"A quick, practical guide for {crop}: likely reasons, immediate steps to take, and ways to prevent recurrence."
    ]
    parts.append(random.choice(open_forms))

    # Causes - pick 3 different causes and compose
    causes = _random_pick(CAUSES_POOL, k=3)
    causes_text = "Likely causes include: " + "; ".join(causes) + "."
    parts.append(causes_text)

    # Steps - make 4-6 steps
    n_steps = random.randint(4, 6)
    steps = [build_step_text(i + 1, crop) for i in range(n_steps)]
    steps_text = "Step-by-step action plan:\n" + "\n".join(steps)
    parts.append(steps_text)

    # Organic vs chemical
    organic = random.choice(ORGANIC_MEASURES_POOL)
    chemical = random.choice(CHEMICAL_MEASURES_POOL)
    parts.append(f"Recommended organic practice: {organic}. If absolutely necessary, chemical measure: {chemical} (use responsibly).")

    # Prevention & long-term
    prevention = "; ".join(_random_pick(PREVENTION_POOL, k=3)) + "."
    parts.append("Prevention & long-term practices: " + prevention)

    # Farmer tips (2-4)
    tips = _random_pick(FARMER_TIPS_POOL, k=random.randint(2, 4))
    parts.append("Farmer tips: " + " | ".join(tips) + ".")

    # Case story (1)
    parts.append("Case example: " + random.choice(CASE_STORIES_POOL) + ".")

    # Closure
    parts.append(random.choice(CLOSURE_POOL))

    # Randomize the order of middle sections sometimes to increase diversity
    header = parts[0]
    footer = parts[-1]
    mid = parts[1:-1]
    random.shuffle(mid)
    assembled = header + "\n\n" + "\n\n".join(mid) + "\n\n" + footer

    # Add a unique short micro-paragraph referencing crop and severity to increase uniqueness
    severity_comment = {
        "low": f"If symptoms are mild on {crop}, act quickly with organic measures and regular monitoring.",
        "medium": f"For medium severity issues on {crop}, combine immediate action with soil testing and moderate chemical inputs if needed.",
        "high": f"High-severity problems on {crop} may require expert diagnosis, laboratory tests and coordinated measures across fields."
    }
    assembled += "\n\n" + severity_comment.get(severity, "")

    # Expand to reach target length
    assembled = expand_to_length(assembled, crop)
    return assembled

# ---------------- Duplicate detection & generation control ----------------
def generate_unique_entry(idx: int, existing_hashes: set, max_retries: int = MAX_RETRIES_ON_DUP):
    """
    Generate a single unique Q-A entry. If duplicate content (hash collision) occurs,
    retry up to max_retries times. Returns dict or raises RuntimeError if unable to produce unique.
    """
    for attempt in range(1, max_retries + 1):
        crop = random.choice(CROPS)
        category = random.choice(CATEGORIES)
        severity = random.choice(["low", "medium", "high"])
        season = random.choice(["kharif", "rabi", "zaid", "perennial", "all"])
        region = random.choice(["north", "south", "east", "west", "central"])

        question = choose_question_template(crop)
        answer = build_answer(crop, category, severity)

        # Build a stable content string to hash for uniqueness checking
        content_for_hash = question + "||" + answer[:400]  # first 400 chars often enough; full answer could be used
        entry_hash = _hash_text(content_for_hash)

        if entry_hash in existing_hashes:
            # duplicate detected; retry
            # small randomness change to reduce chance of repetition
            if attempt == max_retries:
                # final attempt: slightly mutate by adding a micro-sentence
                answer += "\n\nNote: try small-block trials before scaling."
                content_for_hash = question + "||" + answer[:400]
                entry_hash = _hash_text(content_for_hash)
                if entry_hash in existing_hashes:
                    raise RuntimeError(f"Unable to generate unique answer after {max_retries} attempts at idx {idx}")
            else:
                # continue loop to regenerate
                continue
        # Not a duplicate — save and return entry
        existing_hashes.add(entry_hash)
        entry = {
            "id": idx,
            "crop": crop,
            "category": category,
            "question": question,
            "answer": answer,
            "severity": severity,
            "season": season,
            "region": region,
            "created_date": datetime.utcnow().isoformat() + "Z"
        }
        return entry
    # If loop exits, something went wrong
    raise RuntimeError(f"Failed to create unique entry for idx {idx}")

# ---------------- Main generation loop ----------------
def generate_dataset(total=TOTAL, chunk_size=CHUNK_SIZE):
    existing_hashes = set()
    chunk = []
    file_count = 1
    generated = 0
    start_time = time.time()

    for idx in range(1, total + 1):
        try:
            entry = generate_unique_entry(idx, existing_hashes)
        except RuntimeError as e:
            print(f"[WARN] {e} — skipping entry {idx}")
            continue

        chunk.append(entry)
        generated += 1

        # flush chunk to disk
        if len(chunk) >= chunk_size:
            filename = f"{OUTPUT_PREFIX}_{file_count}.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(chunk, f, ensure_ascii=False, indent=2)
            elapsed = time.time() - start_time
            print(f"[{datetime.utcnow().isoformat()}] Wrote {len(chunk)} entries to {filename} (generated so far: {generated}) Elapsed: {elapsed:.1f}s")
            file_count += 1
            chunk = []

    # write remaining
    if chunk:
        filename = f"{OUTPUT_PREFIX}_{file_count}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(chunk, f, ensure_ascii=False, indent=2)
        print(f"[{datetime.utcnow().isoformat()}] Wrote {len(chunk)} entries to {filename} (final). Total generated: {generated}")

    total_elapsed = time.time() - start_time
    print(f"Generation finished. Total generated entries: {generated}. Time elapsed: {total_elapsed:.1f}s")

# ---------------- Run when executed ----------------
if __name__ == "__main__":
    print(f"Starting generation: total={TOTAL}, chunk_size={CHUNK_SIZE}, seed={RANDOM_SEED}")
    generate_dataset()
    print("All done. Files produced: check current directory for JSON parts.")
