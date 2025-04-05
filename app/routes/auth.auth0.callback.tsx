import type { LoaderFunctionArgs } from "@remix-run/node";

import { authenticator } from "~/models/auth.server";

export const loader = ({ request }: LoaderFunctionArgs) => {
	return authenticator.authenticate("auth0", request, {
		successRedirect: "/",
		failureRedirect: "/?loginFailed=true",
	});
};
