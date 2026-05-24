import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const manifestPath = path.resolve(process.argv[2] ?? 'guidelines-sources/_review/full-text-extraction/manifest.json');
const outputDir = path.resolve(process.argv[3] ?? 'components/guidelines/data/kdigo');

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(manifestPath, 'Manifest path');
ensureInsideWorkspace(outputDir, 'Output directory');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const kdigoFiles = manifest.files
  .filter((file) => file.status === 'extracted' && file.sourcePath?.startsWith('KDIGO/'))
  .map((file) => ({
    ...file,
    parts: file.sourcePath.split('/'),
  }));

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[^\w]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const sourceIdFor = (sourcePath) => {
  if (sourcePath === 'KDIGO/Acute Kidney Injury (AKI) and Acute Kidney Disease (AKD)/2026 AKIAKD Guideline Public Review Draft.pdf') {
    return 'aki-akd-public-review-draft';
  }
  return `kdigo-${slugify(sourcePath.replace(/^KDIGO\//, '').replace(/\.pdf$/i, ''))}`;
};

const folderTopicIdFor = (folder) => `kdigo-folder-${slugify(folder)}`;
const fileTopicIdFor = (sourcePath) => `kdigo-file-${sourceIdFor(sourcePath)}`;
const titleFromPath = (sourcePath) => path.basename(sourcePath, '.pdf');
const folderFromPath = (sourcePath) => sourcePath.split('/').slice(1, -1).join(' / ');
const formatNumber = (value) => Number(value ?? 0).toLocaleString('en-US');

const classifyFile = (title) => {
  if (/guideline\.?$/i.test(title) || /public review draft/i.test(title)) return 'Full guideline';
  if (/executive summary/i.test(title)) return 'Executive summary';
  if (/top\s+\d+|takeaways?/i.test(title)) return 'Key takeaways';
  if (/central illustration|figure|measurement/i.test(title)) return 'Figure/illustration';
  if (/scope/i.test(title)) return 'Scope document';
  if (/consensus report/i.test(title)) return 'Consensus report';
  if (/synopsis/i.test(title)) return 'Synopsis';
  return 'Supporting file';
};

const readStructuredFile = (file) => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(file.structuredPath), 'utf8'));
  } catch {
    return null;
  }
};

const normalizeLine = (line) => line.replace(/\s+/g, ' ').trim();

const extractDetectedIndexLines = (structured) => {
  if (!structured?.pages?.length) return [];
  const earlyPages = structured.pages.slice(0, Math.min(structured.pages.length, 10));
  const lines = earlyPages.flatMap((page) => String(page.text ?? '').split(/\r?\n/).map(normalizeLine));
  const indexLines = [];
  let previous = '';

  for (const line of lines) {
    if (!line || line.length < 4) continue;
    const looksLikeIndexLine =
      /^(?:S?\d+[A-Za-z]?|[ivxlcdm]+)\s+\S/i.test(line) ||
      /^(?:Chapter|Table|Figure|Appendix)\s+\d/i.test(line) ||
      /^(?:Summary of recommendation statements|Practice Point|Recommendation)\b/i.test(line);

    if (!looksLikeIndexLine) {
      previous = line;
      continue;
    }

    const maybeContinuation = previous && !/^(?:S?\d+[A-Za-z]?|[ivxlcdm]+)\s+\S/i.test(previous) && previous.length <= 90;
    const combined = maybeContinuation ? `${previous} ${line}` : line;
    if (!indexLines.includes(combined)) indexLines.push(combined);
    previous = '';
  }

  return indexLines.slice(0, 80);
};

const buildChunkLines = (structured) => {
  if (!structured?.chunks?.length) return [];
  return structured.chunks.map((chunk) => {
    const pageRange = chunk.startPage === chunk.endPage ? `p. ${chunk.startPage}` : `pp. ${chunk.startPage}-${chunk.endPage}`;
    return `${chunk.id}: ${pageRange}, ${formatNumber(String(chunk.text ?? '').length)} text chars`;
  });
};

const sourceEntry = (file) => {
  const folderTitle = folderFromPath(file.sourcePath);
  const title = titleFromPath(file.sourcePath);
  const year = file.sourcePath.match(/\b(20\d{2})\b/)?.[1] ?? 'KDIGO';
  const sourceId = sourceIdFor(file.sourcePath);
  const isDraft = /draft/i.test(title);
  const citationSuffix = isDraft ? ' Public Review Draft.' : '.';
  return {
    id: sourceId,
    folderTitle,
    folderTopicId: folderTopicIdFor(folderTitle),
    fileTopicId: fileTopicIdFor(file.sourcePath),
    title,
    fileType: classifyFile(title),
    pageCount: Number(file.pageCount ?? 0),
    textChars: Number(file.textChars ?? 0),
    chunkCount: Number(file.chunkCount ?? 0),
    citation: `KDIGO. ${title}${citationSuffix} ${year}.`,
    url: 'https://kdigo.org/guidelines/',
    localFile: file.sourcePath,
    structuredTextPath: file.structuredPath,
    rawTextPath: file.textPath,
    sha256: file.sha256,
  };
};

const grouped = new Map();
for (const file of kdigoFiles) {
  const folder = folderFromPath(file.sourcePath);
  if (!grouped.has(folder)) grouped.set(folder, []);
  grouped.get(folder).push(file);
}

const fileTopics = [];

const folderTopics = Array.from(grouped.entries()).map(([folder, files], folderIndex) => {
  const sourceIds = files.map((file) => sourceIdFor(file.sourcePath));
  const fullFiles = files.filter((file) => classifyFile(titleFromPath(file.sourcePath)) === 'Full guideline');
  const summaryFiles = files.filter((file) => classifyFile(titleFromPath(file.sourcePath)) !== 'Full guideline');
  const totalPages = files.reduce((total, file) => total + Number(file.pageCount ?? 0), 0);
  const totalChars = files.reduce((total, file) => total + Number(file.textChars ?? 0), 0);
  const totalChunks = files.reduce((total, file) => total + Number(file.chunkCount ?? 0), 0);
  const fileLines = files.map((file, fileIndex) => {
    const title = titleFromPath(file.sourcePath);
    const type = classifyFile(title);
    return `${fileIndex + 1}. ${type}: ${title} (${formatNumber(file.pageCount)} pages, ${formatNumber(file.chunkCount)} chunks, ${formatNumber(file.textChars)} extracted chars)`;
  });

  for (const [fileIndex, file] of files.entries()) {
    const sourceId = sourceIdFor(file.sourcePath);
    const title = titleFromPath(file.sourcePath);
    const type = classifyFile(title);
    const structured = readStructuredFile(file);
    const detectedIndexLines = extractDetectedIndexLines(structured);
    const chunkLines = buildChunkLines(structured);
    const details = [
      {
        title: { en: 'File metadata', ar: 'بيانات الملف' },
        items: {
          en: [
            `Folder: ${folder}`,
            `File type: ${type}`,
            `Source path: ${file.sourcePath}`,
            `Extracted pages: ${formatNumber(file.pageCount)}`,
            `Searchable chunks: ${formatNumber(file.chunkCount)}`,
            `Extracted text characters: ${formatNumber(file.textChars)}`,
            `Structured text: ${file.structuredPath}`,
            `Raw text: ${file.textPath}`,
            `SHA-256: ${file.sha256}`,
          ],
          ar: [
            `الفولدر: ${folder}`,
            `نوع الملف: ${type}`,
            `مسار المصدر: ${file.sourcePath}`,
            `عدد الصفحات المستخرجة: ${formatNumber(file.pageCount)}`,
            `عدد مقاطع البحث: ${formatNumber(file.chunkCount)}`,
            `عدد حروف النص المستخرج: ${formatNumber(file.textChars)}`,
            `ملف النص المنظم: ${file.structuredPath}`,
            `ملف النص الخام: ${file.textPath}`,
            `SHA-256: ${file.sha256}`,
          ],
        },
      },
    ];

    if (detectedIndexLines.length > 0) {
      details.push({
        title: { en: 'Detected source contents / early headings', ar: 'فهرس أو عناوين مبكرة مستخرجة من الملف' },
        items: {
          en: detectedIndexLines,
          ar: detectedIndexLines,
        },
      });
    }

    details.push({
      title: { en: 'Full searchable chunk index', ar: 'فهرس مقاطع النص القابلة للبحث بالكامل' },
      items: {
        en: chunkLines,
        ar: chunkLines,
      },
    });

    fileTopics.push({
      id: fileTopicIdFor(file.sourcePath),
      group: 'kdigoLibrary',
      title: {
        en: `${folderIndex + 1}.${fileIndex + 1} ${title}`,
        ar: `${folderIndex + 1}.${fileIndex + 1} ${title}`,
      },
      summary: {
        en: `Indexed KDIGO ${type.toLowerCase()} from "${folder}" with ${formatNumber(file.pageCount)} extracted pages and ${formatNumber(file.chunkCount)} searchable chunks.`,
        ar: `ملف KDIGO مفهرس من فولدر "${folder}"؛ نوعه ${type}، وعدد صفحاته المستخرجة ${formatNumber(file.pageCount)}، وعدد مقاطع البحث ${formatNumber(file.chunkCount)}.`,
      },
      points: {
        en: [
          `This is a separate file-level entry, not a folder summary.`,
          `The full extracted text is available to guideline chat through ${formatNumber(file.chunkCount)} chunks.`,
          `Use the detected contents and chunk map below to review coverage before relying on a specific answer.`,
          type === 'Full guideline'
            ? 'Treat this as the primary source when summaries or takeaways exist in the same folder.'
            : 'Treat this as a supporting source; prefer the full guideline when it exists in the same folder.',
        ],
        ar: [
          'هذا إدخال مستقل على مستوى الملف، وليس مجرد ملخص للفولدر.',
          `النص الكامل المستخرج متاح للشات من خلال ${formatNumber(file.chunkCount)} مقطع بحث.`,
          'استخدم الفهرس المستخرج وخريطة المقاطع بالأسفل لمراجعة التغطية قبل الاعتماد على إجابة محددة.',
          type === 'Full guideline'
            ? 'اعتبره المصدر الأساسي عندما توجد مختصرات أو key takeaways داخل نفس الفولدر.'
            : 'اعتبره ملفا داعما؛ ويفضل الرجوع للجايدلاين الكامل إذا كان موجودا داخل نفس الفولدر.',
        ],
      },
      details,
      practiceNote: {
        en: 'Clinical statements shown by the chat must be grounded in the extracted text chunks for this file or another selected KDIGO source.',
        ar: 'أي معلومة سريرية يقدمها الشات يجب أن تكون مبنية على مقاطع النص المستخرج من هذا الملف أو من مصدر KDIGO آخر محدد.',
      },
      sourceIds: [sourceId],
      tags: ['KDIGO', folder, title, type, 'file index', 'full text', file.sourcePath],
    });
  }

  return {
    id: folderTopicIdFor(folder),
    group: 'kdigoLibrary',
    title: {
      en: `${folderIndex + 1}. ${folder}`,
      ar: `${folderIndex + 1}. ${folder}`,
    },
    summary: {
      en: `KDIGO folder containing ${files.length} extracted source file${files.length === 1 ? '' : 's'} in the same order as the local library.`,
      ar: `فولدر KDIGO يحتوي على ${files.length} ملف مستخرج بنفس ترتيب المكتبة المحلية.`,
    },
    points: {
      en: [
        `Full guideline files: ${fullFiles.length || 0}.`,
        `Summaries, takeaways, figures, or supporting files: ${summaryFiles.length || 0}.`,
        `Total extracted coverage: ${formatNumber(totalPages)} pages, ${formatNumber(totalChunks)} chunks, and ${formatNumber(totalChars)} searchable text characters.`,
        'Open any file under this folder to review its own complete extraction index.',
      ],
      ar: [
        `عدد ملفات الجايدلاين الكاملة: ${fullFiles.length || 0}.`,
        `عدد المختصرات أو takeaways أو الرسومات أو الملفات الداعمة: ${summaryFiles.length || 0}.`,
        `إجمالي الاستخراج: ${formatNumber(totalPages)} صفحة، ${formatNumber(totalChunks)} مقطع بحث، و${formatNumber(totalChars)} حرف نصي قابل للبحث.`,
        'افتح أي ملف تحت هذا الفولدر لمراجعة فهرس استخراجه الكامل.',
      ],
    },
    details: [
      {
        title: { en: 'Files in this folder', ar: 'الملفات داخل هذا الفولدر' },
        items: {
          en: fileLines,
          ar: fileLines,
        },
      },
    ],
    practiceNote: {
      en: 'Do not treat summaries or key takeaways as replacements for the full guideline when the full guideline is available in the same folder.',
      ar: 'لا تعتبر المختصرات أو Key Takeaways بديلا عن ملف الجايدلاين الكامل عندما يكون الملف الكامل موجودا في نفس الفولدر.',
    },
    sourceIds,
    tags: ['KDIGO', folder, ...files.map((file) => classifyFile(titleFromPath(file.sourcePath)))],
  };
});

const overviewTopic = {
  id: 'kdigo-library-full-index',
  group: 'kdigoLibrary',
  title: {
    en: 'KDIGO Full Library: Folder and File Tree',
    ar: 'KDIGO Full Library: شجرة الفولدرات والملفات',
  },
  summary: {
    en: `Ordered tree of ${folderTopics.length} KDIGO folders and ${kdigoFiles.length} extracted source files.`,
    ar: `شجرة مرتبة لـ ${folderTopics.length} فولدر KDIGO و${kdigoFiles.length} ملف مصدر مستخرج.`,
  },
  points: {
    en: [
      'KDIGO is shown as one main library, then folders, then files.',
      'Every file has its own entry with extraction metadata and a full searchable chunk index.',
      'Full guidelines, executive summaries, key takeaways, figures, consensus reports, and scope files remain separate.',
      'The chat searches the extracted full text; this display is the review map for folders and files.',
    ],
    ar: [
      'KDIGO يظهر كمكتبة رئيسية واحدة، ثم الفولدرات، ثم الملفات.',
      'كل ملف له إدخال مستقل يحتوي على بيانات الاستخراج وفهرس كامل لمقاطع النص القابلة للبحث.',
      'ملفات الجايدلاين الكاملة والمختصرات وKey Takeaways والرسومات وتقارير التوافق وملفات Scope تظل منفصلة.',
      'الشات يبحث في النصوص الكاملة المستخرجة؛ وهذا العرض هو خريطة المراجعة للفولدرات والملفات.',
    ],
  },
  details: [
    {
      title: { en: 'Folders in order', ar: 'الفولدرات بالترتيب' },
      items: {
        en: folderTopics.map((topic) => topic.title.en),
        ar: folderTopics.map((topic) => topic.title.ar),
      },
    },
    {
      title: { en: 'Files in order', ar: 'الملفات بالترتيب' },
      items: {
        en: kdigoFiles.map((file, index) => `${index + 1}. ${folderFromPath(file.sourcePath)} / ${titleFromPath(file.sourcePath)}`),
        ar: kdigoFiles.map((file, index) => `${index + 1}. ${folderFromPath(file.sourcePath)} / ${titleFromPath(file.sourcePath)}`),
      },
    },
  ],
  sourceIds: kdigoFiles.map((file) => sourceIdFor(file.sourcePath)),
  tags: ['KDIGO', 'library', 'folder tree', 'file index', 'full text'],
};

const sourcesTs = `import type { GuidelineSource } from '../../guidelinesData';

export const KDIGO_SOURCES: GuidelineSource[] = ${JSON.stringify(kdigoFiles.map(sourceEntry), null, 2)};
`;

const libraryTs = `import type { GuidelineTopic } from '../../guidelinesData';

export const KDIGO_LIBRARY_TOPICS: GuidelineTopic[] = ${JSON.stringify([overviewTopic, ...folderTopics, ...fileTopics], null, 2)};
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'sources.ts'), sourcesTs, 'utf8');
fs.writeFileSync(path.join(outputDir, 'libraryIndex.ts'), libraryTs, 'utf8');

console.log(`Wrote ${kdigoFiles.length} KDIGO sources.`);
console.log(`Wrote ${folderTopics.length} KDIGO folder topics.`);
console.log(`Wrote ${fileTopics.length} KDIGO file topics.`);
