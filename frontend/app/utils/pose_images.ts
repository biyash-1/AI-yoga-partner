

export const poseImages = {
  Vrukshasana: '/poses/tree.jpg',           // Tree Pose
  Utkasana: '/poses/chair.jpg',             // Chair Pose
  Bhujangasana: '/poses/cobra.jpg',         // Cobra Pose
  Veerabhadrasana: '/poses/warrior.jpg',    // Warrior Pose
  Adhomukasana: '/poses/downdog.jpg',       // Downward Dog
  Sarvangasana: '/poses/shoulderstand.jpg', // Shoulder Stand
  Trikonasana: '/poses/triangle.jpg',       // Triangle Pose
};

export type PoseName = keyof typeof poseImages;