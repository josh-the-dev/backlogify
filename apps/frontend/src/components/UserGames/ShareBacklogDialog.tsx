import { RESERVED_USERNAMES, USERNAME_PATTERN } from "@backlogify/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
	profileQueryOptions,
	useUpdateProfile,
	UsernameTakenError,
} from "../../queries/profiles";

interface ShareBacklogDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ShareBacklogDialog({
	open,
	onOpenChange,
}: ShareBacklogDialogProps) {
	const profileQuery = useQuery(profileQueryOptions());
	const updateProfile = useUpdateProfile();

	// The form reads from the saved profile by default; `draft` holds the
	// user's in-progress edits and overrides it. Clearing draft on close means
	// the next open reflects the latest saved values - no prop-sync Effect.
	const [draft, setDraft] = useState<{
		username: string;
		isPublic: boolean;
	} | null>(null);
	const [taken, setTaken] = useState(false);
	const [copied, setCopied] = useState(false);

	const profile = profileQuery.data;
	const username = draft?.username ?? profile?.username ?? "";
	const isPublic = draft?.isPublic ?? profile?.isPublic ?? false;

	const setOpen = (next: boolean) => {
		if (!next) {
			setDraft(null);
			setTaken(false);
			setCopied(false);
		}
		onOpenChange(next);
	};

	// Same rules the backend enforces, for instant feedback
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
		<Dialog open={open} onOpenChange={setOpen}>
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
								onChange={(e) => {
									setTaken(false);
									setDraft({
										username: e.target.value.toLowerCase().trim(),
										isPublic,
									});
								}}
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
							onCheckedChange={(next) => setDraft({ username, isPublic: next })}
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
