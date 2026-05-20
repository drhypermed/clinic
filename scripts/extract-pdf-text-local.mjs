import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const sourceDir = process.argv[2] ?? 'guidelines-sources/ADA/2025';
const outputDir = process.argv[3] ?? 'guidelines-sources/_extracted/ADA/2025';

const workspace = process.cwd();
const resolvedSource = path.resolve(sourceDir);
const resolvedOutput = path.resolve(outputDir);

if (!resolvedSource.toLowerCase().startsWith(workspace.toLowerCase())) {
  throw new Error('Source directory must stay inside the workspace.');
}

fs.mkdirSync(resolvedOutput, { recursive: true });

const decodePdfString = (value) => {
  let output = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== '\\') {
      output += char;
      continue;
    }

    const next = value[++index];
    if (next === 'n') output += '\n';
    else if (next === 'r') output += '\r';
    else if (next === 't') output += '\t';
    else if (next === 'b') output += '\b';
    else if (next === 'f') output += '\f';
    else if (next === '(' || next === ')' || next === '\\') output += next;
    else if (/[0-7]/.test(next ?? '')) {
      let octal = next;
      for (let offset = 0; offset < 2 && /[0-7]/.test(value[index + 1] ?? ''); offset += 1) {
        octal += value[++index];
      }
      output += String.fromCharCode(Number.parseInt(octal, 8));
    } else if (next) {
      output += next;
    }
  }
  return output;
};

const extractLiteralStrings = (value) => {
  const strings = [];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '(') continue;
    let depth = 1;
    let current = '';
    index += 1;
    while (index < value.length && depth > 0) {
      const char = value[index];
      if (char === '\\') {
        current += char;
        if (index + 1 < value.length) current += value[++index];
      } else if (char === '(') {
        depth += 1;
        current += char;
      } else if (char === ')') {
        depth -= 1;
        if (depth > 0) current += char;
      } else {
        current += char;
      }
      index += 1;
    }
    strings.push(decodePdfString(current));
  }
  return strings;
};

const normalizeExtractedText = (value) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

const extractTextFromContentStream = (stream) => {
  const parts = [];
  const textObjects = stream.match(/BT[\s\S]*?ET/g) ?? [];

  for (const object of textObjects) {
    const tokenPattern = /\[((?:\\.|[^\]])*)\]\s*TJ|\(((?:\\.|[^\\()])*(?:\\.[^\\()]*)*)\)\s*Tj|(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+TD|\*|T\*/g;
    let match;
    let line = '';

    while ((match = tokenPattern.exec(object)) !== null) {
      if (match[1] !== undefined) {
        const arrayText = match[1];
        const arrayTokenPattern = /\(((?:\\.|[^\\()])*(?:\\.[^\\()]*)*)\)|-?\d+(?:\.\d+)?/g;
        let arrayMatch;
        while ((arrayMatch = arrayTokenPattern.exec(arrayText)) !== null) {
          const token = arrayMatch[0];
          if (token.startsWith('(')) {
            line += decodePdfString(token.slice(1, -1));
          } else if (Number.parseFloat(token) < -120) {
            line += ' ';
          }
        }
      } else if (match[2] !== undefined) {
        line += decodePdfString(match[2]);
      } else {
        if (line.trim()) parts.push(line.trim());
        line = '';
      }
    }

    if (line.trim()) parts.push(line.trim());
  }

  return parts.join('\n');
};

const extractPdfText = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const binary = buffer.toString('latin1');
  const textParts = [];
  const streamPattern = /<<(?:.|\r|\n)*?\/FlateDecode(?:.|\r|\n)*?>>\s*stream\r?\n/g;
  let match;

  while ((match = streamPattern.exec(binary)) !== null) {
    const start = streamPattern.lastIndex;
    const end = binary.indexOf('endstream', start);
    if (end < 0) break;

    let chunk = buffer.subarray(start, end);
    if (chunk[0] === 0x0d && chunk[1] === 0x0a) chunk = chunk.subarray(2);
    else if (chunk[0] === 0x0a) chunk = chunk.subarray(1);
    while (chunk.length && (chunk.at(-1) === 0x0a || chunk.at(-1) === 0x0d)) {
      chunk = chunk.subarray(0, -1);
    }

    try {
      const inflated = zlib.inflateSync(chunk).toString('latin1');
      const extracted = extractTextFromContentStream(inflated);
      if (/[A-Za-z]{3,}|[0-9]{2,}/.test(extracted)) textParts.push(extracted);
    } catch {
      // Some streams are images or use predictors that are not needed for text review.
    }

    streamPattern.lastIndex = end + 'endstream'.length;
  }

  return normalizeExtractedText(textParts.join('\n'));
};

for (const entry of fs.readdirSync(resolvedSource, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.pdf')) continue;
  const sourcePath = path.join(resolvedSource, entry.name);
  const outputName = `${path.basename(entry.name, '.pdf')}.txt`;
  const outputPath = path.join(resolvedOutput, outputName);
  const text = extractPdfText(sourcePath);
  fs.writeFileSync(outputPath, `${text}\n`, 'utf8');
  console.log(`${entry.name}: ${text.length.toLocaleString()} chars`);
}
