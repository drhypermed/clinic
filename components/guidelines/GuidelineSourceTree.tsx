import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LuChevronDown, LuFileText, LuFolder, LuFolderOpen, LuLock, LuLockOpen, LuSearch } from 'react-icons/lu';
import { GUIDELINE_COLLECTIONS, type GuidelineCollection, type GuidelineLanguage, loadGuidelineCollectionSources } from './guidelinesData';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .trim();

export const buildHighlightTerms = (value: string) =>
  value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);

export const localizeNumber = (text: string | number | undefined, isArabic: boolean): string => {
  if (text === undefined || text === null) return '';
  return String(text);
};

export const renderHighlightedText = (text: string, terms: string[], isArabic: boolean = false) => {
  if (terms.length === 0) return localizeNumber(text, isArabic);
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return text.split(pattern).map((part, index) => {
    const isMatch = terms.some((term) => part.localeCompare(term, undefined, { sensitivity: 'accent' }) === 0)
      || terms.some((term) => part.toLowerCase() === term.toLowerCase());
    if (!isMatch) return <React.Fragment key={`${part}-${index}`}>{localizeNumber(part, isArabic)}</React.Fragment>;
    return (
      <mark key={`${part}-${index}`} className="rounded bg-amber-200 px-1 font-black text-amber-950">
        {localizeNumber(part, isArabic)}
      </mark>
    );
  });
};

export const getCollectionFolders = (collection: GuidelineCollection) => {
  const hasFolders = collection.sources.some((source) => source.folderTitle);
  if (!hasFolders) return null;

  const map = new Map<string, { title: string; sources: GuidelineCollection['sources'] }>();
  for (const source of collection.sources) {
    const folderTitle = source.folderTitle ?? collection.school;
    const existing = map.get(folderTitle);
    if (existing) {
      existing.sources.push(source);
    } else {
      map.set(folderTitle, {
        title: folderTitle,
        sources: [source],
      });
    }
  }
  
  const folders = Array.from(map.values());
  folders.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  for (const folder of folders) {
    folder.sources.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  }
  
  return folders;
};

export const GuidelineSourceTree: React.FC<{
  language: GuidelineLanguage;
  selectedCollectionId: string;
  selectedSourceId: string;
  onSelectSource: (collectionId: string, source: GuidelineCollection['sources'][number]) => void;
  isFreeGuidelinesPlan?: boolean;
  onLockedGuidelineClick?: () => void;
  className?: string;
  autoFocusSearch?: boolean;
}> = ({
  language,
  selectedCollectionId,
  selectedSourceId,
  onSelectSource,
  isFreeGuidelinesPlan = false,
  onLockedGuidelineClick,
  className = '',
  autoFocusSearch = false,
}) => {
  const isArabic = language === 'ar';
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedSchool, setExpandedSchool] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [sourcesByCollectionId, setSourcesByCollectionId] = useState<Record<string, GuidelineCollection['sources']>>({});
  const [loadingSourcesByCollectionId, setLoadingSourcesByCollectionId] = useState<Record<string, boolean>>({});

  const isCollectionUnlocked = useCallback(
    (collectionId: string) => !isFreeGuidelinesPlan || collectionId === 'ada-2026',
    [isFreeGuidelinesPlan],
  );

  const handleLockedGuidelineClick = useCallback(() => {
    onLockedGuidelineClick?.();
  }, [onLockedGuidelineClick]);

  const getCollectionSources = useCallback(
    (collection: GuidelineCollection) => sourcesByCollectionId[collection.id] ?? collection.sources,
    [sourcesByCollectionId],
  );

  const ensureCollectionSources = useCallback(async (collectionId: string) => {
    if (!isCollectionUnlocked(collectionId)) return;
    if (!collectionId || sourcesByCollectionId[collectionId] || loadingSourcesByCollectionId[collectionId]) return;
    setLoadingSourcesByCollectionId((current) => ({ ...current, [collectionId]: true }));
    try {
      const sources = await loadGuidelineCollectionSources(collectionId);
      setSourcesByCollectionId((current) => ({ ...current, [collectionId]: sources }));
    } finally {
      setLoadingSourcesByCollectionId((current) => ({ ...current, [collectionId]: false }));
    }
  }, [isCollectionUnlocked, loadingSourcesByCollectionId, sourcesByCollectionId]);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((current) => ({
      ...current,
      [folderName]: !current[folderName],
    }));
  };

  const toggleSchool = (school: string, isOpen: boolean, collections: GuidelineCollection[]) => {
    if (isFreeGuidelinesPlan && !collections.some((collection) => isCollectionUnlocked(collection.id))) {
      handleLockedGuidelineClick();
      return;
    }
    setExpandedSchool(isOpen ? '' : school);
    if (!isOpen) {
      collections.forEach((collection) => {
        void ensureCollectionSources(collection.id);
      });
    }
  };

  const collectionsBySchool = useMemo(() => {
    const map = new Map<string, GuidelineCollection[]>();
    for (const c of GUIDELINE_COLLECTIONS) {
      const arr = map.get(c.school) || [];
      arr.push({ ...c, sources: getCollectionSources(c) });
      map.set(c.school, arr);
    }
    return map;
  }, [getCollectionSources]);

  const sidebarQuery = normalizeSearchText(sidebarSearch);
  const sidebarHighlightTerms = useMemo(() => buildHighlightTerms(sidebarSearch), [sidebarSearch]);

  const filteredCollectionsBySchool = useMemo(() => {
    if (!sidebarQuery) return collectionsBySchool;
    const map = new Map<string, GuidelineCollection[]>();
    for (const [school, collections] of collectionsBySchool.entries()) {
      const filteredCols = collections.map(c => {
        const collectionMatches =
          normalizeSearchText(c.title.en).includes(sidebarQuery) ||
          normalizeSearchText(c.title.ar).includes(sidebarQuery) ||
          normalizeSearchText(c.school).includes(sidebarQuery);
        if (c.sources.length === 0 && collectionMatches) return c;
        const filteredSources = c.sources.filter(s =>
          normalizeSearchText(s.title).includes(sidebarQuery) ||
          normalizeSearchText(c.school).includes(sidebarQuery) ||
          normalizeSearchText(s.folderTitle || '').includes(sidebarQuery)
        );
        return { ...c, sources: filteredSources };
      }).filter(c => c.sources.length > 0);
      if (filteredCols.length > 0) {
        map.set(school, filteredCols);
      }
    }
    return map;
  }, [collectionsBySchool, sidebarQuery]);

  useEffect(() => {
    if (!sidebarQuery) return;
    GUIDELINE_COLLECTIONS
      .filter(
        (collection) =>
          normalizeSearchText(collection.school).includes(sidebarQuery) ||
          normalizeSearchText(collection.title.en).includes(sidebarQuery) ||
          normalizeSearchText(collection.title.ar).includes(sidebarQuery),
      )
      .forEach((collection) => {
        void ensureCollectionSources(collection.id);
      });
  }, [ensureCollectionSources, sidebarQuery]);

  useEffect(() => {
    if (selectedCollectionId) void ensureCollectionSources(selectedCollectionId);
  }, [ensureCollectionSources, selectedCollectionId]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="mb-2 text-xs font-black text-slate-500">
          {isArabic ? 'المدارس والإصدارات' : 'Schools & Editions'}
        </div>
        <div className="relative">
          <LuSearch className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4`} />
          <input
            type="text"
            autoFocus={autoFocusSearch}
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder={isArabic ? "ابحث عن ملف أو قسم..." : "Search files or sections..."}
            className={`w-full ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 transition`}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 max-h-[60vh] sm:max-h-[none]">
        {Array.from(filteredCollectionsBySchool.entries()).map(([school, collections]) => {
          const isOpen = expandedSchool === school || sidebarQuery.length > 0;
          return (
            <div key={school}>
              <button
                type="button"
                onClick={() => toggleSchool(school, isOpen, collections)}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-black text-slate-800 transition hover:bg-slate-50"
              >
                {isOpen ? <LuFolderOpen className="h-4 w-4 text-emerald-600" /> : <LuFolder className="h-4 w-4 text-slate-400" />}
                <span className="flex-1 text-start">{school}</span>
                {isFreeGuidelinesPlan && (
                  collections.some((collection) => isCollectionUnlocked(collection.id)) ? (
                    <LuLockOpen className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label={isArabic ? 'مفتوح' : 'Unlocked'} />
                  ) : (
                    <LuLock className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label={isArabic ? 'مقفول' : 'Locked'} />
                  )
                )}
                <LuChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className={`mt-1 space-y-2 border-slate-100 ${isArabic ? 'mr-4 border-r-2 pr-2' : 'ml-4 border-l-2 pl-2'}`}>
                  {collections.map((c) => {
                    const isCollectionActive = c.id === selectedCollectionId;
                    const isLockedCollection = !isCollectionUnlocked(c.id);
                    const folders = getCollectionFolders(c);
                    return (
                      <div key={c.id} className="space-y-1">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-black text-slate-400 uppercase">
                          {c.school === 'Endocrine'
                            ? 'Endocrine Society Guidelines'
                            : c.school === 'ACG'
                              ? 'ACG Guidelines'
                              : c.school === 'AGA'
                                ? 'AGA Clinical Guidance'
                                : c.school === 'AAP'
                                  ? 'AAP Clinical Practice Guidelines'
                                  : c.school === 'CDC ACIP'
                                    ? 'CDC ACIP Vaccine Recommendations'
                                      : `${c.school} ${c.year === 2026 && c.school === 'KDIGO' ? (isArabic ? 'المكتبة' : 'Library') : localizeNumber(c.year, isArabic)}`}
                          {isFreeGuidelinesPlan && (
                            isLockedCollection ? (
                              <LuLock className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label={isArabic ? 'مقفول' : 'Locked'} />
                            ) : (
                              <LuLockOpen className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label={isArabic ? 'مفتوح' : 'Unlocked'} />
                            )
                          )}
                        </div>
                        {loadingSourcesByCollectionId[c.id] && c.sources.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500">
                            {isArabic ? 'جاري تحميل الملفات...' : 'Loading files...'}
                          </div>
                        ) : null}
                        {!loadingSourcesByCollectionId[c.id] && c.sources.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (isLockedCollection) {
                                handleLockedGuidelineClick();
                                return;
                              }
                              void ensureCollectionSources(c.id);
                            }}
                            className={`w-full rounded-2xl border border-dashed px-3 py-2 text-start text-[11px] font-bold transition ${
                              isLockedCollection
                                ? 'border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-50'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {isArabic ? `عرض ${c.sourceCount ?? ''} ملف` : `Show ${c.sourceCount ?? ''} files`}
                          </button>
                        ) : null}
                        <div className="space-y-1">
                          {folders ? (
                            <div className="space-y-2">
                              {folders.map((folder) => {
                                const folderKey = `${c.id}:${folder.title}`;
                                const isFolderOpen = !!expandedFolders[folderKey] || sidebarQuery.length > 0;
                                return (
                                  <div key={folder.title} className="min-w-0 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isLockedCollection) {
                                          handleLockedGuidelineClick();
                                          return;
                                        }
                                        toggleFolder(folderKey);
                                      }}
                                      className={`flex w-full items-center gap-2 rounded-2xl px-2.5 py-2 text-start text-xs font-black transition ${
                                        isLockedCollection
                                          ? 'text-amber-800 hover:bg-amber-50'
                                          : 'text-slate-800 hover:bg-slate-50'
                                      }`}
                                    >
                                      {isLockedCollection ? <LuFolder className="h-4 w-4 shrink-0 text-amber-500" /> : isFolderOpen ? <LuFolderOpen className="h-4 w-4 shrink-0 text-slate-600" /> : <LuFolder className="h-4 w-4 shrink-0 text-slate-600" />}
                                      <span className="min-w-0 flex-1 leading-5">{folder.title}</span>
                                      {isLockedCollection && <LuLock className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label={isArabic ? 'مقفول' : 'Locked'} />}
                                      <LuChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isFolderOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {isFolderOpen && (
                                      <div className={`mt-1.5 space-y-1 ${isArabic ? 'mr-3 border-r border-slate-200 pr-1.5' : 'ml-3 border-l border-slate-200 pl-1.5'}`}>
                                        {folder.sources.map((source) => {
                                          const isActive = isCollectionActive && source.id === selectedSourceId;
                                          return (
                                            <button
                                              key={source.id}
                                              type="button"
                                              onClick={() => {
                                                if (isLockedCollection) {
                                                  handleLockedGuidelineClick();
                                                  return;
                                                }
                                                onSelectSource(c.id, source);
                                              }}
                                              className={`flex w-full items-start gap-1.5 rounded-lg px-2 py-2 text-start text-[11px] font-bold leading-5 transition ${
                                                isActive
                                                  ? 'bg-slate-900 text-white'
                                                  : isLockedCollection
                                                    ? 'text-amber-800 hover:bg-amber-50'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                              }`}
                                            >
                                              {isLockedCollection ? (
                                                <LuLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                              ) : (
                                                <LuFileText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                              )}
                                              <span className="min-w-0 flex-1 block">
                                                {sidebarQuery ? renderHighlightedText(source.title, sidebarHighlightTerms, isArabic) : source.title}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            c.sources.map((source) => {
                              const isActive = isCollectionActive && source.id === selectedSourceId;
                              return (
                                <button
                                  key={source.id}
                                  type="button"
                                  onClick={() => {
                                    if (isLockedCollection) {
                                      handleLockedGuidelineClick();
                                      return;
                                    }
                                    onSelectSource(c.id, source);
                                  }}
                                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-start text-xs font-bold leading-5 transition ${
                                    isActive
                                      ? 'bg-slate-900 text-white'
                                      : isLockedCollection
                                        ? 'text-amber-800 hover:bg-amber-50'
                                        : 'text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {isLockedCollection ? (
                                    <LuLock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                  ) : (
                                    <LuFileText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                  )}
                                  <span className="min-w-0 flex-1 block">
                                    {sidebarQuery ? renderHighlightedText(source.title, sidebarHighlightTerms, isArabic) : source.title}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
