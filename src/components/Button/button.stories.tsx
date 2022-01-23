import React from 'react'
import { storiesOf, addParameters } from '@storybook/react'
import Button from './button'
import { ButtonSize, ButtonType } from './buttonTypes'
import { DocsPage, DocsContainer } from '@storybook/addon-docs'

const buttonWithSize = () => (
  <>
    <Button size={ButtonSize.Large}> large button </Button>
    <Button size={ButtonSize.Small}> small button </Button>
  </>
)

const buttonWithType = () => (
  <>
    <Button btnType={ButtonType.Primary}> primary button </Button>
    <Button btnType={ButtonType.Danger}> danger button </Button>
    <Button btnType={ButtonType.Link} href="https://google.com"> link button </Button>
  </>
)

storiesOf('Button Component', module)
  .addParameters({
    info: {
      text: 'this is a very nice component',
      inline: true
    },
    docs: {
      container: DocsContainer,
      page: DocsPage,
    },
  })
  .add('不同尺寸的 Button', buttonWithSize)
  .add('不同类型的 Button', buttonWithType)
