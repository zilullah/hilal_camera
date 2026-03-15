import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      console.log('Original photo captured at URI:', photo.uri);
      
      try {
        // Copy to documentDirectory for stability (cache can be cleared)
        const filename = photo.uri.split('/').pop();
        const newUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({
          from: photo.uri,
          to: newUri
        });
        console.log('Photo copied to stable URI:', newUri);
        
        router.push({
          pathname: '/result',
          params: { uri: newUri, exposure: exposure.toString() }
        });
      } catch (err) {
        console.error("Failed to copy photo to stable storage:", err);
        // Fallback to original URI if copy fails
        router.push({
          pathname: '/result',
          params: { uri: photo.uri, exposure: exposure.toString() }
        });
      }
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
      />
      
      {showGrid && (
        <View style={styles.gridContainer} pointerEvents="none">
          <View style={styles.gridRow} />
          <View style={styles.gridRow} />
          <View style={styles.gridCol} />
          <View style={[styles.gridCol, { left: '66.66%' }]} />
        </View>
      )}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* Top Bar Actions */}
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

        {/* Moon Marker */}
        {(moonLeft > -50 && moonLeft < width + 50) && (
          <View style={[styles.moonMarker, { left: moonLeft - 40, top: moonTop - 40 }]}>
            <View style={styles.markerCircle}>
              <IconButton icon="moon-waning-crescent" iconColor="#FFD700" size={32} />
            </View>
            <View style={styles.markerLabel}>
              <Text style={styles.markerText}>PREDICTED HILAL</Text>
              <Text style={styles.markerSubtext}>
                Alt: {moonPos.altitude.toFixed(1)}° | Az: {moonPos.azimuth.toFixed(1)}°
              </Text>
            </View>
          </View>
        )}

        {/* Side Controls */}
        <View style={styles.bottomArea}>
          <View style={styles.exposureArea}>
            <IconButton icon="minus" iconColor="white" onPress={() => setExposure(Math.max(0, exposure - 0.1))} />
            <Text style={styles.exposureText}>EV {exposure.toFixed(1)}</Text>
            <IconButton icon="plus" iconColor="white" onPress={() => setExposure(Math.min(1, exposure + 0.1))} />
          </View>

          <View style={styles.captureRow}>
            <IconButton icon="image-multiple" size={30} iconColor="white"  onPress={() => {}} />
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <IconButton icon="cog" size={30} iconColor="white" onPress={() => {}} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  locationText: {
    color: '#FFD700',
    fontSize: 9,
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
    textAlign: 'center',
  },
  bottomArea: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  exposureArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  exposureText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
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
