interface Props {
	message: string;
}
export function GameDetailsError({ message }: Props) {
	return <div className="p-6 text-center text-red-500">Error: {message}</div>;
}
