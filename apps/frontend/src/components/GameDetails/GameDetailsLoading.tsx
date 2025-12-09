import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GameDetailsLoading() {
	return (
		<div className="container mx-auto max-w-4xl p-6">
			<Card>
				<CardHeader>
					<Skeleton className="h-8 w-2/3" />
					<Skeleton className="h-4 w-1/3" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-6 md:flex-row">
						<Skeleton className="h-80 w-60 rounded-lg" />
						<div className="flex-1 space-y-3">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<div className="flex gap-2 pt-4">
								<Skeleton className="h-6 w-20 rounded-full" />
								<Skeleton className="h-6 w-20 rounded-full" />
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
