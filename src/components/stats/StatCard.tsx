import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius } from '@/src/theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={24} color={color ?? colors.primary} />
      <Text style={[styles.value, { color: color ?? colors.text, fontFamily: 'Inter-Bold' }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  value: { fontSize: 24 },
  label: { fontSize: 12 },
});
