import PlayerScreen from '@/screens/PlayerScreen';
import { useRouter } from 'expo-router';
import { Modal, Platform } from 'react-native';

export default function Player() {
  const router = useRouter();

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

  return <PlayerScreen />;
}
