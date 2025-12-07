import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Home, Search, Library, Settings, BookOpen } from "lucide-react";
import { NavLink } from "./NavLink";

const meta = {
	title: "Navigation/NavLink",
	component: NavLink,
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "dark",
			values: [{ name: "dark", value: "#1f2937" }],
		},
	},
	tags: ["autodocs"],
	args: {
		onClick: fn(),
	},
	argTypes: {
		icon: {
			control: false,
		},
	},
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		to: "/",
		icon: Home,
		label: "Home",
	},
};

export const SearchLink: Story = {
	args: {
		to: "/search",
		icon: Search,
		label: "Search Games",
	},
};

export const LibraryLink: Story = {
	args: {
		to: "/library",
		icon: Library,
		label: "My Library",
	},
};

export const SettingsLink: Story = {
	args: {
		to: "/settings",
		icon: Settings,
		label: "Settings",
	},
};

export const DocumentationLink: Story = {
	args: {
		to: "/docs",
		icon: BookOpen,
		label: "Documentation",
	},
};
