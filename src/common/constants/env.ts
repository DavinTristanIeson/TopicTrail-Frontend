function assertEnvExists(name: string, value: any) {
  if (value == null) {
    throw new Error(`${name} doesn't exist in .env.local`)
  }
  return value;
}

const EnvironmentVariables = {
  ApiUrl: assertEnvExists("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
}

export default EnvironmentVariables;