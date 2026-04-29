import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserGrid from "../components/UserGrid";

describe("UserGrid", () => {
  it("renders user cards and custom actions", () => {
    render(
      <MemoryRouter>
        <UserGrid
          users={[
            { id: "user-1", username: "alice", displayName: "Alice" },
            { id: "user-2", username: "bob", displayName: "Bob" },
          ]}
          renderAction={(user) => <button type="button">Action {user.username}</button>}
          placeholders={3}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("user-grid")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-user-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-user-2")).toBeInTheDocument();
    expect(screen.getByText("Action alice")).toBeInTheDocument();
    expect(screen.getByText("Action bob")).toBeInTheDocument();
    expect(screen.getByTestId("user-grid-placeholder-0")).toBeInTheDocument();
  });
});