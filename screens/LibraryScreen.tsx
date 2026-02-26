import {
  LibraryEmptyState,
  LibraryImportSection,
  LibraryListSection,
} from '@/components/library';
import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { audiobooks, isLoading } = useAudiobook();

  const styles = useMemo(() => createStyles(colors), [colors]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingTitle}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LibraryImportSection />

      {audiobooks.length === 0 ? (
        <LibraryEmptyState
          emptyTitle={t('library.empty')}
          description={t('library.emptyDescription')}
          tipText={t('library.tips.import')}
        />
      ) : (
        <LibraryListSection />
      )}
    </View>
  );
}

const createStyles = (colors: { background: string; textSecondary: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.textSecondary,
    },
  });
