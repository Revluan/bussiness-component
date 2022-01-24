import React from "react"
import { storiesOf } from '@storybook/react'

storiesOf('Welcome page', module)
  .add('welcome', () => {
    return (
      <>
        <h1>欢迎来到cj-business-component组件库</h1>
        <h3>安装逝逝</h3>
        <code>
          yarn add cj-business-component
        </code>
      </>
    )
  })