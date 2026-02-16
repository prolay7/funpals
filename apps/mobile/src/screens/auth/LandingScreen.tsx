import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function LandingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Funpals</Text>
      <Text style={styles.subtitle}>Find your people, nearby</Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.btnText}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.btnText, { color: colors.primary }]}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title:        { fontSize: 48, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle:     { fontSize: 16, color: colors.accent, marginBottom: 48 },
  btnPrimary:   { backgroundColor: colors.accent, width: '100%', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#FFFFFF', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText:      { fontWeight: '700', fontSize: 16, color: '#FFFFFF' },
});
