export const hasReliablePdfPageNumbers = (
  source: {
    localFile?: string;
    sourcePath?: string;
  },
) => {
  const sourceFile = source.localFile || source.sourcePath || '';
  return /\.pdf(?:$|[?#])/i.test(sourceFile);
};
