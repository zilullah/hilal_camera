import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { calculateMoonPosition } from '../services/astronomyService';
import { getCurrentLocation } from '../services/locationService';
import { useDeviceOrientation } from '../services/sensorService';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const orientation = useDeviceOrientation();
  const cameraRef = useRef<any>(null);
  const theme = useTheme();

  const [moonPos, setMoonPos] = useState({ azimuth: 270, altitude: 0 });
  const [exposure, setExposure] = useState(0.5);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    async function getMoon() {
      try {
        const loc = await getCurrentLocation();
        const data = calculateMoonPosition(loc.latitude, loc.longitude, new Date());
        setMoonPos({ azimuth: data.moonAzimuth, altitude: data.moonAltitude });
      } catch (err) {
        console.error("Failed to get moon position for camera:", err);
      }
    }
    getMoon();
  }, []);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#fff', marginBottom: 20 }}>
          Camera access is required for Hilal detection.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      router.push({
        pathname: '/result',
        params: { uri: photo.uri, exposure: exposure.toString() }
      });
    }
  };

  const FOV = 40; 
  const horizontalOffset = ((moonPos.azimuth - orientation.azimuth + 180) % 360 - 180) * (width / FOV);
  const verticalOffset = (moonPos.altitude - orientation.pitch) * (height / FOV); 
  
  const moonLeft = width / 2 + horizontalOffset;
  const moonTop = height / 2 - verticalOffset;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView 
        style={styles.camera} 
        ref={cameraRef}
      >
        {showGrid && (
          <View style={styles.gridContainer} pointerEvents="none">
            <View style={styles.gridRow} />
            <View style={styles.gridRow} />
            <View style={styles.gridCol} />
            <View style={styles.gridCol} />
          </View>
        )}

        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <IconButton
              icon="chevron-left"
              iconColor="white"
              size={32}
              onPress={() => router.back()}
            />
            <View style={styles.centerInfo}>
              <Text style={styles.headerTitle}>HILAL TRACKER</Text>
              <Text style={styles.locationText}>LIVE AUGMENTED REALITY</Text>
            </View>
            <IconButton
              icon={showGrid ? "grid" : "grid-off"}
              iconColor="white"
              size={24}
              onPress={() => setShowGrid(!showGrid)}
            />
          </View>

          {(moonLeft > -50 && moonLeft < width + 50) && (
            <View style={[styles.moonMarker, { left: moonLeft - 40, top: moonTop - 40 }]}>
              <View style={styles.markerCircle}>
                <IconButton icon="moon-waning-crescent" iconColor="#FFD700" size={32} />
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerText}>PREDICTED HILAL</Text>
                <Text style={styles.markerSubtext}>Alt: {moonPos.altitude.toFixed(1)}° | Az: {moonPos.azimuth.toFixed(1)}°</Text>
              </View>
            </View>
          )}

          <View style={styles.rightControls}>
            <Text style={styles.exposureLabel}>EXP</Text>
            <View style={styles.exposureSliderContainer}>
              {[1.0, 0.75, 0.5, 0.25, 0.0].map((val) => (
                <TouchableOpacity 
                  key={val} 
                  style={[styles.exposureTick, exposure === val && styles.activeExposureTick]} 
                  onPress={() => setExposure(val)}
                />
              ))}
            </View>
            <Text style={styles.exposureValue}>{(exposure * 2 - 1).toFixed(1)}</Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.sensorInfo}>
              <View style={styles.sensorItem}>
                <Text style={styles.sensorLabel}>AZIMUTH</Text>
                <Text style={styles.sensorValue}>{orientation.azimuth.toFixed(1)}°</Text>
              </View>
              <View style={[styles.sensorItem, styles.sensorDivider]}>
                <Text style={styles.sensorLabel}>STABILITY</Text>
                <Text style={styles.sensorValue}>OPTIMAL</Text>
              </View>
            </View>

            <View style={styles.captureContainer}>
              <TouchableOpacity style={styles.captureOuter} onPress={takePicture}>
                <View style={[styles.captureInner, {backgroundColor: theme.colors.primary}]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
  },
  gridRow: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  gridCol: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    height: '100%',
    position: 'absolute',
    left: '33.33%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  locationText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  moonMarker: {
    position: 'absolute',
    alignItems: 'center',
    width: 80,
  },
  markerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  markerLabel: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  markerText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '900',
  },
  markerSubtext: {
    color: '#fff',
    fontSize: 8,
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 100,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 15,
    borderRadius: 20,
    width: 40,
  },
  exposureLabel: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exposureSliderContainer: {
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exposureTick: {
    width: 8,
    height: 2,
    backgroundColor: '#555',
  },
  activeExposureTick: {
    width: 16,
    height: 3,
    backgroundColor: '#FFD700',
  },
  exposureValue: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
  },
  bottomSection: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  sensorInfo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sensorItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  sensorDivider: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  sensorLabel: {
    color: '#888',
    fontSize: 8,
    fontWeight: 'bold',
  },
  sensorValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  permissionButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
