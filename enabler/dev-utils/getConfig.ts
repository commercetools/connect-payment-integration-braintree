export const getConfig = () => {
  const config = {
    VITE_CTP_AUTH_URL: import.meta.env.VITE_CTP_AUTH_URL as string,
    VITE_CTP_API_URL: import.meta.env.VITE_CTP_API_URL as string,
    VITE_CTP_SESSION_URL: import.meta.env.VITE_CTP_SESSION_URL as string,
    VITE_CTP_CLIENT_ID: import.meta.env.VITE_CTP_CLIENT_ID as string,
    VITE_CTP_CLIENT_SECRET: import.meta.env.VITE_CTP_CLIENT_SECRET as string,
    VITE_CTP_PROJECT_KEY: import.meta.env.VITE_CTP_PROJECT_KEY as string,
    VITE_PROCESSOR_URL: import.meta.env.VITE_PROCESSOR_URL as string,
  };
  Object.keys(config).forEach((key) => {
    if (!config[key as keyof typeof config]) {
      console.warn(`Config parameter "${key}" is undefined.`);
    }
  });
  return config;
};
