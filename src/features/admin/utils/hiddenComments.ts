export const HIDDEN_COMMENT_IDS_KEY = 'sc_hidden_comment_ids';
export const HIDDEN_COMMENTS_UPDATED_EVENT = 'admin:hidden-comments-updated';

const readHiddenCommentIds = (): string[] => {
  const raw = localStorage.getItem(HIDDEN_COMMENT_IDS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

const writeHiddenCommentIds = (ids: string[]): void => {
  localStorage.setItem(HIDDEN_COMMENT_IDS_KEY, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new Event(HIDDEN_COMMENTS_UPDATED_EVENT));
};

export const getHiddenCommentIds = (): Set<string> => new Set(readHiddenCommentIds());

export const hideCommentId = (commentId: string): void => {
  const ids = readHiddenCommentIds();
  if (!ids.includes(commentId)) {
    ids.push(commentId);
    writeHiddenCommentIds(ids);
    return;
  }

  window.dispatchEvent(new Event(HIDDEN_COMMENTS_UPDATED_EVENT));
};

export const unhideCommentId = (commentId: string): void => {
  const ids = readHiddenCommentIds().filter((id) => id !== commentId);
  writeHiddenCommentIds(ids);
};

export const isCommentHidden = (commentId: string): boolean => getHiddenCommentIds().has(commentId);