export type TopListKey = 'mostPlayedTracks' | 'mostReportedTracks' | 'mostReportedUsers' | 'mostActiveUsers';

export type TopListOption = {
  key: TopListKey;
  label: string;
};

export type TopListItem = Record<string, unknown>;

type AdminTopListCardProps = {
  title: string;
  selectedKey: TopListKey;
  options: TopListOption[];
  items: TopListItem[];
  isLoading: boolean;
  onChange: (key: TopListKey) => void;
};

const getItemValue = (item: TopListItem) => {
  const value = item.playCount ?? item.reportCount ?? item.count ?? item.total ?? item.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const getItemTitle = (item: TopListItem) => {
  const title = item.title;
  if (typeof title === 'string' && title.trim()) return title;

  const displayName = item.displayName;
  if (typeof displayName === 'string' && displayName.trim()) return displayName;

  const username = item.username;
  if (typeof username === 'string' && username.trim()) return username;

  const name = item.name;
  if (typeof name === 'string' && name.trim()) return name;

  return 'Unknown';
};

const getItemKey = (item: TopListItem, fallbackTitle: string) => {
  const trackId = item.trackId;
  if (typeof trackId === 'string' && trackId.trim()) return trackId;

  const userId = item.userId;
  if (typeof userId === 'string' && userId.trim()) return userId;

  return fallbackTitle;
};

const AdminTopListCard = ({
  title,
  selectedKey,
  options,
  items,
  isLoading,
  onChange,
}: AdminTopListCardProps) => {
  const labelConfig: Record<TopListKey, { left: string; right: string }> = {
    mostPlayedTracks: { left: 'Track', right: 'Play Count' },
    mostReportedTracks: { left: 'Track', right: 'Report Count' },
    mostReportedUsers: { left: 'User', right: 'Report Count' },
    mostActiveUsers: { left: 'User', right: 'Play Count' },
  };

  const currentLabels = labelConfig[selectedKey];

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-black tracking-tight">{title}</h2>
          <p className="text-xs text-zinc-500 mt-1">Choose which ranking to display</p>
        </div>
        <select
          value={selectedKey}
          onChange={(e) => onChange(e.target.value as TopListKey)}
          className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200"
        >
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
          {currentLabels.left}
        </span>
        <span className="inline-flex items-center rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
          {currentLabels.right}
        </span>
      </div>

      {isLoading ? (
        <p className="text-zinc-400 text-sm">Loading...</p>
      ) : items.length ? (
        <ul className="space-y-2">
          {items.map((item) => {
            const titleText = getItemTitle(item);
            const value = getItemValue(item);
            const key = getItemKey(item, titleText);

            return (
              <li key={key} className="flex items-center justify-between text-sm">
                <span className="text-zinc-200 truncate pr-3">{titleText}</span>
                <span className="text-zinc-400">
                  {value === null ? 'N/A' : value.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-zinc-500 text-sm">No ranking data available for this list.</p>
      )}
    </section>
  );
};

export default AdminTopListCard;
