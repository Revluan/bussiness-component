export function deepGetByString(target: any, key: string): any {
    return deepGet(target, key.split("."))
}

export function deepGet(target: any, keys: (string | number)[], i=0): any {
    if(i >= keys.length || target == undefined) {
        return target
    } else {
        return deepGet(target[keys[i]], keys, i+1)
    }
}

export function deepSet(target: any, keys: (string | number)[], newValue: any, i = 0, parentCursor?: any): any {
    if(!keys.length) {
        return newValue
    }
    if(!parentCursor) {
        target = Array.isArray(target) ? [...target] : {...target}
        parentCursor = target
    }
    if(i === keys.length - 1) {
        parentCursor[keys[i]] = newValue
        return target
    } else {
        const key = keys[i]
        const oldValue = parentCursor[keys[i]]
        if(Array.isArray(oldValue)) {
            parentCursor[keys[i]] = [...oldValue]
        } else if (typeof oldValue === 'object') {
            parentCursor[keys[i]] = {...oldValue}
        } else {
            parentCursor[keys[i]] = typeof key === 'number' ? [] : {}
        }
        return deepSet(target, keys, newValue, i+1, parentCursor[keys[i]])
    }
}

export function randomID() {
    return String(Math.floor(Math.random() * 1000000000))
}