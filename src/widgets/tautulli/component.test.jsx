// @vitest-environment jsdom

import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function makeSession(overrides = {}) {
  return {
    session_key: "1",
    full_title: "Movie",
    media_type: "movie",
    duration: 2000,
    view_offset: 1000,
    progress_percent: 50,
    state: "playing",
    video_decision: "direct play",
    audio_decision: "direct play",
    player: "Living Room TV",
    ip_address: "192.168.1.50",
    ...overrides,
  };
}

function mockSessions(sessions) {
  useWidgetAPI.mockReturnValue({
    data: { response: { data: { sessions } } },
    error: undefined,
  });
}

describe("widgets/tautulli/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder rows while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    // Default behavior shows 2 placeholder rows, but just assert we see at least one.
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("renders no-active message when there are no sessions", () => {
    mockSessions([]);

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("tautulli.no_active")).toBeInTheDocument();
  });

  it("renders an expanded two-row entry when a single session is playing", () => {
    mockSessions([makeSession()]);

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    const title = screen.getByText("Movie");
    const card = title.closest(".rounded-md");

    expect(title).toBeInTheDocument();
    expect(card).not.toBeNull();
    expect(within(card).getByText("Living Room TV · 192.168.1.50")).toBeInTheDocument();
    // view_offset 1s => "00:01", duration 2s => "00:02"
    expect(within(card).getByText(/00:01/)).toBeInTheDocument();
    expect(within(card).getByText(/00:02/)).toBeInTheDocument();
    expect(card.querySelector(".absolute.inset-y-0")).toHaveStyle({ width: "50%" });
  });

  it("renders every session on two rows when expandOneStreamToTwoRows is enabled", () => {
    mockSessions([
      makeSession({
        session_key: "1",
        full_title: "Movie One",
        view_offset: 500,
        player: "Living Room TV",
        ip_address: "192.168.1.10",
      }),
      makeSession({
        session_key: "2",
        full_title: "Movie Two",
        duration: 4000,
        player: "Bedroom Roku",
        ip_address: "192.168.1.11",
      }),
    ]);

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Movie One")).toBeInTheDocument();
    expect(screen.getByText("Movie Two")).toBeInTheDocument();
    expect(screen.getByText("Living Room TV · 192.168.1.10")).toBeInTheDocument();
    expect(screen.getByText("Bedroom Roku · 192.168.1.11")).toBeInTheDocument();
    // The total duration only renders on the expanded second row
    expect(screen.getByText(/00:02/)).toBeInTheDocument();
    expect(screen.getByText(/00:04/)).toBeInTheDocument();
  });

  it("renders one row per session and keeps player info in the tooltip when disabled", () => {
    mockSessions([
      makeSession({
        session_key: "1",
        full_title: "Movie One",
        view_offset: 500,
        player: "Living Room TV",
        ip_address: "192.168.1.10",
      }),
      makeSession({
        session_key: "2",
        full_title: "Movie Two",
        duration: 4000,
        player: "Bedroom Roku",
        ip_address: "192.168.1.11",
      }),
    ]);

    renderWithProviders(<Component service={{ widget: { type: "tautulli", expandOneStreamToTwoRows: false } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("Movie One")).toHaveAttribute("title", "Movie One\nLiving Room TV · 192.168.1.10");
    expect(screen.queryByText("Living Room TV · 192.168.1.10")).not.toBeInTheDocument();
    // Compact rows only show elapsed time, not the total duration
    expect(screen.queryAllByText("/")).toHaveLength(0);
  });

  it("falls back to the product name when the player is missing", () => {
    mockSessions([makeSession({ player: undefined, product: "Plex Web", ip_address: "10.0.0.5" })]);

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Plex Web · 10.0.0.5")).toBeInTheDocument();
  });

  it("renders an expanded entry when player information is unavailable", () => {
    mockSessions([
      makeSession({
        player: undefined,
        product: undefined,
        platform: undefined,
        device: undefined,
        ip_address: undefined,
      }),
    ]);

    renderWithProviders(<Component service={{ widget: { type: "tautulli" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Movie")).toBeInTheDocument();
    expect(screen.getByText(/00:02/)).toBeInTheDocument();
  });
});
