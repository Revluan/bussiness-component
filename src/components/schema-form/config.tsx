import * as React from 'react'
import { WidgetProps } from './types'

export type FormButtonsProps = {
    disabled?: boolean
    pristine?: boolean
    submitSuccessed: boolean
    submitting: boolean
    onSubmit: (e?: any) => void
    onReset: (e?: any) => void
    style?: React.CSSProperties
}

type Widget = React.FC<WidgetProps> | React.ComponentClass<WidgetProps>

const defaultFormButtonsImpl = (props: FormButtonsProps) => {
    return (
        <div className="button">
            <div className='btn-group'>
                <button type="submit" className={"btn btn-primary" + (props.disabled ? "disabled" : "")} disabled={props.disabled} onClick={props.onSubmit}>
                    submit
                </button>
                <button type="submit" className={"btn btn-primary" + (props.disabled ? "disabled" : "")} disabled={props.disabled} onClick={props.onReset}>
                    reset
                </button>
            </div>
        </div>
    )
}

export type ComponentMap = Map<string, Widget>

export type FormConfig = {
    componentMap: ComponentMap
    buttonRenderer: (props: FormButtonsProps) => JSX.Element
}

export const defaultFormConfig: FormConfig = {
    componentMap: new Map<string, Widget>(),
    buttonRenderer: defaultFormButtonsImpl
}

const { Provider, Consumer } = React.createContext(defaultFormConfig)

export const FormConfigProvider = Provider
export const FormConfigConsumer = Consumer