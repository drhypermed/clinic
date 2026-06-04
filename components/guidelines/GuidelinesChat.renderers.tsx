import React from 'react';
import type { GuidelineChatSourceChunk } from './guidelineChatSearch';
import type { ChatMessage } from './guidelinesChatUtils';

export const ThinkingSpinner = () => (
  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" role="presentation">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      >
        <animateTransform
          attributeName="transform"
          dur="0.85s"
          from="0 12 12"
          repeatCount="indefinite"
          to="360 12 12"
          type="rotate"
        />
      </path>
    </svg>
  </span>
);

export const renderInlineContent = (
  text: string,
  message: ChatMessage,
  keyPrefix: string,
  jumpToSource: (index: number, sources?: GuidelineChatSourceChunk[]) => void,
  isArabic: boolean
) =>
  text.split(/(\[S\d+\]|\*\*[^*]+\*\*)/g).map((part, index) => {
    const sourceMatch = part.match(/^\[S(\d+)\]$/);
    if (sourceMatch) {
      const sourceIndex = Number(sourceMatch[1]) - 1;
      return (
        <button
          key={`${keyPrefix}-source-${index}`}
          type="button"
          onClick={() => jumpToSource(sourceIndex, message.sources)}
          className="mx-0.5 inline-flex items-center rounded-md bg-[#d9fdd3] px-1.5 py-0.5 text-[11px] font-black text-[#075e54] ring-1 ring-emerald-200 hover:bg-emerald-100"
          title={isArabic ? 'اعرض المصدر' : 'Show source'}
        >
          {part}
        </button>
      );
    }

    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={`${keyPrefix}-bold-${index}`} className="font-black text-slate-950">{boldMatch[1]}</strong>;
    }

    return <React.Fragment key={`${keyPrefix}-text-${index}`}>{part}</React.Fragment>;
  });

export const isTableSeparator = (line: string) =>
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

export const parseTableRow = (line: string) =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());

export const renderMarkdownTable = (
  tableLines: string[],
  message: ChatMessage,
  key: string,
  jumpToSource: (index: number, sources?: GuidelineChatSourceChunk[]) => void,
  isArabic: boolean
) => {
  const header = parseTableRow(tableLines[0] || '');
  const body = tableLines.slice(1).filter((line) => !isTableSeparator(line)).map(parseTableRow);
  return (
    <div key={key} className="my-2 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-xs leading-6">
        <thead className="bg-slate-50 text-slate-800">
          <tr>
            {header.map((cell, index) => (
              <th key={`${key}-h-${index}`} className="border-b border-slate-200 px-3 py-2 text-start font-black">
                {renderInlineContent(cell, message, `${key}-h-${index}`, jumpToSource, isArabic)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${key}-r-${rowIndex}`} className="odd:bg-white even:bg-slate-50/70">
              {row.map((cell, cellIndex) => (
                <td key={`${key}-r-${rowIndex}-${cellIndex}`} className="border-b border-slate-100 px-3 py-2 align-top font-semibold text-slate-700">
                  {renderInlineContent(cell, message, `${key}-r-${rowIndex}-${cellIndex}`, jumpToSource, isArabic)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const renderMessageContent = (
  message: ChatMessage,
  jumpToSource: (index: number, sources?: GuidelineChatSourceChunk[]) => void,
  isArabic: boolean
) => {
  if (message.status === 'thinking') {
    return (
      <span className="inline-flex items-center gap-2 text-[#075e54]">
        <ThinkingSpinner />
        {message.content}
      </span>
    );
  }

  if (message.role === 'user') return <>{message.content}</>;

  const lines = message.content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      blocks.push(
        <h4 key={`${message.id}-heading-${index}`} className={`mt-2 font-black leading-7 text-slate-950 ${heading[1].length <= 2 ? 'text-base' : 'text-sm'}`}>
          {renderInlineContent(heading[2], message, `${message.id}-heading-${index}`, jumpToSource, isArabic)}
        </h4>,
      );
      index += 1;
      continue;
    }

    if (line.includes('|') && lines[index + 1]?.includes('|') && isTableSeparator(lines[index + 1])) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].includes('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push(renderMarkdownTable(tableLines, message, `${message.id}-table-${index}`, jumpToSource, isArabic));
      continue;
    }

    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*•]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*•]\s+/, '').trim());
        index += 1;
      }
      blocks.push(
        <ul key={`${message.id}-ul-${index}`} className="my-2 list-disc space-y-1 ps-5">
          {items.map((item, itemIndex) => (
            <li key={`${message.id}-ul-${index}-${itemIndex}`} className="leading-7">
              {renderInlineContent(item, message, `${message.id}-ul-${index}-${itemIndex}`, jumpToSource, isArabic)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, '').trim());
        index += 1;
      }
      blocks.push(
        <ol key={`${message.id}-ol-${index}`} className="my-2 list-decimal space-y-1 ps-5">
          {items.map((item, itemIndex) => (
            <li key={`${message.id}-ol-${index}-${itemIndex}`} className="leading-7">
              {renderInlineContent(item, message, `${message.id}-ol-${index}-${itemIndex}`, jumpToSource, isArabic)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length
      && lines[index].trim()
      && !/^(#{1,4})\s+/.test(lines[index])
      && !/^\s*[-*•]\s+/.test(lines[index])
      && !/^\s*\d+[.)]\s+/.test(lines[index])
      && !(lines[index].includes('|') && lines[index + 1]?.includes('|') && isTableSeparator(lines[index + 1]))
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={`${message.id}-p-${index}`} className="my-1 leading-7">
        {renderInlineContent(paragraph.join(' '), message, `${message.id}-p-${index}`, jumpToSource, isArabic)}
      </p>,
    );
  }

  return <div className="space-y-2">{blocks}</div>;
};
