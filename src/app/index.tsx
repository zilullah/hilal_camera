import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { HilalCard } from '../components/HilalCard';
import { calculateMoonPosition, MoonPosition } from '../services/astronomyService';
import { DeviceLocation, getCurrentLocation } from '../services/locationService';

export default function HomeScreen() {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [moonData, setMoonData] = useState<MoonPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'id' ? 'en' : 'id';
    i18n.changeLanguage(nextLang);
  };

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
        <Text style={{ marginTop: 20, color: '#aaa' }}>{t('calculating_hilal')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topActions}>
        <IconButton 
          icon="translate" 
          mode="contained"
          containerColor="rgba(255,255,255,0.05)"
          iconColor={theme.colors.primary}
          size={24}
          onPress={toggleLanguage}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {t('welcome_title').split(' ')[0]}<Text style={{ color: theme.colors.primary }}> {t('welcome_title').split(' ')[1]}</Text>
          </Text>
          <Text style={styles.subtitle}>{t('welcome_subtitle')}</Text>
        </View>
        
        <HilalCard 
          title={t('condition_today')}
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
            {t('open_camera')}
          </Button>
          <Text style={styles.hint}>{t('point_camera_hint')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  topActions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 50,
    right: 0,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  content: {
    padding: 24,
    paddingTop: 80,
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
