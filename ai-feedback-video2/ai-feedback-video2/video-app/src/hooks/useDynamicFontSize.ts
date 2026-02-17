import { useMemo } from 'react';

interface DynamicFontSizeConfig {
  text: string | string[];
  baseFontSize: number;
  minFontSize?: number;
  maxFontSize?: number;
  containerWidth?: number;
  containerHeight?: number;
  lineHeight?: number;
  estimatedCharsPerLine?: number;
}

/**
 * Calculates optimal font size that fits within container constraints
 * Dynamically scales up for short text, down for long text
 */
/**
 * Calculates optimal font size that fits within container constraints
 * Simple, conservative approach - only scales font size, never changes layout
 */
export const useDynamicFontSize = ({
  text,
  baseFontSize,
  minFontSize = baseFontSize * 0.75, // Max 25% smaller
  maxFontSize = baseFontSize * 1.35,  // Max 35% larger (conservative)
  containerWidth,
  containerHeight,
  lineHeight = 1.6,
  estimatedCharsPerLine = 50,
}: DynamicFontSizeConfig): number => {
  return useMemo(() => {
    const textContent = Array.isArray(text) ? text.join(' ') : text;
    const textLength = textContent.trim().length;

    if (textLength === 0) return baseFontSize;

    // Simple length-based scaling
    let scaleFactor = 1.0;
    
    if (textLength < 100) {
      // Short text: scale up moderately
      scaleFactor = 1.35;
    } else if (textLength < 200) {
      // Medium-short: scale up slightly
      scaleFactor = 1.15;
    } else if (textLength < 300) {
      // Medium: use base
      scaleFactor = 1.0;
    } else if (textLength < 450) {
      // Medium-long: scale down slightly
      scaleFactor = 0.9;
    } else {
      // Long: scale down more
      scaleFactor = 0.75;
    }

    let fontSize = baseFontSize * scaleFactor;
    
    // Enforce bounds
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
    
    return Math.round(fontSize);
  }, [text, baseFontSize, minFontSize, maxFontSize, containerWidth, containerHeight, lineHeight, estimatedCharsPerLine]);
};

/**
 * Simpler variant for list items with count-based scaling
 */
/**
 * Simpler variant for list items with count-based scaling
 * Conservative scaling to avoid layout breaks
 */
export const useDynamicListFontSize = (
  itemCount: number,
  baseFontSize: number,
  minFontSize?: number,
  maxFontSize?: number
): number => {
  return useMemo(() => {
    const min = minFontSize || baseFontSize * 0.8;
    const max = maxFontSize || baseFontSize * 1.3; // Conservative

    let scaleFactor: number;
    
    if (itemCount <= 3) {
      scaleFactor = 1.3; // 30% larger for few items
    } else if (itemCount <= 5) {
      scaleFactor = 1.1; // 10% larger
    } else if (itemCount <= 7) {
      scaleFactor = 1.0; // Base size
    } else if (itemCount <= 10) {
      scaleFactor = 0.9; // 10% smaller
    } else {
      scaleFactor = 0.8; // 20% smaller for many items
    }

    const fontSize = baseFontSize * scaleFactor;
    return Math.round(Math.max(min, Math.min(max, fontSize)));
  }, [itemCount, baseFontSize, minFontSize, maxFontSize]);
};
