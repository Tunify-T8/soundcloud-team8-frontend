import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConversationListItem from '../../conversation/components/ConversationListItem';

describe('ConversationListItem', () => {
  it('should render with avatar', () => {
    render(
      <ConversationListItem
        name="John Doe"
        preview="Hello there!"
        timeLabel="2 hours ago"
        unreadCount={3}
        avatarUrl="https://example.com/avatar.jpg"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should render with fallback avatar', () => {
    render(
      <ConversationListItem
        name="Jane Smith"
        preview="How are you?"
        timeLabel="1 day ago"
        unreadCount={0}
        avatarUrl={null}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
  });

  it('should render with no avatar provided', () => {
    render(
      <ConversationListItem
        name="Bob Wilson"
        preview="See you later"
        timeLabel="5 minutes ago"
        unreadCount={1}
      />
    );

    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('See you later')).toBeInTheDocument();
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument(); // First letter of name
  });

  it('should handle unread count over 99', () => {
    render(
      <ConversationListItem
        name="Alice"
        preview="Message"
        timeLabel="Now"
        unreadCount={150}
      />
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should not show unread badge when count is 0', () => {
    render(
      <ConversationListItem
        name="Charlie"
        preview="Test message"
        timeLabel="Yesterday"
        unreadCount={0}
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should truncate long preview text', () => {
    const longPreview = 'This is a very long preview text that should be truncated when it exceeds the available space in the component layout';

    render(
      <ConversationListItem
        name="Test User"
        preview={longPreview}
        timeLabel="Today"
        unreadCount={0}
      />
    );

    const previewElement = screen.getByText(longPreview);
    expect(previewElement).toHaveClass('truncate');
  });

  it('should handle special characters in name', () => {
    render(
      <ConversationListItem
        name="José María"
        preview="Hola"
        timeLabel="Ahora"
        unreadCount={2}
      />
    );

    expect(screen.getByText('José María')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // First character
  });

  it('should handle empty strings', () => {
    const { container } = render(
      <ConversationListItem
        name=""
        preview=""
        timeLabel=""
        unreadCount={0}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
    const paragraphElements = container.querySelectorAll('p');
    expect(paragraphElements).toHaveLength(3);
    expect(paragraphElements[0].textContent).toBe('');
    expect(paragraphElements[1].textContent).toBe('');
    expect(paragraphElements[2].textContent).toBe('');
  });
});