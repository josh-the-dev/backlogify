import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import {
	profileQueryOptions,
	useUpdateProfile,
	UsernameTakenError,
} from "../../queries/profiles";

// Mirrors the backend USERNAME_PATTERN + RESERVED_USERNAMES in
// update-profile.dto.ts so the user gets instant feedback; the backend
// enforces both regardless.
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28})[a-z0-9]$/;
const RESERVED_USERNAMES = new Set([
	"u",
	"api",
	"games",
	"my-games",
	"sign-in",
	"sign-up",
	"signin",
	"signup",
	"settings",
	"profile",
	"profiles",
	"me",
	"admin",
	"administrator",
	"root",
	"support",
	"help",
	"about",
	"contact",
	"backlogify",
	"official",
	"staff",
	"mod",
	"moderator",
	"system",
	"null",
	"undefined",
	"anonymous",
	"www",
	"mail",
	"assets",
	"static",
	"favicon",
]);

export function ShareBacklogDialog() {
	const profileQuery = useQuery(profileQueryOptions());
	const updateProfile = useUpdateProfile();

	const [open, setOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [isPublic, setIsPublic] = useState(false);
	const [taken, setTaken] = useState(false);
	const [copied, setCopied] = useState(false);

	const profile = profileQuery.data;

	// Seed local state from the loaded profile when the dialog opens, so edits
	// start from what's saved without a sync Effect.
	const handleOpenChange = (next: boolean) => {
		if (next) {
			setUsername(profile?.username ?? "");
			setIsPublic(profile?.isPublic ?? false);
			setTaken(false);
			setCopied(false);
		}
		setOpen(next);
	};

	const isReserved = RESERVED_USERNAMES.has(username);
	const isValid = USERNAME_PATTERN.test(username) && !isReserved;
	const showError = username.length > 0 && !isValid;
	// The saved, currently-public link is what visitors can actually reach.
	const liveUrl =
		profile?.isPublic && profile.username
			? `${typeof window !== "undefined" ? window.location.origin : ""}/u/${profile.username}`
			: null;

	const handleSave = () => {
		setTaken(false);
		updateProfile.mutate(
			{ username, isPublic },
			{
				onSuccess: () => setOpen(false),
				onError: (error) => {
					if (error instanceof UsernameTakenError) setTaken(true);
				},
			},
		);
	};

	const handleCopy = async () => {
		if (!liveUrl) return;
		await navigator.clipboard.writeText(liveUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Share2 className="size-4" />
					Share
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share your backlog</DialogTitle>
					<DialogDescription>
						Claim a username and make your library public so anyone with the
						link can see it.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<label htmlFor="share-username" className="text-sm font-medium">
							Username
						</label>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">/u/</span>
							<Input
								id="share-username"
								value={username}
								onChange={(e) =>
									setUsername(e.target.value.toLowerCase().trim())
								}
								placeholder="your-name"
								maxLength={30}
								aria-invalid={showError || taken}
								autoComplete="off"
							/>
						</div>
						{showError &&
							(isReserved ? (
								<p className="text-destructive text-xs">
									That username isn&apos;t available. Try another.
								</p>
							) : (
								<p className="text-destructive text-xs">
									3-30 characters: letters, numbers, hyphens or underscores,
									starting and ending with a letter or number.
								</p>
							))}
						{taken && (
							<p className="text-destructive text-xs">
								That username is taken. Try another.
							</p>
						)}
					</div>

					<div className="border-border flex items-center justify-between rounded-lg border p-3">
						<div className="pr-4">
							<p className="text-sm font-medium">Public backlog</p>
							<p className="text-muted-foreground text-xs">
								Anyone with the link can view it. Off by default.
							</p>
						</div>
						<Switch
							checked={isPublic}
							onCheckedChange={setIsPublic}
							aria-label="Make backlog public"
						/>
					</div>

					{liveUrl && (
						<div className="space-y-1.5">
							<p className="text-sm font-medium">Your link</p>
							<div className="flex items-center gap-2">
								<Input readOnly value={liveUrl} className="text-xs" />
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={handleCopy}
									aria-label="Copy link"
								>
									{copied ? (
										<Check className="size-4" />
									) : (
										<Copy className="size-4" />
									)}
								</Button>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={!isValid || updateProfile.isPending}
					>
						{updateProfile.isPending ? "Saving…" : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
