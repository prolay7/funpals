import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppSelector } from '../../store';
import { colors } from '../../theme/colors';

export default function ProfileScreen({ navigation }: any) {
  const user = useAppSelector(s => s.auth.user) as any;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={user?.photo_url ? { uri: user.photo_url } : require('../../assets/avatar_placeholder.png')}
          style={styles.avatar} />
        <Text style={styles.name}>{user?.display_name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header:    { alignItems: 'center', paddingTop: 60, paddingBottom: 24, backgroundColor: colors.primary },
  avatar:    { width: 96, height: 96, borderRadius: 48, backgroundColor: '#CCC', marginBottom: 12 },
  name:      { fontSize: 22, fontWeight: '700', color: '#FFF' },
  username:  { fontSize: 14, color: colors.accent },
  editBtn:   { margin: 24, backgroundColor: colors.accent, padding: 14, borderRadius: 12, alignItems: 'center' },
  editBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
