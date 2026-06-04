import React, { useCallback, useMemo, useState } from 'react';
import { GuidelinesChat } from '../guidelines/GuidelinesChat';
import {
  GUIDELINE_COLLECTIONS,
  loadGuidelineCollectionData,
  loadGuidelineCollectionSources,
  type GuidelineCollection,
  type GuidelineCollectionData,
  type GuidelineLanguage,
} from '../guidelines/guidelinesData';

export const MedicalAssistantPage: React.FC<{
  onBack?: () => void;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
}> = ({ doctorName, doctorSpecialty }) => {
  const [language, setLanguage] = useState<GuidelineLanguage>('ar');

  // Book picker state — managed here so the chat component can search within a specific book
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [collectionData, setCollectionData] = useState<GuidelineCollectionData | null>(null);
  const [sourcesByCollectionId, setSourcesByCollectionId] = useState<Record<string, GuidelineCollection['sources']>>({});

  const selectedCollection = useMemo(() => {
    if (!selectedCollectionId) return null;
    const collection = GUIDELINE_COLLECTIONS.find(c => c.id === selectedCollectionId) ?? null;
    if (!collection) return null;
    return { ...collection, sources: sourcesByCollectionId[collection.id] ?? collection.sources };
  }, [selectedCollectionId, sourcesByCollectionId]);

  const handleSelectSource = useCallback(async (collectionId: string, sourceId: string) => {
    if (!collectionId || !sourceId) {
      // Clear selection
      setSelectedCollectionId('');
      setSelectedSourceId('');
      setCollectionData(null);
      return;
    }

    setSelectedCollectionId(collectionId);
    setSelectedSourceId(sourceId);

    // Ensure sources are loaded for this collection
    if (!sourcesByCollectionId[collectionId]) {
      try {
        const sources = await loadGuidelineCollectionSources(collectionId);
        setSourcesByCollectionId(prev => ({ ...prev, [collectionId]: sources }));
      } catch {
        // Continue without sources
      }
    }

    // Load collection data for search context
    try {
      const data = await loadGuidelineCollectionData(collectionId);
      setCollectionData(data);
    } catch {
      setCollectionData(null);
    }
  }, [sourcesByCollectionId]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <GuidelinesChat
        language={language}
        onLanguageChange={setLanguage}
        selectedCollection={selectedCollection}
        selectedSourceId={selectedSourceId}
        collectionData={collectionData}
        doctorName={doctorName}
        doctorSpecialty={doctorSpecialty}
        isEmbedded={true}
        showBookPicker={true}
        onSelectSource={handleSelectSource}
      />
    </div>
  );
};
