import { BehaviorSubject, identity, OperatorFunction, SubscribableOrPromise, from } from 'rxjs';
import { debounceTime, distinctUntilKeyChanged } from "rxjs/operators";
import { SchemaFormState, FieldPath, SchemaFormField } from './types';
import { deepSet } from '../../utils/deep-set-get';

type ErrorMap = Record<string, any>

type CreateFormOptions = {
    validator?: (v: any) => Promise<ErrorMap>,
    validationDelay?: number,
    middleware?: OperatorFunction<SchemaFormState, SchemaFormState>,
    reInitializeOnSubmitSuccess?: boolean
}

const CLEARED_MAP = {}

export class SchemaFormStore extends BehaviorSubject<SchemaFormState> {
    static DefaultFormState = {
        submitting: false,
        submitSuccessed: false,
        initialValues: CLEARED_MAP,
        errors: CLEARED_MAP,
        values: CLEARED_MAP,
        valid: true,
        hasValidator: false,
        validating: false
    }

    constructor(protected options?: CreateFormOptions) {
        super({
            ...SchemaFormStore.DefaultFormState,
            hasValidator: !!options?.validator
        })

        const validator = options?.validator

        const store = this

        const hasValidationError = (errorInfo: any): boolean => {
            return Object.keys(errorInfo).some(y => {
                const errorItem = errorInfo[y]
                if(Array.isArray(errorItem)) {
                    return errorItem.some(hasValidationError)
                }
                if(errorItem !== null && typeof errorItem === 'object') {
                    return hasValidationError(errorItem)
                } else {
                    return !!errorItem
                }
            })
        }

        store
            .pipe(options?.middleware || identity, distinctUntilKeyChanged("values"), debounceTime((options && options.validationDelay) || 50))
            .subscribe(async curFs => {
                if(!!validator && curFs.values !== CLEARED_MAP) {
                    store.next({
                        ...store.value,
                        validating: true
                    })
                    const errors = await validator(curFs.values)
                    store.next({
                        ...store.value,
                        validating: false,
                        valid: !hasValidationError(errors),
                        errors
                    })
                } else if(store.value.errors !== CLEARED_MAP) {
                    store.next({
                        ...store.value,
                        valid: true,
                        errors: CLEARED_MAP
                    })
                }
            })
            return store
    }

    change(key: FieldPath, valueOrEvent: any, parse?: SchemaFormField["parse"]) {
        const newValue = valueOrEvent && typeof valueOrEvent === 'object' && 'target' in valueOrEvent ? valueOrEvent.target.value : valueOrEvent
        this.next({
            ...this.value,
            values: deepSet(this.value.values, key, parse ? parse(newValue) : newValue),
            valid: this.value.hasValidator ? false : true
        })
    }

    initialize(initialValues: any) {
        return this.next({
            ...this.value,
            values: initialValues,
            initialValues: initialValues,
            submitSuccessed: false,
            submitting: false,
            validating: false
        })
    }

    clear() {
        this.next({
            ...this.value,
            ...SchemaFormStore.DefaultFormState
        })
    }

    reset() {
        this.next({
            ...this.value,
            values: this.value.initialValues
        })
    }

    submit(submitFunc: (formValue: any) => SubscribableOrPromise<void>) {
        const form = this
        const values = form.value.values
        const maybePromise = from(submitFunc(values)).toPromise()
        form.next({
            ...form.value,
            submitting: true
        })
        maybePromise
            .then(() => {
                setTimeout(() => {
                    form.next({
                        ...form.value,
                        ...(this.options?.reInitializeOnSubmitSuccess
                            ? {
                                initialValues: form.value.values
                            }
                            : {}),
                            submitSuccessed: true,
                            submitting: false,
                    })
                })
            })
            .catch((error: Error | SubmissionError) => {
                if(error instanceof SubmissionError) {
                    setTimeout(() => {
                        form.next({
                            ...form.value,
                            errors: {
                                ...form.value.errors,
                                ...error.error
                            },
                            submitting: false,
                            submitSuccessed: false
                        })   
                    });
                } else {
                    setTimeout(() => {
                        form.next({
                            ...this.value,
                            submitting: false,
                            submitSuccessed: false
                        })   
                    })
                    throw error
                }
            })
    }
}

export function createFormStore(options?: CreateFormOptions) {
    return new SchemaFormStore(options)
}

export class SubmissionError {
    constructor(public error: any) {}
}