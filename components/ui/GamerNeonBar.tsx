import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from 'theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GamerLedStripProps {
  isOnline?: boolean;     // Status do Servidor
  mode?: 'theme' | 'rainbow'; // Modo de cores quando tiver ONLINE
  height?: number;
  speed?: number;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GamerLedStrip({
  isOnline = true,
  mode = 'theme',
  height = 4,
  speed = 3000,
  glow = true,
  style,
}: GamerLedStripProps) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isOnline) {
      // Inicia a animação quando o servidor está ONLINE
      translateX.value = 0;
      translateX.value = withRepeat(
        withTiming(-SCREEN_WIDTH, {
          duration: speed,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      // Para a animação quando fica OFFLINE
      cancelAnimation(translateX);
      translateX.value = 0;
    }
  }, [isOnline, speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Cores do Tema ONLINE (Cyan & Green Neon)
  const themeColors = [
    Colors.primaryContainer, // Cyan #00D2FF
    Colors.secondary,        // Azul Claro
    Colors.tertiary,         // Verde/Menta Neon
    Colors.surfaceTint,      // Cyan Vibrante
    Colors.primaryContainer,
  ] as const;

  // Cores Rainbow ONLINE
  const rainbowColors = [
    '#FF0055',
    '#7A00FF',
    '#00E5FF',
    '#00FF66',
    '#FFBE0B',
    '#FF0055',
  ] as const;

  // Cores OFFLINE (Azul/Cinza frio, estático, sem animação)
  const offlineColors = [
    '#1B1F2B',
    '#262A36',
    '#313441',
    '#262A36',
    '#1B1F2B',
  ] as const;

  // Seleção dinâmica das cores de acordo com o status do servidor
  const activeColors = !isOnline
    ? offlineColors
    : mode === 'rainbow'
    ? rainbowColors
    : themeColors;

  const mainGlowColor = !isOnline
    ? '#262A36'
    : mode === 'rainbow'
    ? '#00E5FF'
    : Colors.primaryContainer;

  return (
    <View style={[styles.container, { height }, style]}>
      <View
        style={[
          styles.ledTrack,
          { height },
          glow && {
            shadowColor: mainGlowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isOnline ? 1 : 0.2, // Glow suave ou apagado quando offline
            shadowRadius: isOnline ? 8 : 2,
            elevation: isOnline ? 8 : 1,
          },
        ]}
      >
        <Animated.View style={[styles.gradientRow, isOnline && animatedStyle]}>
          <LinearGradient
            colors={activeColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: SCREEN_WIDTH, height: '100%' }}
          />
          <LinearGradient
            colors={activeColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: SCREEN_WIDTH, height: '100%' }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  ledTrack: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  gradientRow: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
    height: '100%',
  },
});