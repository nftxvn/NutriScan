import React from "react";
import { View, StyleSheet, Dimensions, ViewStyle } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Image } from "react-native";

const { width, height } = Dimensions.get("window");

interface GlowBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Position of the glow: 'top-center', 'center', 'top-left', 'top-right' */
  glowPosition?: "top-center" | "center" | "top-left" | "top-right" | "dual-corner";
  /** Intensity of the glow (0-1), default 0.3 */
  intensity?: number;
  /** Color of the glow, default lime green */
  glowColor?: string;
  /** Secondary glow color (used for dual mode), default yellow */
  secondaryGlowColor?: string;
}

/**
 * A reusable background component that renders a dark background
 * with a subtle radial glow effect, similar to modern app designs.
 */
export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  children,
  style,
  glowPosition = "top-center",
  intensity = 0.35,
  glowColor = "#d3f660",
  secondaryGlowColor = "#b3ff4fff", // Default yellow
}) => {
  // Common background
  const bg = <Rect x="0" y="0" width="100%" height="100%" fill="#0A0A0A" />;

  let content;

  if (glowPosition === "dual-corner") {
     content = (
        <>
            <Defs>
                {/* 1. Yellow Top-Right */}
                <RadialGradient
                    id="glowTR"
                    cx="100%" cy="0%"
                    rx="60%" ry="50%"
                    fx="100%" fy="0%"
                >
                    <Stop offset="0%" stopColor={secondaryGlowColor} stopOpacity={intensity} />
                    <Stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
                </RadialGradient>
                {/* 2. Lime Bottom-Left */}
                <RadialGradient
                    id="glowBL"
                    cx="0%" cy="100%"
                    rx="60%" ry="50%"
                    fx="0%" fy="100%"
                >
                    <Stop offset="0%" stopColor={glowColor} stopOpacity={intensity} />
                    <Stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
                </RadialGradient>
            </Defs>
            {bg}
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowTR)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowBL)" />
        </>
     );
  } else {
     // Single point logic
      let cx = "50%";
      let cy = "30%";
      
      switch (glowPosition) {
        case "center": cx = "50%"; cy = "40%"; break;
        case "top-left": cx = "20%"; cy = "20%"; break;
        case "top-right": cx = "80%"; cy = "20%"; break;
        case "top-center": default: cx = "50%"; cy = "25%"; break;
      }

      content = (
          <>
            <Defs>
              <RadialGradient
                id="glowGradient"
                cx={cx} cy={cy}
                rx="60%" ry="50%"
                fx={cx} fy={cy}
              >
                <Stop offset="0%" stopColor={glowColor} stopOpacity={intensity} />
                <Stop offset="40%" stopColor={glowColor} stopOpacity={intensity * 0.5} />
                <Stop offset="100%" stopColor="#0A0A0A" stopOpacity="1" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowGradient)" />
          </>
      );
  }

  return (
    <View style={[styles.container, style]}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {content}
      </Svg>
      
      {/* Noise Overlay */}
      <Image 
        source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXVnbGxrKwAABCrSURBVEjHnZbbkqMgEIVHIiHZOzPb/3/bCxEcnbPTw1qnL6oP5d+F5F8iIn8lIv+V/Jj4+fh9+P34/fj9+P34/fj9+P34/fj9+P34/fj9+P34/fj9+P34/f/9/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/v3+/f79/z/8lIv8lIv8lIv8lIv8lIm8l" }}
        style={[StyleSheet.absoluteFill, { opacity: 0.04 }]}
        resizeMode="repeat"
      />
      
      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
});

export default GlowBackground;
