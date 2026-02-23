import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { apiMentees } from './apiService';

const MenteesScreen = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Replace with real token from auth context or storage
    const token = null;
    apiMentees.getAll(token)
      .then(setMentees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.centered} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mentees</Text>
      <FlatList
        data={mentees}
        keyExtractor={(item) => item.id?.toString() || item.email}
        renderItem={({ item }) => (
          <View style={styles.menteeItem}>
            <Text style={styles.menteeName}>{item.name || item.email}</Text>
            {item.email && <Text style={styles.menteeEmail}>{item.email}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text>No mentees found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  menteeItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menteeName: { fontSize: 18 },
  menteeEmail: { fontSize: 14, color: '#888' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});

export default MenteesScreen;
