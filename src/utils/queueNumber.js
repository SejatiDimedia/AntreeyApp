export const formatQueueNumber = (queuePosition, options = {}) => {
  const number = Number(queuePosition || 0);
  if (!Number.isFinite(number) || number <= 0) return '-';

  const prefixRaw = typeof options.prefix === 'string' ? options.prefix : 'A';
  const prefix = prefixRaw.trim() || 'A';
  const separator = typeof options.separator === 'string' ? options.separator : '-';
  const padLength = Number.isFinite(Number(options.padLength))
    ? Math.max(1, Math.min(6, Number(options.padLength)))
    : 1;

  const formattedNumber = String(number).padStart(padLength, '0');
  return `${prefix}${separator}${formattedNumber}`;
};
