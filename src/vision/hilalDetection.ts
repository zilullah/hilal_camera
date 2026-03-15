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
    console.log('Detecting Hilal with raw URI:', imageUri);
    
    const decodedUri = decodeURIComponent(imageUri);
    const normalizedUri = decodedUri.startsWith('file://') ? decodedUri : `file://${decodedUri}`;
    console.log('Normalized & Decoded URI:', normalizedUri);

    const fileInfo = await FileSystem.getInfoAsync(normalizedUri);
    console.log('Full File Info Object:', JSON.stringify(fileInfo, null, 2));
    
    if (!fileInfo.exists) {
      console.error('File STILL does not exist at URI:', normalizedUri);
      return { brightnessScore: 0, curveScore: 0, probability: 0 };
    }

    const imgB64 = await FileSystem.readAsStringAsync(normalizedUri, {
      encoding: 'base64',
    });
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const rawImageData = new Uint8Array(imgBuffer);

    return tf.tidy(() => {
      const imageTensor = decodeJpeg(rawImageData);
      
      const grayscale = imageTensor.mean(2).expandDims(-1);
      
      const brightnessThreshold = 230; 
      const glareMask = grayscale.less(tf.scalar(brightnessThreshold)).cast('float32');
      const maskedGray = grayscale.mul(glareMask);

      const min = maskedGray.min();
      const max = maskedGray.max();
      const range = max.sub(min);
      
      const rangeVal = range.dataSync()[0];
      let normalized;
      if (rangeVal > 20) {
        normalized = maskedGray.sub(min).div(range.add(tf.scalar(0.0001)));
      } else {
        normalized = maskedGray.div(tf.scalar(255));
      }
      
      const exposureScale = tf.scalar(exposureOffset * 2); 
      const enhanced = normalized.mul(exposureScale).clipByValue(0, 1).mul(tf.scalar(255));

      const flattened = enhanced.flatten();
      const k = Math.max(1, Math.floor(flattened.size * 0.001));
      const { values: topValues } = tf.topk(flattened, k);
      const topBrightness = topValues.mean().dataSync()[0];
      
      const imgMean = enhanced.mean().dataSync()[0];
      let brightnessScore = Math.min(100, (topBrightness / 255) * 100);
      
      if (imgMean < 2) {
        brightnessScore *= (imgMean / 2);
      }

      const h = enhanced.shape[0] || 0;
      const w = enhanced.shape[1] || 0;
      const reduced = tf.image.resizeBilinear(enhanced as tf.Tensor3D, [Math.floor(h/8), Math.floor(w/8)]);
      
      const mean = reduced.mean();
      const variance = reduced.sub(mean).square().mean();
      let curveScore = Math.min(100, (variance.dataSync()[0] / 500) * 100);
      
      if (rangeVal < 15) {
        curveScore *= 0.1;
      }

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
