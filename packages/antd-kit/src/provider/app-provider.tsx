import type { EnvironmentConfig } from "@ps/hooks-core"
import {
  EnvironmentProvider,
  AuthProvider,
  RequestProvider,
} from "@ps/hooks-core"
import type { HttpClient } from "@ps/web-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"


export interface AppProviderProps {
  readonly children: ReactNode
  readonly httpClient: HttpClient
  readonly environment: EnvironmentConfig
  readonly authConfig?: {
    readonly loginUrl: string
    readonly meUrl: string
    readonly tokenStorageKey: string
  }
}

const defaultAuthConfig = {
  loginUrl: "/api/auth/login",
  meUrl: "/api/auth/me",
  tokenStorageKey: "purchase_system_token",
}

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProvider({
  children,
  httpClient,
  environment,
  authConfig = defaultAuthConfig,
}: AppProviderProps): ReactNode {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <EnvironmentProvider config={environment}>
        <AuthProvider config={authConfig}>
          <RequestProvider client={httpClient}>{children}</RequestProvider>
        </AuthProvider>
      </EnvironmentProvider>
    </QueryClientProvider>
  )
}
