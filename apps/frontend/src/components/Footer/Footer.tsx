export default function Footer() {
	return (
		<footer className="w-full border-t border-border bg-background py-6 text-muted-foreground">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4">
				<p className="text-sm">
					&copy; {new Date().getFullYear()} Joshua Grant
				</p>

				<a
					href="https://rawg.io"
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs transition hover:text-foreground"
				>
					Powered by <span className="font-semibold underline">RAWG</span>
				</a>
			</div>
		</footer>
	);
}
