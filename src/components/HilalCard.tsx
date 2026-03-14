import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Title, useTheme } from 'react-native-paper';

interface StatRowProps {
  label: string;
  value: string | number;
  isPrimary?: boolean;
}

const StatRow = ({ label, value, isPrimary }: StatRowProps) => {
  const theme = useTheme();
  return (
    <View style={styles.statRow}>
      <Text style={styles.label}>{label}</Text>
      <Text 
        variant={isPrimary ? "headlineSmall" : "titleMedium"} 
        style={[styles.value, isPrimary ? { color: theme.colors.primary, fontWeight: '900' } : { color: '#fff' }]}
      >
        {value}
      </Text>
    </View>
  );
};

interface HilalCardProps {
  title?: string;
  altitude?: number;
  elongation?: number;
  probability?: number;
  locationInfo?: string;
  dateInfo?: string;
}

export const HilalCard = ({ 
  title = "Visibility Stats", 
  altitude, 
  elongation, 
  probability,
  locationInfo,
  dateInfo 
}: HilalCardProps) => {
  const theme = useTheme();
  
  return (
    <Card style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
      <Card.Content>
        <Title style={styles.cardTitle}>{title}</Title>
        <View style={styles.statsContainer}>
          {altitude !== undefined && <StatRow label="Moon Altitude" value={`${altitude.toFixed(2)}°`} />}
          {elongation !== undefined && <StatRow label="Elongation" value={`${elongation.toFixed(2)}°`} />}
          
          <View style={styles.divider} />
          
          {probability !== undefined && (
            <View style={styles.probabilityContainer}>
              <Text style={styles.probabilityLabel}>Visibility Score</Text>
              <Text style={[styles.probabilityValue, { color: theme.colors.primary }]}>
                {probability.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        
        {(locationInfo || dateInfo) && (
          <View style={styles.footer}>
            {locationInfo && <Text style={styles.footerText}>📍 {locationInfo}</Text>}
            {dateInfo && <Text style={styles.footerText}>📅 {dateInfo}</Text>}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsContainer: {
    paddingHorizontal: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
  },
  value: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  probabilityContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  probabilityLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  probabilityValue: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  footer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 11,
    color: '#888',
  }
});
