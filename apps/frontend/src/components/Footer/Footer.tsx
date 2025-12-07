export default function Footer() {
	return (
		<footer className="w-full bg-gray-900 py-6 text-gray-300">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-2">
				<p className="text-sm">
					&copy; {new Date().getFullYear()} Joshua Grant
				</p>

				<a
					href="https://rawg.io"
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs opacity-80 transition hover:opacity-100"
				>
					Powered by <span className="font-semibold underline">RAWG</span>
				</a>
			</div>
		</footer>
	);
}
