import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme, spacing } from '@/src/theme';

interface SettingRowProps {
  label: string;
  value?: string;
  toggle?: boolean;
  onToggle?: (val: boolean) => void;
  children?: React.ReactNode;
  last?: boolean;
}

export function SettingRow({ label, value, toggle, onToggle, children, last }: SettingRowProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text, fontFamily: 'Inter' }]}>{label}</Text>
      {toggle !== undefined && onToggle && (
        <Switch
          value={toggle}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      )}
      {value !== undefined && (
        <Text style={[styles.value, { color: colors.textSecondary, fontFamily: 'Inter' }]}>{value}</Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  label: { fontSize: 16, flex: 1 },
  value: { fontSize: 16 },
});
