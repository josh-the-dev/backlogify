import type { UserGame } from "@backlogify/types";
import { formatDistanceToNowStrict } from "date-fns";
import { computeLibraryStats } from "../../lib/library-stats";

function StatTile({
	label,
	value,
	sub,
}: {
	label: string;
	value: string;
	sub?: string;
}) {
	return (
		<div className="border-border/60 bg-card rounded-lg border px-4 py-3">
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="font-display mt-1 text-2xl font-bold tracking-tight">
				{value}
			</dd>
			{sub && <dd className="text-muted-foreground mt-0.5 text-xs">{sub}</dd>}
		</div>
	);
}

/** Stats strip under the My Games header. Renders nothing for an empty
 *  library; the page's empty state covers that. */
export function LibraryStats({ games }: { games: UserGame[] }) {
	if (games.length === 0) return null;

	const stats = computeLibraryStats(games);
	const year = new Date().getFullYear();

	return (
		<dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
			<StatTile
				label="Completion rate"
				value={`${stats.completionRate}%`}
				sub={`${stats.played} of ${stats.total} played`}
			/>
			<StatTile
				label={`Finished in ${year}`}
				value={String(stats.finishedThisYear)}
				sub={
					stats.finishedThisYear === 0 ? "No finishes yet. One day." : undefined
				}
			/>
			{stats.oldestBacklog && (
				<StatTile
					label="Oldest backlog entry"
					value={formatDistanceToNowStrict(stats.oldestBacklog.addedAt)}
					sub={`since you added ${stats.oldestBacklog.name}`}
				/>
			)}
		</dl>
	);
}
