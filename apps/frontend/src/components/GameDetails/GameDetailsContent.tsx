import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { GameDetails as GameDetailsType } from "@backlogify/types";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { Calendar, Gamepad, Tag } from "lucide-react";
import { AddToBacklogButton } from "../AddToBacklogButton";

export function GameDetailsContent({ game }: { game: GameDetailsType }) {
	const formattedDate = game.releaseDate
		? format(new Date(game.releaseDate), "dd MMM yyyy")
		: "Unknown";

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="text-3xl">{game.name}</CardTitle>
						<CardDescription className="flex items-center gap-2 mt-1">
							<Calendar className="size-4" />
							{formattedDate}
						</CardDescription>
					</div>
					<AddToBacklogButton
						externalServiceId={game.id.toString()}
						name={game.name}
						coverUrl={game.coverUrl}
					/>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{game.coverUrl && (
					<img
						src={game.coverUrl}
						alt={game.name}
						className="max-h-[500px] w-full rounded-xl object-cover shadow-lg"
					/>
				)}

				{game.genres?.length > 0 && (
					<div className="flex flex-wrap items-center gap-2">
						<Tag className="size-4 text-muted-foreground" />
						{game.genres.map((genre) => (
							<Badge key={genre} variant="secondary">
								{genre}
							</Badge>
						))}
					</div>
				)}

				{game.platforms?.length > 0 && (
					<div className="flex flex-wrap items-center gap-2">
						<Gamepad className="size-4 text-muted-foreground" />
						{game.platforms.map((platform) => (
							<Badge key={platform} variant="outline">
								{platform}
							</Badge>
						))}
					</div>
				)}

				<div
					className="prose prose-neutral dark:prose-invert max-w-none"
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(game.description),
					}}
				/>
			</CardContent>
		</Card>
	);
}
