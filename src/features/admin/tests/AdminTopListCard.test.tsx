import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdminTopListCard, { type TopListOption } from '../components/AdminTopListCard';

describe('AdminTopListCard', () => {
  const options: TopListOption[] = [
    { key: 'mostPlayedTracks', label: 'Most Played Tracks' },
    { key: 'mostReportedUsers', label: 'Most Reported Users' },
  ];

  it('renders titles and values from different top list shapes', () => {
    render(
      <AdminTopListCard
        title="Top Rankings"
        selectedKey="mostPlayedTracks"
        options={options}
        items={[
          { trackId: 'track-1', title: 'Song A', playCount: 99 },
          { userId: 'user-1', username: 'ro', displayName: 'Rosana', reportCount: 7 },
          { name: 'Fallback Name', value: 3 },
        ]}
        isLoading={false}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Top Rankings')).toBeInTheDocument();
    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('Rosana')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Fallback Name')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange when the ranking selector changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AdminTopListCard
        title="Top Rankings"
        selectedKey="mostPlayedTracks"
        options={options}
        items={[]}
        isLoading={false}
        onChange={onChange}
      />,
    );

    await user.selectOptions(screen.getByRole('combobox'), 'mostReportedUsers');
    expect(onChange).toHaveBeenCalledWith('mostReportedUsers');
  });
});