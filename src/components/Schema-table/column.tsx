import * as React from 'react'
import moment from 'moment'
import { from, of, SubscribableOrPromise } from 'rxjs';
import { map } from 'rxjs/operators'
import { Switch, SwitchProps, Tag } from 'antd';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { FilterDropdown } from './filter-dropdown';

type ColumnEnumOptions = {
    onClick?: (value: any) => void
    palettes?: string[]
    type?: 'tag' | 'text'
    filterable?: boolean
    emptyText?: string
    showUnlistedValue?: boolean
    filterMultiple?: boolean
}

export interface EnumOption {
    label: string
    value: string | number | boolean | null
    color?: string
}

function SwitchCell(props: { data: any, onChange: (res: unknown) => SubscribableOrPromise<unknown> } & Partial<SwitchProps>) {
    const [loading, setLoading] = React.useState(false)
    const { data, onChange, ...rest } = props
    return (
        <Switch
            loading={loading}
            size='small'
            onChange={React.useMemo(
                () => () => {
                    setLoading(true)
                    from(props.onChange(props.data))
                        .toPromise()
                        .then(
                            () => setLoading(false)
                        )
                }, [props.data, props.onChange]
            )}
        />
    )
}

export const ColumnTypes = {
    date: async () => ({
        format: (v: any) => {
            if (v === null || v === undefined || v === '') {
                return ''
            }
            const date = moment(v)
            if (!date.isValid()) {
                return ''
            }
            return date.format('YYYY/MM/DD')
        }
    }),

    datetime: async () => ({
        format: (v: any) => {
            if (v === null || v === undefined || v === '') {
                return ''
            }
            const date = moment(v)
            if (!date.isValid()) {
                return ''
            }
            return date.format('YYYY/MM/DD[\n]HH:mm:ss')
        }
    }),

    unixtime: async () => ({
        format: (v: any) => {
            if (isFinite(v) && v > 0) return moment.unix(v).format('YYYY/MM/DD[\n]HH:mm:ss')
            return ''
        }
    }),

    text: async () => ({
        format: (v: any) => v
    }),

    switch: (
        options: {
            onChange: (data: any) => SubscribableOrPromise<any>
            isChecked: (v: any) => boolean
            isDisabled?: (data: any) => boolean
        } & Omit<SwitchProps, 'disabled' | 'checked' | 'onChange'>
    ) => {
        const {
            onChange,
            isChecked = Boolean,
            checkedChildren = '是',
            unCheckedChildren = '否',
            isDisabled,
            ...rest
        } = options
        return of({
            format: isChecked,
            render: (v: any, data: any) => {
                return (
                    <SwitchCell
                        data={data}
                        checked={v}
                        disabled={isDisabled ? isDisabled(data) : false}
                        onChange={onChange}
                        checkedChildren={checkedChildren}
                        unCheckedChildren={unCheckedChildren}
                        {...rest}
                    />
                )
            }
        })
    },

    enum: (getEnum: EnumOption[] | (() => SubscribableOrPromise<EnumOption[]>), options?: ColumnEnumOptions) => {
        const onClick = (options && options.onClick) || undefined
        const type = (options && options.type) || 'tag'
        const filterMultiple = options?.filterMultiple === undefined ? true : options?.filterMultiple
        return () => {
            const enums$ = Array.isArray(getEnum) ? of(getEnum) : from(getEnum())
            return enums$.pipe(
                map(enums => {
                    const valueMap = {} as Record<string, EnumOption>
                    const labelMap = {} as Record<string, [EnumOption, number]>
                    for (let i = 0; i < enums.length; i++) {
                        labelMap[enums[i].label] = [enums[i], i]
                        valueMap[enums[i].value + ''] = enums[i]
                    }

                    function formatSingle(v: any) {
                        if (v in valueMap) {
                            return valueMap[v].label
                        } else {
                            if (options?.showUnlistedValue) {
                                return v
                            } else {
                                return undefined
                            }
                        }
                    }

                    function renderSingle(label: any, palletes: string[]): React.ReactNode {
                        let maybeOption = labelMap[label]
                        let option: EnumOption
                        if (!maybeOption) {
                            if (options?.showUnlistedValue) {
                                option = { value: label, label }
                            } else {
                                return null
                            }
                        } else {
                            option = maybeOption[0]
                            if (!option.color) {
                                option.color = palletes[maybeOption[1] % palletes.length]
                            }
                        }
                        if (type === 'tag') {
                            return (
                                <Tag
                                    key={option.value + ''}
                                    style={{ cursor: !!onClick ? 'pointer' : undefined }}
                                    onClick={() => onClick && onClick(option.value)}
                                    color={option.color}
                                >
                                    {label}
                                </Tag>
                            )
                        } else if (type === 'text') {
                            return (
                                <span
                                    key={option.value + ''}
                                    style={{ cursor: !!onClick ? 'pointer' : undefined }}
                                    onClick={() => onClick && onClick(option.value)}
                                >
                                    {label}
                                </span>
                            )
                        } else {
                            return null
                        }
                    }
                    const filterDropdown = (props: FilterDropdownProps) => {
                        return <FilterDropdown {...props} enums={enums} filterMultiple={filterMultiple} />
                    }
                    return {
                        format: (v: any) => {
                            if (v instanceof Array) {
                                if (v.length === 0 && options?.emptyText) {
                                    return options.emptyText
                                }
                                return v.map(formatSingle) as any
                            } else {
                                if (v === undefined || v === '') {
                                    return options?.emptyText
                                }
                                return formatSingle(v)
                            }
                        },
                        render: (v: any): React.ReactNode => {
                            const palletes = (options && options.palettes) || COLD_PALLETES
                            if (options?.emptyText && v === options.emptyText) {
                                return v
                            }
                            if (v instanceof Array) {
                                return <>{v.map(x => renderSingle(x, palletes))}</>
                            } else {
                                return renderSingle(v, palletes)
                            }
                        },
                        ...(!!options?.filterable
                            ? {
                                filterDropdown
                            }
                            : {})
                    }

                })
            )
        }

    }

}

export const COLD_PALLETES = [
    '#1890FF',
    '#722ED1',
    '#69C0FF',
    '#B37FEB',
    '#13C2C2',
    '#2F54EB',
    '#85A5FF'
]