import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { HilalCard } from '../components/HilalCard';
import { calculateMoonPosition, MoonPosition } from '../services/astronomyService';
import { DeviceLocation, getCurrentLocation } from '../services/locationService';

export default function HomeScreen() {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [moonData, setMoonData] = useState<MoonPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    async function init() {
      try {
        const loc = await getCurrentLocation();
        setLocation(loc);
        const data = calculateMoonPosition(loc.latitude, loc.longitude, new Date());
        setMoonData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#0B0E14' }]}>
        <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
        <Text style={{ marginTop: 20, color: '#aaa' }}>Calculating Hilal Position...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            HILAL<Text style={{ color: theme.colors.primary }}> CAMERA</Text>
          </Text>
          <Text style={styles.subtitle}>Precision Moon Tracking & Detection</Text>
        </View>
        
        <HilalCard 
          title="Condition Today"
          altitude={moonData?.moonAltitude}
          elongation={moonData?.elongation}
          probability={moonData?.visibilityScore}
          locationInfo={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : undefined}
          dateInfo={new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        />

        <View style={styles.actionContainer}>
          <Button 
            mode="contained" 
            onPress={() => router.push('/camera')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="camera-iris"
          >
            Open Detection Camera
          </Button>
          <Text style={styles.hint}>Point your camera towards the western horizon at sunset</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontSize: 32,
  },
  subtitle: {
    color: '#888',
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hint: {
    color: '#555',
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  }
});
