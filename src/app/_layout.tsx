import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';

// Keep the native splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFD700',
    secondary: '#1E90FF',
    background: '#0B0E14',
    surface: '#161B22',
  },
};

function AppSplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation sequence
    Animated.sequence([
      // 1. Fade in + scale up the icon
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // 2. Fade in the text
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 3. Pulse glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        { iterations: 2 }
      ),
    ]).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View style={splashStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />

      {/* Stars background dots */}
      <View style={splashStyles.starsContainer}>
        {[...Array(30)].map((_, i) => (
          <View
            key={i}
            style={[
              splashStyles.star,
              {
                left: `${(i * 37 + 11) % 100}%` as any,
                top: `${(i * 53 + 7) % 100}%` as any,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                opacity: 0.3 + (i % 5) * 0.12,
              }
            ]}
          />
        ))}
      </View>

      {/* Glow backdrop */}
      <Animated.View style={[splashStyles.glowBackdrop, { opacity: glowOpacity }]} />

      {/* Icon */}
      <Animated.View
        style={[
          splashStyles.iconWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Image
          source={require('../../assets/images/icon.png')}
          style={splashStyles.icon}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Title & subtitle */}
      <Animated.View style={[splashStyles.textContainer, { opacity: textFadeAnim }]}>
        <Text style={splashStyles.title}>
          HILAL<Text style={splashStyles.titleAccent}> CAMERA</Text>
        </Text>
        <Text style={splashStyles.subtitle}>Precision Moon Tracking & Detection</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[splashStyles.loaderContainer, { opacity: textFadeAnim }]}>
        <View style={splashStyles.loaderBar}>
          <Animated.View
            style={[
              splashStyles.loaderFill,
              {
                opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
              }
            ]}
          />
        </View>
        <Text style={splashStyles.loaderText}>Initializing AI Engine...</Text>
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  const [tfReady, setTfReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const appFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function initApp() {
      // Hide native splash screen immediately and show our custom one
      await SplashScreen.hideAsync();
      // Initialize TensorFlow
      await tf.ready();
      setTfReady(true);
      // Minimum splash display time of 2.5s for brand visibility
      await new Promise(r => setTimeout(r, 2500));
      setSplashDone(true);
      // Fade in the main content
      Animated.timing(appFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    initApp();
  }, []);

  if (!splashDone) {
    return <AppSplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <Animated.View style={{ flex: 1, opacity: appFade }}>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
        <Stack screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B0E14' }
        }} />
      </PaperProvider>
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  glowBackdrop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFD700',
    opacity: 0.06,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
    elevation: 0,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 32,
  },
  icon: {
    width: 160,
    height: 160,
    borderRadius: 36,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  titleAccent: {
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    width: '60%',
  },
  loaderBar: {
    width: '100%',
    height: 2,
    backgroundColor: '#1E2733',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loaderFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  loaderText: {
    fontSize: 11,
    color: '#444',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
