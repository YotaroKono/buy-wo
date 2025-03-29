import { type ActionFunctionArgs, redirect } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";

export const action = ({ request }: ActionFunctionArgs) => {
	console.log("request", request);
	return authenticator.authenticate("auth0", request);
};