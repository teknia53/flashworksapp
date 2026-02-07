import { useState, useCallback } from 'react';
import { LayoutChangeEvent } from 'react-native';

/**
 * Dynamically scales font size to fit container width.
 * Returns a fontSize and an onLayout callback.
 */
export function useDynamicFontSize(
  text: string,
  baseFontSize: number,
  minFontSize: number = 18
): { fontSize: number; onLayout: (e: LayoutChangeEvent) => void } {
  const [fontSize, setFontSize] = useState(baseFontSize);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const containerWidth = e.nativeEvent.layout.width;
      // Rough heuristic: Greek chars average ~0.6x font size width
      const charWidth = baseFontSize * 0.55;
      const maxChars = containerWidth / charWidth;
      if (text.length > maxChars) {
        const scaled = Math.max(minFontSize, (containerWidth / text.length) / 0.55);
        setFontSize(Math.floor(scaled));
      } else {
        setFontSize(baseFontSize);
      }
    },
    [text, baseFontSize, minFontSize]
  );

  return { fontSize, onLayout };
}
