import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "../../test/test-utils";
import { GameSearchForm } from "./GameSearchForm";

describe("GameSearchForm", () => {
	it("renders the search input and button", async () => {
		await render(<GameSearchForm onSubmit={vi.fn()} />);

		expect(screen.getByPlaceholderText(/search for a game/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
	});

	it("populates input with defaultValue", async () => {
		await render(<GameSearchForm defaultValue="Elden Ring" onSubmit={vi.fn()} />);

		expect(screen.getByDisplayValue("Elden Ring")).toBeInTheDocument();
	});

	it("calls onSubmit with the trimmed query on submit", async () => {
		const onSubmit = vi.fn();
		await render(<GameSearchForm onSubmit={onSubmit} />);

		const input = screen.getByPlaceholderText(/search for a game/i);
		fireEvent.change(input, { target: { value: "  Hades  " } });
		fireEvent.submit(input.closest("form")!);

		expect(onSubmit).toHaveBeenCalledWith("Hades");
	});

	it("does not call onSubmit when query is blank", async () => {
		const onSubmit = vi.fn();
		await render(<GameSearchForm onSubmit={onSubmit} />);

		fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form")!);

		expect(onSubmit).not.toHaveBeenCalled();
	});
});
