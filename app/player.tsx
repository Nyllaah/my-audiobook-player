import PlayerScreen from '@/screens/PlayerScreen';
import { useRouter } from 'expo-router';
import { Modal, Platform } from 'react-native';

export default function Player() {
  const router = useRouter();

  // On Android, wrap in Modal for slide animation
  if (Platform.OS === 'android') {
    return (
      <Modal
        visible={true}
        animationType="slide"
        onRequestClose={() => router.back()}
        statusBarTranslucent={true}
      >
        <PlayerScreen />
      </Modal>
    );
  }

  // On iOS, use Stack navigation modal
  return <PlayerScreen />;
}
