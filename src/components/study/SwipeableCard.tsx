import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  enabled: boolean;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableCard({ children, onSwipeRight, onSwipeLeft, enabled }: SwipeableCardProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(onSwipeLeft)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value / 20}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
