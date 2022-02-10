import * as React from 'react'
import { SchemaFormField } from './types';
import { SchemaFormStore } from './form-store';
import { SubscribableOrPromise } from 'rxjs';
import { FormConfigConsumer } from './config';


export type FormProps = {
    schema: SchemaFormField[]
    noButton?: boolean
    form: SchemaFormStore
    initialValues?: any
    onSubmit?: (values: any) => SubscribableOrPromise<void>
    allowPristine?: boolean
    disableInitialize?: boolean
    dusableDestruction?: boolean
    style?: string
    className?: string
    compact?: boolean
}

const noopSubmit = () => {
    return Promise.resolve()
}

export function SchemaForm(props: FormProps) {
    const handleSubmit = React.useMemo(
        () => (e: React.FormEvent) => {
            e.preventDefault()
            props.form.submit(props.onSubmit || noopSubmit)
            return false
        },
        [props.form]
    )

    React.useEffect(() => {
        if (!props.disableInitialize) {
            props.form.initialize(props.initialValues)
        }
    }, [props.initialValues])

    React.useEffect(
        () => () => {
            if (!props.dusableDestruction) {
                props.form.clear()
            }
        },
        [props.form]
    )

    return (
        <FormConfigConsumer>
            {
                ({ componentMap }) => (
                    <form className={"schema-form" + (props.className || "") + (props.compact ? "schema-form--compact" : "")} style={props.style} onSubmit={handleSubmit}>

                    </form>
                )
            }
        </FormConfigConsumer>
    )
}