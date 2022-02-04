import * as React from 'react'
import { from, Observable, Subscribable, SubscribableOrPromise, Subscription } from 'rxjs'
import { useSubscription } from 'use-subscription'

interface ReadableObservable<T> extends Observable<T> {
  readonly value: T
}

type ObservedValueOf<T> = T extends ReadableObservable<infer U1> ? U1 : T extends Subscribable<infer U2> ? U2 | null : null

export function useObservable<T>(p: () => SubscribableOrPromise<T>, deps: any[]) {
  const [value, setValue] = React.useState(null as T | null)
  const [error, setError] = React.useState(null as null | Error)
  const [loading, setLoading] = React.useState(true)
  const subRef = React.useMemo(
    () => ({
      current: null as null | Subscription
    }),
    []
  )

  const reload = React.useMemo(
    () => () => {
      setLoading(true)
      setError(null)
      const sub = from(p()).subscribe(
        v => {
          setValue(() => v)
          setLoading(false)
        },
        err => {
          setLoading(false)
          setError(err)
          console.log(err)
        }
      )
        subRef.current = sub
        return sub
    },
    deps
  )

  React.useEffect(() => {
    reload()
    return () => {
      subRef.current?.unsubscribe()
    }
  },[reload])

  return [value, loading, reload, setValue, error] as [null | T, boolean, () => Subscription, (t: T) => void, null | Error]

}