import { type ActionFunctionArgs, redirect } from "@remix-run/node";

import { authenticator } from "~/models/auth.server";

export const action = ({ request }: ActionFunctionArgs) => {
	console.log("request", request);
	return authenticator.authenticate("auth0", request);
};