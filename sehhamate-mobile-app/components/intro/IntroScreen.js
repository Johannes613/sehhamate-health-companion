import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const HealthLogo = ({ size = 140 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#00ff88" />
        <Stop offset="50%" stopColor="#4ECDC4" />
        <Stop offset="100%" stopColor="#45B7D1" />
      </SvgLinearGradient>
      <SvgLinearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#ff6b6b" />
        <Stop offset="100%" stopColor="#ee5a52" />
      </SvgLinearGradient>
    </Defs>
    
    {/* Main Health/Fitness Circle */}
    <Circle cx="12" cy="12" r="10" fill="url(#healthGrad)" opacity="0.9" />
    
    {/* Heart Icon */}
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="url(#heartGrad)"
      transform="scale(0.6) translate(4.8, 4.8)"
    />
    
    {/* Plus Sign for Medical */}
    <Path
      d="M11 7h2v10h-2V7zm-4 4h10v2H7v-2z"
      fill="#ffffff"
      opacity="0.8"
    />
  </Svg>
);

const IntroScreen = () => {
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const taglineOpacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Background orb animations
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start background orb animations
    const animateOrbs = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(orb1Anim, {
              toValue: 1,
              duration: 4000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(orb1Anim, {
              toValue: 0,
              duration: 4000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(orb2Anim, {
              toValue: 1,
              duration: 5000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(orb2Anim, {
              toValue: 0,
              duration: 5000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(orb3Anim, {
              toValue: 1,
              duration: 6000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(orb3Anim, {
              toValue: 0,
              duration: 6000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Start main entrance animation sequence
    const startAnimation = () => {
      Animated.sequence([
        // Logo scale and fade in
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        
        // Text fade in
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        
        // Tagline fade in
        Animated.timing(taglineOpacityAnim, {
          toValue: 1,
          duration: 600,
          delay: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // Start continuous pulse animation
      const startPulse = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      // Start subtle rotation
      const startRotation = () => {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 20000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      };

      startPulse();
      startRotation();
    };

    startAnimation();
    animateOrbs();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const orb2TranslateX = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const orb3Scale = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#1a2a1a', '#2d2d33', '#1a1a2a']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Background Orbs */}
      <Animated.View 
        style={[
          styles.orb1, 
          { 
            transform: [{ translateY: orb1TranslateY }],
            opacity: orb1Anim,
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.orb2, 
          { 
            transform: [{ translateX: orb2TranslateX }],
            opacity: orb2Anim,
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.orb3, 
          { 
            transform: [{ scale: orb3Scale }],
            opacity: orb3Anim,
          }
        ]} 
      />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim },
                { rotate: spin },
              ],
            }
          ]}
        >
          <HealthLogo size={140} />
        </Animated.View>

        {/* App Name */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacityAnim }]}>
          <Text style={styles.appName}>HealthSphere</Text>
          <Text style={styles.appSubname}>AI</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacityAnim }]}>
          <Text style={styles.tagline}>Your Personal Wellness Companion</Text>
          <Text style={styles.subTagline}>Powered by Artificial Intelligence</Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: taglineOpacityAnim }]}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: orb1Anim }]} />
            <Animated.View style={[styles.dot, { opacity: orb2Anim }]} />
            <Animated.View style={[styles.dot, { opacity: orb3Anim }]} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Floating orbs
  orb1: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.1,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  orb2: {
    position: 'absolute',
    top: height * 0.35,
    left: width * 0.05,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
  },
  orb3: {
    position: 'absolute',
    bottom: height * 0.25,
    right: width * 0.08,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(69, 183, 209, 0.1)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 136, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  appSubname: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00ff88',
    letterSpacing: 4,
    marginTop: 5,
    textAlign: 'center',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: 8,
  },
  subTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff88',
  },
});

export default IntroScreen;
