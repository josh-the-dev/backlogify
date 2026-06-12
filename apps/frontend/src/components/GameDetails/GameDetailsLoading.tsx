import { Skeleton } from "@/components/ui/skeleton";

export function GameDetailsLoading() {
	return (
		<div className="mx-auto w-full max-w-5xl px-6 pt-12 pb-16 sm:pt-24">
			<div className="flex flex-col gap-8 sm:flex-row sm:items-end">
				<Skeleton className="aspect-[3/4] w-40 shrink-0 rounded-xl sm:w-52" />
				<div className="flex-1 space-y-4 pb-1">
					<Skeleton className="h-10 w-2/3" />
					<Skeleton className="h-4 w-1/3" />
					<Skeleton className="h-9 w-36" />
				</div>
			</div>
			<div className="mt-10 max-w-3xl space-y-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	);
}
