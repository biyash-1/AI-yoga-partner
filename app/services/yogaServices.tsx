// yogaAIService.ts
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Point indices for body landmarks
export const POINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
} as const;

// Define keypoint type
interface Keypoint {
  name?: string;
  x?: number;
  y?: number;
  score?: number;
}

// Keypoint connections for drawing skeleton
export const keypointConnections: { [key: string]: string[] } = {
  nose: ['left_eye', 'right_eye'],
  left_eye: ['left_ear'],
  right_eye: ['right_ear'],
  left_ear: ['left_shoulder'],
  right_ear: ['right_shoulder'],
  left_shoulder: ['right_shoulder', 'left_elbow', 'left_hip'],
  right_shoulder: ['right_elbow', 'right_hip'],
  left_elbow: ['left_wrist'],
  right_elbow: ['right_wrist'],
  left_wrist: [],
  right_wrist: [],
  left_hip: ['right_hip', 'left_knee'],
  right_hip: ['right_knee'],
  left_knee: ['left_ankle'],
  right_knee: ['right_ankle'],
  left_ankle: [],
  right_ankle: [],
};

// Pose classifications
export const CLASS_NO = {
  Utkasana: 0,
  Bhujangasana: 1,
  Adhomukasana: 2,
  No_Pose: 3,
  Sarvangasana: 4,
  Trikonasana: 5,
  Vrukshasana: 6,
  Veerabhadrasana: 7,
} as const;

export const POSE_NAMES = [
  'Utkasana',
  'Bhujangasana',
  'Adhomukasana',
  'No_Pose',
  'Sarvangasana',
  'Trikonasana',
  'Vrukshasana',
  'Veerabhadrasana',
];

// Drawing utilities - Matching TensorFlow.js parameter order
export function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number,
  color: string
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawSegment(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  color: string,
  scale: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
}

// Pose processing utilities
function get_center_point(
  landmarks: tf.Tensor,
  left_bodypart: number,
  right_bodypart: number
): tf.Tensor {
  const left = tf.gather(landmarks, left_bodypart, 1);
  const right = tf.gather(landmarks, right_bodypart, 1);
  const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
  return center;
}

function get_pose_size(
  landmarks: tf.Tensor,
  torso_size_multiplier: number = 2.5
): tf.Tensor {
  const hips_center = get_center_point(
    landmarks,
    POINTS.LEFT_HIP,
    POINTS.RIGHT_HIP
  );
  const shoulders_center = get_center_point(
    landmarks,
    POINTS.LEFT_SHOULDER,
    POINTS.RIGHT_SHOULDER
  );
  const torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
  
  let pose_center_new = get_center_point(
    landmarks,
    POINTS.LEFT_HIP,
    POINTS.RIGHT_HIP
  );
  pose_center_new = tf.expandDims(pose_center_new, 1);
  pose_center_new = tf.broadcastTo(pose_center_new, [1, 17, 2]);
  
  const d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
  const max_dist = tf.max(tf.norm(d as tf.Tensor, 'euclidean', 0));
  
  const pose_size = tf.maximum(
    tf.mul(torso_size, torso_size_multiplier),
    max_dist
  );
  return pose_size;
}

function normalize_pose_landmarks(landmarks: tf.Tensor): tf.Tensor {
  let pose_center = get_center_point(
    landmarks,
    POINTS.LEFT_HIP,
    POINTS.RIGHT_HIP
  );
  pose_center = tf.expandDims(pose_center, 1);
  pose_center = tf.broadcastTo(pose_center, [1, 17, 2]);
  landmarks = tf.sub(landmarks, pose_center);
  
  const pose_size = get_pose_size(landmarks);
  landmarks = tf.div(landmarks, pose_size);
  return landmarks;
}

function landmarks_to_embedding(landmarks: number[][]): tf.Tensor {
  const landmarksTensor = tf.tensor2d(landmarks);
  const normalized = normalize_pose_landmarks(tf.expandDims(landmarksTensor, 0));
  const embedding = tf.reshape(normalized, [1, 34]);
  return embedding;
}

export interface PoseDetectionResult {
  poseName: string;
  accuracy: number;
  isCorrectPose: boolean;
  keypoints: Keypoint[];
}

export class YogaAIService {
  private detector: poseDetection.PoseDetector | null = null;
  private poseClassifier: tf.LayersModel | null = null;
  private isInitialized: boolean = false;

  async initialize(modelPath: string = '/model/model.json') {
    try {
      console.log('🚀 Initializing Yoga AI Service...');
      
      // Initialize TensorFlow backend
      await tf.ready();
      await tf.setBackend('webgl');
      console.log('✅ TensorFlow backend:', tf.getBackend());
      
      // Create pose detector
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      };
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      console.log('✅ MoveNet detector loaded');
      
      // Load pose classification model
      this.poseClassifier = await tf.loadLayersModel(modelPath);
      console.log('✅ Pose classifier loaded');
      
      this.isInitialized = true;
      console.log('🎉 Yoga AI Service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Yoga AI Service:', error);
      throw error;
    }
  }

  async detectPose(
    videoElement: HTMLVideoElement,
    ctx: CanvasRenderingContext2D,
    targetPose?: string
  ): Promise<PoseDetectionResult | null> {
    if (!this.isInitialized || !this.detector || !this.poseClassifier) {
      console.error('Service not initialized');
      return null;
    }

    try {
      // Estimate poses
      const poses = await this.detector.estimatePoses(videoElement);
      
      if (!poses || poses.length === 0) {
        return null;
      }

      const pose = poses[0];
      const keypoints = pose.keypoints;
      
      // Clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      let notDetected = 0;
      const input: number[][] = [];
      let skeletonColor = 'rgb(255,255,255)';
      
      // Collect keypoint data
      keypoints.forEach((keypoint: Keypoint) => {
        if (!keypoint.score || keypoint.score <= 0.4) {
          notDetected++;
        }
        input.push([keypoint.x || 0, keypoint.y || 0]);
      });
      
      // Process classification
      let poseName = 'No_Pose';
      let accuracy = 0;
      let isCorrectPose = false;
      
      if (notDetected <= 4) {
        try {
          const processedInput = landmarks_to_embedding(input);
          const classification = this.poseClassifier.predict(processedInput) as tf.Tensor;
          const classificationData = await classification.array() as number[][];
          
          // Find pose with highest confidence above threshold
          const findBestPose = (array: number[], threshold: number = 0.7) => {
            let maxIndex = -1;
            let maxValue = threshold;
            
            for (let i = 0; i < array.length; i++) {
              if (array[i] > maxValue) {
                maxValue = array[i];
                maxIndex = i;
              }
            }
            
            return maxIndex !== -1 ? maxIndex : 3; // Default to No_Pose
          };
          
          const classNo = findBestPose(classificationData[0]);
          poseName = POSE_NAMES[classNo] || 'No_Pose';
          accuracy = classificationData[0][classNo] * 100;
          isCorrectPose = classificationData[0][classNo] > 0.90;
          
          // Update skeleton color based on accuracy
          if (isCorrectPose) {
            skeletonColor = 'rgb(0,255,0)'; // Green for correct
          } else if (classificationData[0][classNo] > 0.7) {
            skeletonColor = 'rgb(255,255,0)'; // Yellow for close
          } else {
            skeletonColor = 'rgb(255,255,255)'; // White for needs work
          }
          
          // Clean up tensors
          processedInput.dispose();
          classification.dispose();
        } catch (err) {
          console.error('Classification error:', err);
        }
      }
      
      // Draw skeleton with the determined color
      keypoints.forEach((keypoint: Keypoint) => {
        if (keypoint.score && keypoint.score > 0.3) {
          if (keypoint.name !== 'left_eye' && keypoint.name !== 'right_eye') {
            // Draw keypoint
            drawPoint(ctx, keypoint.y!, keypoint.x!, 8, skeletonColor);
            
            // Draw connections
            const connections = keypointConnections[keypoint.name!];
            if (connections) {
              connections.forEach((connectionName: string) => {
                try {
                  const connectedPoint = keypoints.find(
                    (kp: Keypoint) => kp.name === connectionName
                  );
                  if (connectedPoint && connectedPoint.score! > 0.3) {
                    drawSegment(
                      [keypoint.y!, keypoint.x!],
                      [connectedPoint.y!, connectedPoint.x!],
                      skeletonColor,
                      1,
                      ctx
                    );
                  }
                } catch (err) {
                  // Ignore connection errors
                }
              });
            }
          }
        }
      });
      
      return {
        poseName,
        accuracy: parseFloat(accuracy.toFixed(2)),
        isCorrectPose,
        keypoints,
      };
    } catch (error) {
      console.error('Error detecting pose:', error);
      return null;
    }
  }

  dispose() {
    if (this.detector) {
      this.detector.dispose();
    }
    this.isInitialized = false;
    console.log('Yoga AI Service disposed');
  }
  
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const yogaAIService = new YogaAIService();