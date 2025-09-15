#!/usr/bin/env python3
"""
Crop Image Analysis using Computer Vision
Analyzes crop images to detect problems and provide recommendations
"""

import json
import sys
import cv2
import numpy as np
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

try:
    import torch
    import torchvision.transforms as transforms
    from PIL import Image
    import tensorflow as tf
    DEEP_LEARNING_AVAILABLE = True
except ImportError:
    DEEP_LEARNING_AVAILABLE = False
    print("⚠️ Deep learning libraries not available. Using basic image analysis.")

class CropImageAnalyzer:
    """
    Advanced crop image analysis system
    """
    
    def __init__(self):
        self.disease_patterns = {
            'leaf_spot': {
                'description': 'Leaf spots or lesions detected',
                'indicators': ['circular_spots', 'brown_patches', 'yellow_halos'],
                'recommendations': [
                    'Apply copper-based fungicides',
                    'Improve air circulation around plants',
                    'Remove affected leaves and burn them',
                    'Avoid overhead irrigation'
                ]
            },
            'yellowing': {
                'description': 'Leaf yellowing detected',
                'indicators': ['yellow_leaves', 'chlorosis'],
                'recommendations': [
                    'Check soil nutrients, especially nitrogen',
                    'Test soil pH and adjust if needed',
                    'Ensure proper drainage',
                    'Apply balanced fertilizer'
                ]
            },
            'wilting': {
                'description': 'Plant wilting or stress detected',
                'indicators': ['drooping_leaves', 'dried_parts'],
                'recommendations': [
                    'Check irrigation system',
                    'Examine roots for rot or damage',
                    'Look for signs of pest infestation',
                    'Provide shade during hot weather'
                ]
            },
            'pest_damage': {
                'description': 'Pest damage visible on leaves',
                'indicators': ['holes_in_leaves', 'chewed_edges', 'insect_trails'],
                'recommendations': [
                    'Identify the specific pest causing damage',
                    'Use neem oil or organic pesticides',
                    'Install sticky traps',
                    'Encourage beneficial insects'
                ]
            },
            'nutrient_deficiency': {
                'description': 'Nutrient deficiency symptoms',
                'indicators': ['pale_leaves', 'stunted_growth', 'discoloration'],
                'recommendations': [
                    'Conduct soil test to identify specific deficiencies',
                    'Apply appropriate fertilizers',
                    'Consider foliar feeding for quick results',
                    'Improve soil organic matter'
                ]
            },
            'healthy': {
                'description': 'Plant appears healthy',
                'indicators': ['green_leaves', 'normal_growth', 'no_spots'],
                'recommendations': [
                    'Continue current care routine',
                    'Monitor regularly for early problem detection',
                    'Maintain proper nutrition and watering',
                    'Keep the area clean and free from weeds'
                ]
            }
        }
    
    def analyze_image(self, image_path, question=None, language='en'):
        """
        Main image analysis function
        """
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                return self._error_response("Could not load image file")
            
            # Basic image analysis
            basic_analysis = self._basic_image_analysis(image)
            
            # Advanced analysis if deep learning is available
            if DEEP_LEARNING_AVAILABLE:
                advanced_analysis = self._advanced_analysis(image_path)
                basic_analysis.update(advanced_analysis)
            
            # Generate response based on analysis
            response = self._generate_response(basic_analysis, question, language)
            
            return response
            
        except Exception as e:
            return self._error_response(f"Analysis failed: {str(e)}")
    
    def _basic_image_analysis(self, image):
        """
        Basic image analysis using traditional computer vision
        """
        analysis = {
            'detected_problems': [],
            'confidence': 0.7,
            'recommendations': [],
            'image_quality': 'good'
        }
        
        # Convert to different color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        
        # Analyze color distribution
        color_analysis = self._analyze_colors(image, hsv, lab)
        analysis.update(color_analysis)
        
        # Detect spots and lesions
        spots_analysis = self._detect_spots_and_lesions(image, hsv)
        analysis['detected_problems'].extend(spots_analysis)
        
        # Check for yellowing
        yellowing_analysis = self._detect_yellowing(hsv)
        if yellowing_analysis['has_yellowing']:
            analysis['detected_problems'].append('yellowing')
        
        # Assess overall plant health
        health_score = self._assess_plant_health(color_analysis, spots_analysis, yellowing_analysis)
        analysis['health_score'] = health_score
        
        if health_score > 0.8:
            analysis['detected_problems'] = ['healthy']
        
        return analysis
    
    def _analyze_colors(self, image, hsv, lab):
        """
        Analyze color distribution in the image
        """
        # Calculate color histograms
        hist_h = cv2.calcHist([hsv], [0], None, [180], [0, 180])
        hist_s = cv2.calcHist([hsv], [1], None, [256], [0, 256])
        hist_v = cv2.calcHist([hsv], [2], None, [256], [0, 256])
        
        # Analyze green content (healthy vegetation indicator)
        green_mask = cv2.inRange(hsv, (40, 50, 50), (80, 255, 255))
        green_percentage = (np.sum(green_mask > 0) / (image.shape[0] * image.shape[1])) * 100
        
        # Analyze brown/dead content
        brown_mask = cv2.inRange(hsv, (8, 50, 20), (25, 255, 200))
        brown_percentage = (np.sum(brown_mask > 0) / (image.shape[0] * image.shape[1])) * 100
        
        # Analyze yellow content
        yellow_mask = cv2.inRange(hsv, (15, 50, 50), (35, 255, 255))
        yellow_percentage = (np.sum(yellow_mask > 0) / (image.shape[0] * image.shape[1])) * 100
        
        return {
            'green_percentage': green_percentage,
            'brown_percentage': brown_percentage,
            'yellow_percentage': yellow_percentage,
            'dominant_color': self._get_dominant_color(image)
        }
    
    def _detect_spots_and_lesions(self, image, hsv):
        """
        Detect circular spots and lesions on leaves
        """
        detected_problems = []
        
        # Convert to grayscale for spot detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        
        # Use HoughCircles to detect circular spots
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=20,
            param1=50,
            param2=30,
            minRadius=5,
            maxRadius=50
        )
        
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            if len(circles) > 5:  # Many spots indicate disease
                detected_problems.append('leaf_spot')
        
        # Detect irregular shapes (lesions)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        irregular_shapes = 0
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:  # Filter small noise
                perimeter = cv2.arcLength(contour, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter ** 2)
                    if circularity < 0.5:  # Irregular shape
                        irregular_shapes += 1
        
        if irregular_shapes > 3:
            detected_problems.append('pest_damage')
        
        return detected_problems
    
    def _detect_yellowing(self, hsv):
        """
        Detect yellowing in leaves
        """
        # Create mask for yellow colors
        yellow_mask = cv2.inRange(hsv, (15, 50, 50), (35, 255, 255))
        yellow_pixels = np.sum(yellow_mask > 0)
        total_pixels = hsv.shape[0] * hsv.shape[1]
        yellow_percentage = (yellow_pixels / total_pixels) * 100
        
        return {
            'has_yellowing': yellow_percentage > 15,
            'yellow_percentage': yellow_percentage
        }
    
    def _assess_plant_health(self, color_analysis, spots_analysis, yellowing_analysis):
        """
        Assess overall plant health based on various indicators
        """
        health_score = 1.0
        
        # Reduce score based on problems
        if color_analysis['green_percentage'] < 30:
            health_score -= 0.3
        
        if color_analysis['brown_percentage'] > 20:
            health_score -= 0.4
        
        if yellowing_analysis['has_yellowing']:
            health_score -= 0.2
        
        if len(spots_analysis) > 0:
            health_score -= 0.3
        
        return max(0.0, health_score)
    
    def _get_dominant_color(self, image):
        """
        Get the dominant color in the image
        """
        # Reshape image to be a list of pixels
        pixels = image.reshape((-1, 3))
        
        # Use KMeans to find dominant colors (with fallback)
        try:
            from sklearn.cluster import KMeans
            kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
            kmeans.fit(pixels)
            
            # Get the most frequent cluster
            colors = kmeans.cluster_centers_
            labels = kmeans.labels_
            
            # Count frequency of each cluster
            unique_labels, counts = np.unique(labels, return_counts=True)
            dominant_color_index = unique_labels[np.argmax(counts)]
            dominant_color = colors[dominant_color_index]
            
            # Convert BGR to color name
            return self._bgr_to_color_name(dominant_color)
        except ImportError:
            # Fallback: simple color analysis without clustering
            mean_color = np.mean(pixels, axis=0)
            return self._bgr_to_color_name(mean_color)
    
    def _bgr_to_color_name(self, bgr_color):
        """
        Convert BGR color values to color name
        """
        b, g, r = bgr_color
        
        if g > r and g > b and g > 100:
            return 'green'
        elif r > g and r > b:
            return 'red'
        elif r > 150 and g > 150 and b < 100:
            return 'yellow'
        elif r < 100 and g < 100 and b < 100:
            return 'dark'
        elif r > 200 and g > 200 and b > 200:
            return 'white'
        else:
            return 'brown'
    
    def _advanced_analysis(self, image_path):
        """
        Advanced analysis using deep learning (if available)
        """
        # This would use pre-trained models for crop disease detection
        # For now, return placeholder results
        return {
            'ml_confidence': 0.85,
            'ml_predictions': ['leaf_spot'],
            'features_detected': ['lesions', 'discoloration']
        }
    
    def _generate_response(self, analysis, question, language):
        """
        Generate human-readable response based on analysis
        """
        detected_problems = analysis.get('detected_problems', [])
        confidence = analysis.get('health_score', 0.7)
        
        # Get recommendations for detected problems
        all_recommendations = []
        problem_descriptions = []
        
        for problem in detected_problems:
            if problem in self.disease_patterns:
                pattern = self.disease_patterns[problem]
                problem_descriptions.append(pattern['description'])
                all_recommendations.extend(pattern['recommendations'])
        
        # Remove duplicates
        all_recommendations = list(set(all_recommendations))
        
        # Generate response text
        if not problem_descriptions:
            response_text = "I've analyzed your crop image but couldn't identify specific problems. "
            response_text += f"The image shows {analysis.get('green_percentage', 0):.1f}% green vegetation. "
            response_text += "Please provide more details about the issues you're experiencing."
        else:
            response_text = f"🔍 **Image Analysis Results:**\n\n"
            response_text += f"**Detected Issues:** {', '.join(problem_descriptions)}\n\n"
            
            if analysis.get('green_percentage'):
                response_text += f"**Vegetation Health:** {analysis['green_percentage']:.1f}% green coverage\n"
            
            if analysis.get('yellow_percentage', 0) > 10:
                response_text += f"**Yellowing:** {analysis['yellow_percentage']:.1f}% yellow areas detected\n"
            
            response_text += f"\n**Overall Health Score:** {confidence:.1f}/1.0\n\n"
            
            if all_recommendations:
                response_text += "💡 **Recommended Actions:**\n"
                for i, rec in enumerate(all_recommendations[:5], 1):  # Limit to top 5
                    response_text += f"{i}. {rec}\n"
        
        return {
            'response': response_text,
            'confidence': confidence,
            'detectedProblems': detected_problems,
            'recommendations': all_recommendations[:5],
            'imageAnalysis': {
                'greenPercentage': analysis.get('green_percentage', 0),
                'yellowPercentage': analysis.get('yellow_percentage', 0),
                'brownPercentage': analysis.get('brown_percentage', 0),
                'dominantColor': analysis.get('dominant_color', 'unknown'),
                'healthScore': confidence
            }
        }
    
    def _error_response(self, error_message):
        """
        Generate error response
        """
        return {
            'response': f"Sorry, I couldn't analyze the image: {error_message}",
            'confidence': 0.0,
            'detectedProblems': [],
            'recommendations': [],
            'error': error_message
        }

def main():
    """
    Main function to process image analysis requests
    """
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        request_data = json.loads(input_data)
        
        image_path = request_data.get('imagePath')
        question = request_data.get('question', '')
        language = request_data.get('language', 'en')
        
        if not image_path or not os.path.exists(image_path):
            print(json.dumps({
                'response': 'Image file not found',
                'confidence': 0.0,
                'detectedProblems': [],
                'recommendations': [],
                'error': 'Image file not found'
            }))
            return
        
        # Initialize analyzer and process image
        analyzer = CropImageAnalyzer()
        result = analyzer.analyze_image(image_path, question, language)
        
        # Output result as JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Output error response
        error_response = {
            'response': f'Image analysis failed: {str(e)}',
            'confidence': 0.0,
            'detectedProblems': [],
            'recommendations': [],
            'error': str(e)
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()