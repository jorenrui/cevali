import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Cevali</span>,
  project: {
    link: 'https://github.com/jorenrui/cevali',
  },
  docsRepositoryBase: 'https://github.com/jorenrui/cevali',
  footer: {
    text: () => {
      return (
        <span className="nx-text-sm">
          2023 © Joeylene (jorenrui)
        </span>
      )
    },
  },
}

export default config