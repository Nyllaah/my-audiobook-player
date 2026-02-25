import { useAudiobook } from '@/context/AudiobookContext';
import { useLanguage } from '@/context/LanguageContext';
import React, { useCallback, useState } from 'react';
import { ChapterListModal } from './ChapterListModal';
import { PlayerChapterButton } from './PlayerChapterButton';

export function PlayerChapterSection() {
  const { t } = useLanguage();
  const { currentBook, playAudiobook } = useAudiobook();
  const [showChapters, setShowChapters] = useState(false);

  const hasMultipleParts =
    currentBook?.parts && currentBook.parts.length > 1;
  const currentPartIndex = currentBook?.currentPart ?? 0;
  const parts = currentBook?.parts ?? [];

  const handleSelectChapter = useCallback(
    async (partIndex: number) => {
      if (!currentBook?.parts) return;
      const updatedBook = {
        ...currentBook,
        currentPart: partIndex,
        uri: currentBook.parts[partIndex].uri,
        currentPosition: 0,
      };
      await playAudiobook(updatedBook);
      setShowChapters(false);
    },
    [currentBook, playAudiobook]
  );

  if (!hasMultipleParts) return null;

  return (
    <>
      <PlayerChapterButton
        currentPartIndex={currentPartIndex}
        totalParts={parts.length}
        partLabel={t('player.part', {
          current: currentPartIndex + 1,
          total: parts.length,
        })}
        onPress={() => setShowChapters(true)}
      />
      <ChapterListModal
        visible={showChapters}
        title={t('player.selectPart')}
        parts={parts}
        currentPartIndex={currentPartIndex}
        partNumberLabel={(number) => t('player.partNumber', { number })}
        onSelectPart={handleSelectChapter}
        onClose={() => setShowChapters(false)}
      />
    </>
  );
}
