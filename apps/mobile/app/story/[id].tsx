import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { getToken } from '@/utils/auth';

// TODO: fetch story blocks from backend
// TODO: render panels
// TODO: integrate reaction engine

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    // Guard: redirect if no token
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Story {id}</Text>
        
        {/* Placeholder for story content */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Story content will appear here</Text>
        </View>

        {/* Placeholder for reactions */}
        <View style={styles.reactions}>
          <Text style={styles.reactionsLabel}>Reactions:</Text>
          <View style={styles.reactionButtons}>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>🔥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>😂</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>💩</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Placeholder sections */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Stickers: (TODO)</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Panels: (TODO)</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Progress: (TODO)</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Comments: (Future)</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#f5f5f5',
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  reactions: {
    marginBottom: 24,
  },
  reactionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reactionButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  section: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
  },
});

