import { Home, Search } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "../../test/test-utils";
import { NavLink } from "./NavLink";

describe("NavLink", () => {
	it("renders with icon and label", async () => {
		await render(<NavLink to="/" icon={Home} label="Home" />);

		expect(screen.getByText("Home")).toBeInTheDocument();
	});

	it("renders as a link with correct href", async () => {
		await render(<NavLink to="/search" icon={Search} label="Search" />);

		const link = screen.getByRole("link", { name: /search/i });
		expect(link).toHaveAttribute("href", "/search");
	});

	it("calls onClick when clicked", async () => {
		const handleClick = vi.fn();
		await render(
			<NavLink to="/" icon={Home} label="Home" onClick={handleClick} />
		);

		fireEvent.click(screen.getByRole("link"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("renders with different icons", async () => {
		await render(<NavLink to="/" icon={Home} label="Home" />);

		expect(screen.getByText("Home")).toBeInTheDocument();
	});
});
