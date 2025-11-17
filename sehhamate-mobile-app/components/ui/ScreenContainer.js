import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colorUtils';

export default function ScreenContainer({ children, style }) {
  console.log('ScreenContainer - Rendering screen container');
  
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
  },
});
