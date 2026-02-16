import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { apiClient } from '../../utils/api';
import { setCredentials } from '../../store/authSlice';
import { useAppDispatch } from '../../store';
import { colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ email: '', password: '', username: '', display_name: '' });
  const dispatch = useAppDispatch();

  const handleRegister = async () => {
    try {
      const { data } = await apiClient.post('/auth/register', form);
      dispatch(setCredentials({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken, user: data.user }));
    } catch (e: any) {
      Alert.alert('Registration failed', e.response?.data?.error ?? 'Please try again');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {(['email','username','display_name','password'] as const).map(field => (
        <TextInput key={field} style={styles.input} placeholder={field.replace('_',' ')}
          value={form[field]} onChangeText={v => setForm(p => ({ ...p, [field]: v }))}
          secureTextEntry={field==='password'} autoCapitalize="none" />
      ))}
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  title:     { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 32 },
  input:     { backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  btn:       { backgroundColor: colors.accent, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#FFF', fontWeight: '700', fontSize: 16 },
  link:      { textAlign: 'center', color: colors.primary, marginTop: 16, fontSize: 14 },
});
