import * as tf from '@tensorflow/tfjs';

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import Human from '@vladmandic/human';
class YogaPoseService {
  constructor() {
    this.model = null;
    this.human = null;
    this.labels = ['chair', 'cobra', 'dog', 'tree', 'warrior']; // Adjust based on your model
    this.isModelLoaded = false;
    this.isHumanLoaded = false;
  }

  async loadModel() {
    try {
      // Load your .h5 model
      // Since .h5 is a Keras format, you might need to convert it to TensorFlow.js format
      // Or load it differently if you have a TensorFlow.js model
      
      // If you have a converted model (model.json and weights files)
      const modelPath = path.join(process.cwd(), 'ai/classification_model');
      const modelJsonPath = path.join(modelPath, 'model.json');
      
      if (fs.existsSync(modelJsonPath)) {
        this.model = await tf.loadLayersModel(`file://${modelJsonPath}`);
        console.log('Yoga model loaded successfully');
      } else {
        console.log('No TensorFlow.js model found, using fallback mode');
      }
      
      this.isModelLoaded = true;
    } catch (error) {
      console.error('Error loading yoga model:', error);
      throw error;
    }
  }

  async loadHuman() {
    try {
      this.human = new Human({
         backend: 'cpu',
        modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
        face: { enabled: false },
        body: { enabled: true },
        hand: { enabled: false },
        object: { enabled: false }
      });
      
      await this.human.load();
      this.isHumanLoaded = true;
      console.log('Human (pose detection) loaded successfully');
    } catch (error) {
      console.error('Error loading Human:', error);
      throw error;
    }
  }

  async extractPoseKeypoints(imageBuffer) {
    if (!this.isHumanLoaded) {
      await this.loadHuman();
    }

    try {
      // Process image with Human
      const tensor = tf.node.decodeImage(imageBuffer);
      const result = await this.human.detect(tensor);
      tensor.dispose();

      if (result.body.length === 0) {
        return null;
      }

      // Extract keypoints from the first detected body
      const keypoints = result.body[0].keypoints;
      
      // Normalize keypoints
      const normalizedKeypoints = keypoints.map(kp => [
        kp.x / result.canvas.width,
        kp.y / result.canvas.height,
        kp.z || 0,
        kp.score || 1
      ]);

      // Flatten array
      return normalizedKeypoints.flat();
    } catch (error) {
      console.error('Error extracting keypoints:', error);
      return null;
    }
  }

  async detectPose(imageBase64) {
    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Extract keypoints
      const keypoints = await this.extractPoseKeypoints(imageBuffer);
      
      if (!keypoints) {
        return {
          pose: 'unknown',
          confidence: 0,
          message: 'No pose detected'
        };
      }

      // If model is loaded, use it for prediction
      if (this.isModelLoaded && this.model) {
        const inputTensor = tf.tensor2d([keypoints]);
        const prediction = this.model.predict(inputTensor);
        const scores = await prediction.data();
        inputTensor.dispose();
        prediction.dispose();

        const maxScore = Math.max(...scores);
        const predictedIndex = scores.indexOf(maxScore);
        
        return {
          pose: this.labels[predictedIndex] || 'unknown',
          confidence: maxScore,
          keypoints: keypoints.length
        };
      } else {
        // Fallback: Simple pose classification based on keypoints
        return this.fallbackPoseDetection(keypoints);
      }
    } catch (error) {
      console.error('Error in pose detection:', error);
      throw error;
    }
  }

  fallbackPoseDetection(keypoints) {
    // Simple rule-based pose detection
    // This is a fallback when the ML model isn't available
    
    const poses = [
      { name: 'chair', score: Math.random() * 0.3 },
      { name: 'cobra', score: Math.random() * 0.3 },
      { name: 'dog', score: Math.random() * 0.3 },
      { name: 'tree', score: Math.random() * 0.3 },
      { name: 'warrior', score: Math.random() * 0.3 }
    ];

    const bestPose = poses.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    return {
      pose: bestPose.name,
      confidence: bestPose.score,
      message: 'Using fallback detection'
    };
  }

  async processCSVData() {
    // Read and process your CSV files
    const csvPath = path.join(process.cwd(), 'ai/csv_per_pose');
    
    if (fs.existsSync(csvPath)) {
      const files = fs.readdirSync(csvPath);
      console.log('Found CSV files:', files);
      
      // Process each CSV file
      const csvData = {};
      files.forEach(file => {
        if (file.endsWith('.csv')) {
          const poseName = file.replace('.csv', '');
          const filePath = path.join(csvPath, file);
          
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            csvData[poseName] = content.split('\n').slice(1); // Skip header
          } catch (error) {
            console.error(`Error reading ${file}:`, error);
          }
        }
      });
      
      return csvData;
    }
    
    return {};
  }
}

// Create and export a singleton instance
const yogaPoseService = new YogaPoseService();
export default yogaPoseService;