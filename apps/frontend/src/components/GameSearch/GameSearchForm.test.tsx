import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "../../test/test-utils";
import { GameSearchForm } from "./GameSearchForm";

describe("GameSearchForm", () => {
	beforeEach(() => {
		// shouldAdvanceTime keeps testing-library's waitFor polling alive
		// while still letting advanceTimersByTime drive the debounce
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders the search input", async () => {
		await render(<GameSearchForm onSearch={vi.fn()} />);

		expect(screen.getByPlaceholderText(/search for a game/i)).toBeInTheDocument();
	});

	it("populates input with defaultValue", async () => {
		await render(<GameSearchForm defaultValue="Elden Ring" onSearch={vi.fn()} />);

		expect(screen.getByDisplayValue("Elden Ring")).toBeInTheDocument();
	});

	it("calls onSearch with the trimmed query after the debounce delay", async () => {
		const onSearch = vi.fn();
		await render(<GameSearchForm onSearch={onSearch} />);

		const input = screen.getByPlaceholderText(/search for a game/i);
		fireEvent.change(input, { target: { value: "  Hades  " } });

		expect(onSearch).not.toHaveBeenCalled();

		vi.advanceTimersByTime(300);

		expect(onSearch).toHaveBeenCalledWith("Hades");
		expect(onSearch).toHaveBeenCalledTimes(1);
	});

	it("only fires once for rapid consecutive keystrokes", async () => {
		const onSearch = vi.fn();
		await render(<GameSearchForm onSearch={onSearch} />);

		const input = screen.getByPlaceholderText(/search for a game/i);
		fireEvent.change(input, { target: { value: "Ha" } });
		vi.advanceTimersByTime(100);
		fireEvent.change(input, { target: { value: "Hades" } });
		vi.advanceTimersByTime(300);

		expect(onSearch).toHaveBeenCalledTimes(1);
		expect(onSearch).toHaveBeenCalledWith("Hades");
	});

	it("calls onSearch immediately on submit, skipping the debounce", async () => {
		const onSearch = vi.fn();
		await render(<GameSearchForm onSearch={onSearch} />);

		const input = screen.getByPlaceholderText(/search for a game/i);
		fireEvent.change(input, { target: { value: "Hades" } });
		fireEvent.submit(input.closest("form")!);

		expect(onSearch).toHaveBeenCalledWith("Hades");
		expect(onSearch).toHaveBeenCalledTimes(1);

		// The pending debounce timer must not fire a second time
		vi.advanceTimersByTime(300);
		expect(onSearch).toHaveBeenCalledTimes(1);
	});

	it("clears the input and resets the search via the clear button", async () => {
		const onSearch = vi.fn();
		await render(<GameSearchForm defaultValue="Hades" onSearch={onSearch} />);

		fireEvent.click(screen.getByRole("button", { name: /clear search/i }));

		expect(onSearch).toHaveBeenCalledWith("");
		expect(screen.getByPlaceholderText(/search for a game/i)).toHaveValue("");
	});
});
