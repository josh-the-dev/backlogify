import { SignUp } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

interface SignUpSearch {
	redirect?: string;
}

export const Route = createFileRoute("/sign-up")({
	component: SignUpPage,
	validateSearch: (search: Record<string, unknown>): SignUpSearch => {
		return {
			redirect: typeof search.redirect === "string" ? search.redirect : undefined,
		};
	},
});

function SignUpPage() {
	const { redirect } = Route.useSearch();

	return (
		<div className="flex flex-1 items-center justify-center py-12">
			<SignUp
				fallbackRedirectUrl={redirect || "/"}
				signInUrl="/sign-in"
			/>
		</div>
	);
}
