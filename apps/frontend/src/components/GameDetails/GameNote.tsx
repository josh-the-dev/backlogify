import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { UserGame } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	useUpdateUserGameNote,
	userGamesQueryOptions,
} from "../../queries/user-games";

/**
 * Personal note editor shown on a game's detail page once the game is in
 * the user's library. Render inside <SignedIn> only.
 */
export function GameNote({ externalServiceId }: { externalServiceId: string }) {
	const userGamesQuery = useQuery(userGamesQueryOptions());
	const updateNote = useUpdateUserGameNote();
	const [draft, setDraft] = useState<string | null>(null);

	const game = userGamesQuery.data?.find(
		(g: UserGame) => g.externalServiceId === externalServiceId,
	);

	if (!game) return null;

	const savedNote = game.note ?? "";
	const value = draft ?? savedNote;
	const isDirty = draft !== null && draft !== savedNote;

	const handleSave = () => {
		if (draft === null) return;
		updateNote.mutate(
			{ gameId: game.id, note: draft.trim() || null },
			{ onSuccess: () => setDraft(null) },
		);
	};

	return (
		<div className="mt-10 max-w-xl">
			<label className="font-medium text-sm" htmlFor="game-note">
				Your note
			</label>
			<Textarea
				id="game-note"
				value={value}
				onChange={(e) => setDraft(e.target.value)}
				placeholder="Where you left off, what you thought, why it's still on the list..."
				rows={3}
				maxLength={500}
				className="mt-2"
			/>
			{isDirty && (
				<div className="mt-2 flex gap-2">
					<Button size="sm" onClick={handleSave} disabled={updateNote.isPending}>
						{updateNote.isPending ? "Saving..." : "Save note"}
					</Button>
					<Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
						Cancel
					</Button>
				</div>
			)}
		</div>
	);
}
