import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "preact";
import { act } from "preact/test-utils";
import { App, boards, makeBoard } from "../App";

let container: HTMLDivElement;

beforeEach(() => {
  window.history.replaceState(null, "", "/guitar/");
  // App.tsx's `boards` signal is a module-level singleton, so reset it to a
  // known single-board state before each test rather than relying on
  // whatever the previous test left behind.
  boards.value = [makeBoard()];

  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    render(<App />, container);
  });
});

afterEach(() => {
  render(null, container);
  container.remove();
});

function panelCount(): number {
  return container.querySelectorAll(".fretboard-panel").length;
}

function clickButtonWithText(text: string, within: ParentNode = container) {
  const button = [...within.querySelectorAll("button")].find((b) => b.textContent === text);
  if (!button) throw new Error(`No button found with text "${text}"`);
  act(() => {
    button.dispatchEvent(new Event("click", { bubbles: true }));
  });
}

describe("App multi-fretboard rendering", () => {
  it("starts with exactly one fretboard panel", () => {
    expect(panelCount()).toBe(1);
  });

  it("clicking 'Add fretboard' actually adds a rendered panel, not just internal state", () => {
    clickButtonWithText("Add fretboard");
    expect(panelCount()).toBe(2);
    expect(boards.value.length).toBe(2);

    clickButtonWithText("Add fretboard");
    expect(panelCount()).toBe(3);
  });

  it("clicking 'Remove this fretboard' on a specific panel removes only that one", () => {
    clickButtonWithText("Add fretboard");
    clickButtonWithText("Add fretboard");
    expect(panelCount()).toBe(3);

    const panels = container.querySelectorAll(".fretboard-panel");
    clickButtonWithText("Remove this fretboard", panels[1]);

    expect(panelCount()).toBe(2);
    expect(boards.value.length).toBe(2);
  });

  it("removing every board leaves zero panels (no crash) and Add still works", () => {
    clickButtonWithText("Remove this fretboard");
    expect(panelCount()).toBe(0);

    clickButtonWithText("Add fretboard");
    expect(panelCount()).toBe(1);
  });

  it("two new boards don't share the same underlying transform objects", () => {
    // Regression test for the actual risk: QueryInput's update functions
    // (e.g. updateKeyOfTransform) shallow-copy the array but then mutate a
    // transform's .args IN PLACE -- reproduced directly here rather than via
    // simulated clicks, since it's the object-identity behavior under test,
    // not the UI. If two boards' default transforms were the same
    // underlying objects (i.e. makeBoard() didn't structuredClone), this
    // mutation would leak into both.
    clickButtonWithText("Add fretboard");
    const [firstBoard, secondBoard] = boards.value;
    const secondBoardArgsBefore = secondBoard.transforms.value[0].args[1];

    act(() => {
      const newTransforms = [...firstBoard.transforms.value];
      newTransforms[0].args[1] = "some-mutated-value";
      firstBoard.transforms.value = newTransforms;
    });

    expect(firstBoard.transforms.value[0].args[1]).toBe("some-mutated-value");
    expect(secondBoard.transforms.value[0].args[1]).toBe(secondBoardArgsBefore);
  });
});
