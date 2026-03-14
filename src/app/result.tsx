import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text, Title, useTheme } from 'react-native-paper';
import { calculateHilalVisibilityScore } from '../services/astronomyService';
import { DetectionResult, detectThinBrightCurve } from '../vision/hilalDetection';

export default function ResultScreen() {
  const { uri, exposure } = useLocalSearchParams<{ uri: string, exposure: string }>();
  const [visionData, setVisionData] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalResult, setFinalResult] = useState<{ probability: number; status: string } | null>(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    async function analyze() {
      if (uri) {
        try {
          const expVal = exposure ? parseFloat(exposure) : 0.5;
          const result = await detectThinBrightCurve(uri, expVal);
          setVisionData(result);
          const combined = calculateHilalVisibilityScore(45, result.brightnessScore, result.curveScore);
          setFinalResult(combined);
        } catch (err) {
          console.error("Analysis failed:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    analyze();
  }, [uri]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#0B0E14' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: '#aaa' }}>Analyzing Hilal Image...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === 'high') return '#4CAF50';
    if (status === 'medium') return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { backgroundColor: '#161B22' }]}>
        <Card.Cover source={{ uri }} style={styles.cover} />
        <Card.Content style={styles.content}>
          <View style={styles.resultHeader}>
            <Title style={styles.title}>Detection Probability</Title>
            <Text 
              style={[styles.probabilityText, { color: getStatusColor(finalResult?.status || 'low') }]}
            >
              {finalResult?.probability.toFixed(1)}%
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(finalResult?.status || 'low') + '22', borderColor: getStatusColor(finalResult?.status || 'low') }]}>
              <Text style={[styles.statusText, { color: getStatusColor(finalResult?.status || 'low') }]}>
                {finalResult?.status.toUpperCase()} CONFIDENCE
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <Title style={styles.detailTitle}>Detailed Metrics</Title>
          <View style={styles.row}>
            <Text style={styles.label}>Brightness Analysis</Text>
            <Text style={styles.value}>{visionData?.brightnessScore.toFixed(1)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Curve Pattern Match</Text>
            <Text style={styles.value}>{visionData?.curveScore.toFixed(1)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Astronomy Model</Text>
            <Text style={styles.value}>45.0%</Text>
          </View>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={() => router.replace('/')} 
            style={styles.doneButton}
            labelStyle={styles.buttonLabel}
          >
            Finished
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0B0E14',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cover: {
    height: 200,
  },
  content: {
    paddingTop: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#aaa',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  probabilityText: {
    fontSize: 56,
    fontWeight: '900',
    marginVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 24,
  },
  detailTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    color: '#888',
    fontSize: 13,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actions: {
    padding: 16,
  },
  doneButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  }
});
