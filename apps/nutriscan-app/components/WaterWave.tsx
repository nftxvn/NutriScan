import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Defs, ClipPath, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WaterWaveProps {
  /** Fill percentage (0-100) */
  fillPercentage: number;
  /** Width of the container */
  width: number;
  /** Height of the container */
  height: number;
  /** Fill color */
  color?: string;
  /** Wave amplitude (height of wave peaks) */
  amplitude?: number;
  /** Wave frequency (number of waves) */
  frequency?: number;
  /** Initial phase offset in radians (for layered waves) */
  initialPhase?: number;
}

/**
 * An animated water wave fill component.
 * Renders a sine wave at the top of the fill that animates horizontally.
 */
export const WaterWave: React.FC<WaterWaveProps> = ({
  fillPercentage,
  width,
  height,
  color = "#d3f660",
  amplitude = 8,
  frequency = 1.5,
  initialPhase = 0,
}) => {
  // Clamp fill percentage
  const clampedFill = Math.min(100, Math.max(0, fillPercentage));
  
  // Calculate fill height (from bottom)
  const fillHeight = (clampedFill / 100) * height;
  const waveY = height - fillHeight;

  // Animation offset (0 to 2*PI for one full wave cycle)
  const phaseAnim = useSharedValue(initialPhase);

  useEffect(() => {
    phaseAnim.value = withRepeat(
      withTiming(initialPhase + Math.PI * 2, {
        duration: 3000, // Slower for more fluid feel
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // No reverse
    );
  }, [initialPhase]);

  // Generate animated wave path with multiple overlapping sine waves
  const animatedProps = useAnimatedProps(() => {
    const points: string[] = [];
    const step = 2; // Pixel step for smoothness

    // Start at bottom-left
    points.push(`M 0 ${height}`);

    // Draw wave from left to right at waveY level
    // Use multiple sine waves with harmonic frequencies for seamless loop
    for (let x = 0; x <= width; x += step) {
      // Primary wave
      const wave1 = Math.sin((x / width) * Math.PI * 2 * frequency + phaseAnim.value) * amplitude;
      // Secondary wave (2x frequency for seamless loop)
      const wave2 = Math.sin((x / width) * Math.PI * 2 * frequency * 2 + phaseAnim.value * 2) * (amplitude * 0.35);
      // Tertiary wave (3x frequency for seamless loop)
      const wave3 = Math.sin((x / width) * Math.PI * 2 * frequency * 3 - phaseAnim.value) * (amplitude * 0.15);
      
      const y = waveY + wave1 + wave2 + wave3;
      points.push(`L ${x} ${y}`);
    }

    // Close path: go to bottom-right, then bottom-left
    points.push(`L ${width} ${height}`);
    points.push(`L 0 ${height}`);
    points.push("Z");

    return {
      d: points.join(" "),
    };
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <AnimatedPath animatedProps={animatedProps} fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default WaterWave;
