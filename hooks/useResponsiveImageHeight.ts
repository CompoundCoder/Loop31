import { useWindowDimensions } from 'react-native';

interface ResponsiveImageHeightArgs {
  aspectRatio: number | null;
  containerWidth: number;
  maxHeightPercent?: number;
}

interface ResponsiveImageHeightResult {
  height: number;
  wasCapped: boolean;
}

/**
 * Calculates a responsive and capped image height.
 * @param aspectRatio The width/height ratio of the image.
 * @param containerWidth The width of the container the image will fill.
 * @param maxHeightPercent The maximum percentage of the screen height the image can occupy.
 * @returns An object containing the calculated height and whether it was capped.
 */
export const useResponsiveImageHeight = ({
  aspectRatio,
  containerWidth,
  maxHeightPercent = 0.4,
}: ResponsiveImageHeightArgs): ResponsiveImageHeightResult => {
  const { height: windowHeight } = useWindowDimensions();
  const maxHeight = windowHeight * maxHeightPercent;

  if (!aspectRatio) {
    const fallbackHeight = containerWidth * (5 / 7);
    return {
      height: Math.min(fallbackHeight, maxHeight),
      wasCapped: fallbackHeight > maxHeight,
    };
  }

  const calculatedHeight = containerWidth / aspectRatio;
  const wasCapped = calculatedHeight > maxHeight;
  
  return {
    height: Math.min(calculatedHeight, maxHeight),
    wasCapped,
  };
}; 