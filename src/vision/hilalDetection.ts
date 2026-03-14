import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface DetectionResult {
  brightnessScore: number;
  curveScore: number;
  probability: number;
}

export const detectThinBrightCurve = async (
  imageUri: string,
  exposureOffset: number = 0.5
): Promise<DetectionResult> => {
  try {
    const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const rawImageData = new Uint8Array(imgBuffer);

    return tf.tidy(() => {
      const imageTensor = decodeJpeg(rawImageData);
      
      // 1. Grayscale conversion (Standard weights)
      const grayscale = imageTensor.mean(2).expandDims(-1);
      
      // 2. Glare Reduction (Sun Masking)
      // Identify areas > 90% brightness and mask them out (set to 0) 
      // This prevents the sun or lens flare from dominating the analysis
      const brightnessThreshold = 230; 
      const glareMask = grayscale.less(tf.scalar(brightnessThreshold)).cast('float32');
      const maskedGray = grayscale.mul(glareMask);

      // 3. Contrast Enhancement & Digital Exposure
      const min = maskedGray.min();
      const max = maskedGray.max();
      const normalized = maskedGray.sub(min).div(max.sub(min).add(tf.scalar(0.0001)));
      
      // Digital Exposure Compensation: exposureOffset (0.0 to 1.0)
      // 0.5 is neutral. 1.0 is full brightness. 0.0 is dark.
      const exposureScale = tf.scalar(exposureOffset * 2); 
      const enhanced = normalized.mul(exposureScale).clipByValue(0, 1).mul(tf.scalar(255));

      // 4. Brightness Score (based on mid-high intensity pixels that aren't glare)
      const topBrightness = enhanced.max().dataSync()[0];
      const brightnessScore = Math.min(100, (topBrightness / 255) * 100);

      // 5. Heuristic Curve Detection (Simplified Gradient Analysis)
      // Check for horizontal/vertical gradients that might indicate a thin edge
      const h = enhanced.shape[0] || 0;
      const w = enhanced.shape[1] || 0;
      const reduced = tf.image.resizeBilinear(enhanced as tf.Tensor3D, [Math.floor(h/4), Math.floor(w/4)]);
      
      // Simple variation check: high variance in localized areas suggests edges/curves
      const mean = reduced.mean();
      const variance = reduced.sub(mean).square().mean();
      const curveScore = Math.min(100, (variance.dataSync()[0] / 500) * 100);

      // Final probability calculation
      const probability = (brightnessScore * 0.4 + curveScore * 0.6);

      return {
        brightnessScore,
        curveScore,
        probability,
      };
    });
  } catch (error) {
    console.error('TFJS Detection Error:', error);
    return { brightnessScore: 0, curveScore: 0, probability: 0 };
  }
};
