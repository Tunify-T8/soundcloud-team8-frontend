import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useFollowingSuggestions } from "../hooks/useFollowingSuggestions";
import { api } from "@/features/auth/services/api";

vi.mock("@/features/auth/services/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockedApiGet = vi.mocked(api.get);

describe("useFollowingSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiGet.mockResolvedValue({ data: [] } as never);
  });

  it("starts with no visible suggestions", async () => {
    const { result } = renderHook(() => useFollowingSuggestions(""));
    expect(result.current.suggestions).toEqual([]);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("fetches data", async () => {
    mockedApiGet.mockResolvedValue({
      data: [{ id: "1", displayName: "User" }],
    } as never);

    const { result } = renderHook(() => useFollowingSuggestions(""));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedApiGet).toHaveBeenCalled();
  });

  it("filters results", async () => {
    mockedApiGet.mockResolvedValue({
      data: [
        { id: "1", displayName: "Alice" },
        { id: "2", displayName: "Bob" },
      ],
    } as never);

    const { result, rerender } = renderHook(
      ({ q }) => useFollowingSuggestions(q),
      { initialProps: { q: "" } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ q: "ali" });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(1);
    });
  });

  it("handles error", async () => {
    mockedApiGet.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => useFollowingSuggestions(""));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.suggestions).toEqual([]);
  });
});
