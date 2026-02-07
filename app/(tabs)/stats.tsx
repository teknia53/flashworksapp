import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

export default function StatsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: 'Inter-Bold' }]}>
        Stats
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
        Session statistics will appear here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 8 },
  subtitle: { fontSize: 16 },
});
