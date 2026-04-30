// src/features/conversation/components/__tests__/TrackTabs.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TrackTabs from '../components/TrackTabs';

describe('TrackTabs', () => {
  it('renders tabs and highlights active', () => {
    render(
      <MemoryRouter>
        <TrackTabs trackId="123" activeTab="likes" />
      </MemoryRouter>
    );

    expect(screen.getByText('likes')).toHaveClass('text-white');
    expect(screen.getByText('reposts')).toBeInTheDocument();
  });
});