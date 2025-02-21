declare global {
  const process: {
    env: {
      NODE_ENV: "production" | "development";
      AUTH0_CALLBACK_URL: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      AUTH0_DOMAIN: string;
    };
  };
}
export {};
