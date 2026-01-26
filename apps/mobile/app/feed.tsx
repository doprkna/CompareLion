import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getToken } from '@/utils/auth';

// TODO: replace with API fetch
// TODO: add pull-to-refresh
// TODO: integrate story ranking

const MOCK_STORIES = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: `Story #${i + 1}`,
  preview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
}));

export default function FeedScreen() {
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

  const handleStoryPress = (id: string) => {
    router.push(`/story/${id}`);
  };

  const renderItem = ({ item }: { item: typeof MOCK_STORIES[0] }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item.id)}
    >
      <Text style={styles.storyTitle}>{item.title}</Text>
      <Text style={styles.storyPreview}>{item.preview}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
      </View>
      <FlatList
        data={MOCK_STORIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  storyItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  storyPreview: {
    fontSize: 14,
    color: '#666',
  },
});

