import { FormItemProps } from 'antd/lib/form'
import { SubscribableOrPromise } from 'rxjs'
import { ComponentMap } from './config'
import { SchemaFormStore } from './form-store'

export type FormEnumOption = {
    label: string,
    value: string | number,
    disabled?: boolean,
    className?: string,
    style?: React.CSSProperties,
    autofill?: Record<string, unknown>
}

export type AsyncOptions = () => SubscribableOrPromise<FormEnumOption[]>

export type RuntimeAsyncOptions = (search: any) => SubscribableOrPromise<FormEnumOption[]>

type FieldListen = {
    to: string[] | ((keyPath: string) => string),
    then: (value: any[]) => Partial<SchemaFormField & { value: any }> | SubscribableOrPromise<Partial<SchemaFormField> & { value: any }> | void
}

export type WidgetInjectedProps = {
    hide?: boolean,
    placeholder?: string,
    fullWidth?: boolean,
    required?: boolean,
    disabled?: boolean,
    [propName: string]: any
}

export type SchemaFormField = {
    key: string,
    label: React.ReactNode,
    help?: React.ReactNode,
    type: string | React.ComponentClass<WidgetProps> | React.StatelessComponent<WidgetProps>,
    children?: SchemaFormField[],
    listens?: FieldListen[],
    dynamicListener?: (
        field: FieldProps,
        formValues: any,
        context: {
            parent: any
        }
    ) => SubscribableOrPromise<Partial<SchemaFormField & { value?: any }>>
    parse?: (v: any) => any,
    format?: (v: any) => any,
    style?: React.CSSProperties,
    defaultValue?: any,
    options?: FormEnumOption[] | AsyncOptions | RuntimeAsyncOptions,
    unixtime?: boolean,
    dateFormat?: string,
    wrapperProps?: Partial<FormItemProps>
} & WidgetInjectedProps

export type SchemaFormState = {
    submitting: boolean,
    submitSuccessed: boolean,
    errors: any,
    values: any,
    initialValues: any,
    valid: boolean,
    hasValidator: boolean,
    validating: boolean
}

export type FieldPath = (string | number)[]

export interface FieldProps {
    form: SchemaFormStore,
    schema: SchemaFormField,
    keyPath: FieldPath,
    noWrapper?: boolean,
    componentMap: ComponentMap
}

export type WidgetProps = {
    schema: SchemaFormField,
    form: SchemaFormStore,
    componentMap: ComponentMap,
    onChange: (e: any) => void,
    value: any,
    componentProps: any,
    keyPath: FieldPath,
    error: any
}