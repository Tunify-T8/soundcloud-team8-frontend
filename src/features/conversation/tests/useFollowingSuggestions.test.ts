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
  });

  it("initial state", () => {
    const { result } = renderHook(() => useFollowingSuggestions(""));
    expect(result.current.suggestions).toEqual([]);
  });

  it("fetches data", async () => {
    mockedApiGet.mockResolvedValue({
      data: [{ id: "1", displayName: "User" }],
    });

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
    });

    const { result, rerender } = renderHook(
      ({ q }) => useFollowingSuggestions(q),
      { initialProps: { q: "" } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    rerender({ q: "ali" });

    await waitFor(() => {
      expect(result.current.suggestions.length).toBe(1);
    });
  });

  it("handles error", async () => {
    mockedApiGet.mockRejectedValue(new Error());

    const { result } = renderHook(() => useFollowingSuggestions(""));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.suggestions).toEqual([]);
  });
});