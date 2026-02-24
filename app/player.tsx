import PlayerScreen from '@/screens/PlayerScreen';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export default function Player() {
  const router = useRouter();

  // On Android, Modal blocks touch events (e.g. slider drag). Use Stack only so the player
  // stays in the same view hierarchy and PanResponder/touches work.
  return <PlayerScreen />;
}
