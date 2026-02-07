import * as Haptics from 'expo-haptics';

export function useHaptics() {
  return {
    right: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    wrong: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    reveal: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  };
}
