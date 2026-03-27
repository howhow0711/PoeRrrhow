import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App integration", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("updates regex and copies it", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("mod-search"), "雙王");
    const includeCheckbox = await screen.findByTestId(/include-/);
    await user.click(includeCheckbox);

    expect(screen.getByTestId("regex-output").textContent).not.toContain("目前沒有產生 Regex");

    await user.click(screen.getByTestId("copy-regex"));
    await waitFor(() => expect(screen.getByText("Regex 已複製到剪貼簿。")).toBeInTheDocument());
  });

  it("clears all filters and output", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("mod-search"), "雙王");
    const includeCheckbox = await screen.findByTestId(/include-/);
    await user.click(includeCheckbox);

    expect(screen.getByTestId("regex-output").textContent).not.toContain("目前沒有產生 Regex");

    await user.click(screen.getByTestId("clear-all"));

    expect(screen.getByTestId("mod-search")).toHaveValue("");
    expect(screen.getByTestId("regex-output").textContent).toContain("目前沒有產生 Regex");
  });

  it("uses corrected built-in labels without dictionary editing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByTestId("mod-search"), "奉獻地");
    expect(await screen.findByText("區域有數道奉獻地面")).toBeInTheDocument();
    expect(screen.queryByText("詞庫管理")).not.toBeInTheDocument();
  });
});
