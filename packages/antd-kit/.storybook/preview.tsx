import type { Preview } from "@storybook/react"
import type { EnvironmentConfig } from "@ps/hooks-core"

import React from "react"
import { AppProvider } from "../src/provider/app-provider"
import { createMockHttpClient } from "./mock-client"

const environment: EnvironmentConfig = {
  mode: "mock",
  apiBaseUrl: "/api",
}

const mockHttpClient = createMockHttpClient()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        AppProvider,
        {
          httpClient: mockHttpClient,
          environment,
        },
        React.createElement(Story)
      ),
  ],
}

export default preview
