// src/features/conversation/components/__tests__/ActionButtons.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButtons from '../components/ActionButtons';

describe('ActionButtons', () => {
  it('renders all buttons', () => {
    render(
      <ActionButtons
        isLiked={false}
        isReposted={false}
        isLoading={false}
        onLike={() => {}}
        onRepost={() => {}}
      />
    );

    expect(screen.getByTitle('Like')).toBeInTheDocument();
    expect(screen.getByTitle('Repost')).toBeInTheDocument();
    expect(screen.getByTitle('Share / Copy link')).toBeInTheDocument();
    expect(screen.getByTitle('Copy link')).toBeInTheDocument();
    expect(screen.getByTitle('Add to playlist')).toBeInTheDocument();
    expect(screen.getByTitle('More options')).toBeInTheDocument();
  });

  it('calls onLike and onRepost', () => {
    const onLike = vi.fn();
    const onRepost = vi.fn();

    render(
      <ActionButtons
        isLiked={false}
        isReposted={false}
        isLoading={false}
        onLike={onLike}
        onRepost={onRepost}
      />
    );

    fireEvent.click(screen.getByTitle('Like'));
    fireEvent.click(screen.getByTitle('Repost'));

    expect(onLike).toHaveBeenCalled();
    expect(onRepost).toHaveBeenCalled();
  });
});