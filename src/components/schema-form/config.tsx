import * as React from 'react'
import { WidgetProps } from './types'

type Widget = React.FC<WidgetProps> | React.ComponentClass<WidgetProps>

export type ComponentMap = Map<string, Widget>
