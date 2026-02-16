/**
 * LoginScreen.tsx — Email/password login. Dispatches setCredentials on success.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../utils/api';
import { setCredentials } from '../../store/authSlice';
import { useAppDispatch } from '../../store';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      await AsyncStorage.setItem('accessToken', data.tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', data.tokens.refreshToken);
      dispatch(setCredentials({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken, user: data.user }));
    } catch {
      Alert.alert('Login failed', 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title:     { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 32 },
  input:     { backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  btn:       { backgroundColor: colors.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#FFF', fontWeight: '700', fontSize: 16 },
  link:      { textAlign: 'center', color: colors.primary, marginTop: 16, fontSize: 14 },
});
