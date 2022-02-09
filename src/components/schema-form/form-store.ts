import { BehaviorSubject, OperatorFunction } from "rxjs";
import { SchemaFormState } from "./types";

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
    }

}