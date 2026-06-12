import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

interface SignInSearch {
	redirect?: string;
}

export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
	validateSearch: (search: Record<string, unknown>): SignInSearch => {
		return {
			redirect: typeof search.redirect === "string" ? search.redirect : undefined,
		};
	},
});

function SignInPage() {
	const { redirect } = Route.useSearch();

	return (
		<div className="flex flex-1 items-center justify-center py-12">
			<SignIn
				fallbackRedirectUrl={redirect || "/"}
				signUpUrl="/sign-up"
			/>
		</div>
	);
}
