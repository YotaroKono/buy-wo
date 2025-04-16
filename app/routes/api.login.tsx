import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/models/auth.server";

export const loader = () => redirect("/login");

export const action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate("auth0", request);
};