import * as React from "react"
import { combineLatest, from, of, SubscribableOrPromise } from "rxjs"
import { Button, Checkbox, Input, List, Popover, Table as AntdTable } from "antd"
import { ColumnProps, TableProps as AntdTableProps } from "antd/lib/table"
import { useObservable } from "../../utils/use-observables"
import { ColumnTypes } from "./column"
import { map } from 'rxjs/operators'
import { deepGetByString } from '../../utils/deep-set-get';
import { LoadingOutlined, MenuOutlined } from '@ant-design/icons'

type ValueFormatter<T> = (value: any, data: T, field: TableColumn<T>) => string | boolean | number | string[] | boolean[] | number
type ValueRenderer<T> = (value: any, data: T, field: TableColumn<T>) => React.ReactNode

export type TableColumn<T = any> = {
    key: keyof T
    label: React.ReactNode
    type?: () => SubscribableOrPromise<
        {
            format?: ValueFormatter<T>
            render?: ValueRenderer<T>
        } & Partial<Omit<ColumnProps<T>, "render">>
    >
    hide?: boolean
    render?: ValueRenderer<T>
} & Omit<ColumnProps<T>, "render">

export type SchemaTableProps<T = any> = {
    schema: TableColumn<T>[]
    showSelection?: boolean | ((t: T) => boolean)
    showPagination?: boolean
    hideCount?: boolean
    showSearch?: boolean
    searchPlaceHolder?: string
    showMenu?: boolean
    quietlyLoading?: boolean
    dataSource: T[]
    filterState?: Record<string, (string | number | boolean)[]>
    sortOrder?: "desc" | "asc"
    sortBy?: string | null
    actions?: (t: T) => React.ReactNode
    panel?: (selectedKeys: (string | number)[], selection: T[]) => React.ReactNode
    onSearchChange?: (v: string) => void
    onSelectionChange?: (v: T[]) => void
    onColumnVisibilityChange?: (visibleColumnKeys: string[]) => void
} & Omit<AntdTableProps<T>, "columns" | "dataSource">

const ACTION_COLUMN_KEY = "_action"

function mergeOptions<T>(...objs: T[]) {
    ; (Object.assign as any)(...objs)
    for (const k in objs[0]) {
        if (objs[0][k] == null) {
            delete objs[0][k]
        }
    }
}

function SchemaTable_<T extends object = any>(p: SchemaTableProps<T>) {

    const {
        schema,
        panel,
        actions,
        dataSource,
        hideCount,
        showSelection,
        showPagination,
        showSearch,
        searchPlaceHolder,
        showMenu,
        onSearchChange,
        onSelectionChange,
        onColumnVisibilityChange,
        filterState,
        sortBy,
        sortOrder,
        quietlyLoading,
        ...tableProps
    } = p

    const [maybeColumnsWithTypeInfos] = useObservable(() => {
        return combineLatest(
            schema.map(x => {
                const { key, label, type, hide, render: propRender, ...columnProps } = x
                const column: ColumnProps<T> = {
                    key: key,
                    title: label
                }
                if (x.type && x.type !== ColumnTypes.text) {
                    return from(x.type()).pipe(
                        map(typeDef => {
                            const { format = indentity, render: typeRender, ...rest } = typeDef
                            if (format) {
                                valueFormatterMap[String(x.key)] = format
                            }
                            if (typeRender || propRender) {
                                column.render = (_, d) => {
                                    const formatted = format ? format(deepGetByString(d, x.key as any), d, x) : deepGetByString(d, x.key as any)
                                    return (typeRender || (propRender as any))(formatted, d, x)
                                }
                            } else if (format) {
                                column.render = d => {
                                    return format ? format(deepGetByString(d, x.key as any), d, x) : deepGetByString(d, x.key as any)
                                }
                            }
                            mergeOptions(column, rest, columnProps)
                            return column
                        })
                    )
                } else {
                    valueFormatterMap[String(x.key)] = (t, d) => deepGetByString(d, x.key as any)
                    column.dataIndex = String(x.key).split(".")
                    if (propRender) {
                        column.render = (t, d) => propRender(deepGetByString(d, x.key as any), d, x)
                    }
                    mergeOptions(column, columnProps)
                    return of(column)
                }
            })
        )
    }, [schema])

    const columnWithTypeInfos = maybeColumnsWithTypeInfos as ColumnProps<T>[]

    const [visibleColumns, setVisibleColumns] = React.useState(() => schema.filter(x => !x.hide).map(x => String(x.key)))

    const columnsWithVisibility = React.useMemo(
        function updateColumnState() {
            if (columnWithTypeInfos) {
                let columnWithFilterState
                if (!sortBy && !filterState) {
                    columnWithFilterState = columnWithTypeInfos
                } else {
                    columnWithFilterState = columnWithTypeInfos.map(x => {
                        if (sortBy === x.key) {
                            x = {
                                ...x,
                                sortOrder: sortOrder === 'asc' ? 'ascend' : sortOrder === 'desc' ? 'descend' : undefined,
                            }
                        }
                        if (filterState && x.key && x.key in filterState) {
                            x = {
                                ...x,
                                filteredValue: filterState[x.key] as (string | number)[]
                            }
                        }
                        return x
                    })
                }
                return columnWithFilterState.filter(x => visibleColumns.indexOf(String(x.key)) >= 0 || x.key === '_action')
            }
        },
        [columnWithTypeInfos, sortBy, sortOrder, filterState, visibleColumns]
    )

    const finalColumns = React.useMemo(() => {
        if (columnsWithVisibility) {
            if (actions) {
                const actionColumn: ColumnProps<T> = {
                    key: ACTION_COLUMN_KEY,
                    title: '',
                    align: 'right',
                    fixed: 'right',
                    render: (_, t) => {
                        return actions(t)
                    }
                }
                if (isFixedWidth) {
                    actionColumn.fixed = 'right'
                }
                return columnsWithVisibility.concat(actionColumn)
            } else {
                return columnsWithVisibility
            }
        }
    }, [actions, columnsWithVisibility])

    const isFixedWidth = columnsWithVisibility && columnsWithVisibility.every(x => x.key === ACTION_COLUMN_KEY || !!x.width)

    const valueFormatterMap = React.useMemo(() => {
        return {} as { [name: string]: ValueFormatter<T> }
    }, [])

    const [quickSearch, setQuickSearch] = React.useState('')

    const onQuickSearchChange = React.useMemo(
        () => (v: string) => {
            setQuickSearch(v)
            if (onSearchChange) {
                onSearchChange(v)
            }
        },
        [onSearchChange]
    )

    const frontendSearchFilteredData: T[] = React.useMemo(() => {
        if (!columnsWithVisibility || !Array.isArray(dataSource)) {
            return emptyArray
        }
        if (!quickSearch || onSearchChange) {
            return dataSource
        }
        return dataSource.filter(x => {
            return schema.some(c => {
                const valueGetter = valueFormatterMap[c.key]
                const value = valueGetter(deepGetByString(x, c.key as any), x, c)
                return value instanceof Array
                    ? value.some((z: string | number | boolean) => String(z).includes(quickSearch))
                    : String(value).includes(quickSearch)
            })
        })
    }, [dataSource, quickSearch, columnsWithVisibility, onSearchChange])

    const [selection, setSelection] = React.useState({
        ids: [] as any,
        list: [] as any
    })

    const rowSelection: AntdTableProps<T>["rowSelection"] = React.useMemo(() => {
        if (!showSelection) {
            return undefined
        } else {
            const rowSelection: AntdTableProps<T>['rowSelection'] = {
                type: 'checkbox',
                selectedRowKeys: selection.ids,
                onChange: (v, list) => {
                    setSelection({
                        ids: v,
                        list: list
                    })
                    onSelectionChange && onSelectionChange(list)
                },
                ...(typeof showSelection === 'function'
                    ? {
                        getCheckboxProps: record => {
                            const visible = showSelection(record)
                            if (visible) {
                                return {}
                            }
                            return {
                                disabled: true,
                                style: {
                                    display: 'none'
                                }
                            }
                        }
                    }
                    : {}),
                fixed: true,
            }
            return rowSelection
        }
    }, [showSelection, selection])

    const pagination: AntdTableProps<T>['pagination'] = React.useMemo(() => {
        if (tableProps.pagination) {
            return {
                style: {
                    width: '100%',
                    position: 'relative',
                    textAlign: 'right'
                },
                ...(hideCount
                    ? {}
                    : {
                        showTotal: renderTotal,
                    }),
                ...tableProps.pagination
            }
        } else if (!showPagination) {
            return false
        } else {
            const pagination: AntdTableProps<T>['pagination'] = {
                style: {
                    width: '100%',
                    position: 'relative',
                    textAlign: 'right'
                },
                ...(hideCount
                    ? {}
                    : {
                        showTotal: renderTotal
                    }),
                total: (dataSource && dataSource.length) || 0
            }
            return pagination
        }
    }, [showPagination, tableProps.pagination])

    const shouldShowLoading = tableProps.loading || !columnsWithVisibility

    const visibilityTogglableColumns = React.useMemo(() => {
        return schema.filter(x => x.key !== ACTION_COLUMN_KEY && !!x.label)
    }, [schema])

    return (
        <>
            {
                showMenu || showSearch || panel ? (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 5
                        }}
                    >
                        <div>{p.panel && p.panel(selection.ids, selection.list)}</div>
                        <div>
                            {
                                quietlyLoading && shouldShowLoading ? (
                                    <Button size='small' shape='circle' icon={<LoadingOutlined />} style={{ margin: '0 10px', border: 'none' }}></Button>
                                ) : showMenu ? (
                                    <Popover
                                        trigger={'click'}
                                        placement="bottomLeft"
                                        content={
                                            <List
                                                style={{
                                                    maxHeight: 400,
                                                    overflow: 'auto'
                                                }}
                                                rowKey={'key'}
                                                size='small'
                                                dataSource={visibilityTogglableColumns}
                                                renderItem={x => {
                                                    return (
                                                        <List.Item key={String(x.key)}>
                                                            <Checkbox
                                                                checked={visibleColumns.indexOf(String(x.key)) >= 0}
                                                                onChange={() => {
                                                                    const clone = visibleColumns.slice()
                                                                    const i = visibleColumns.indexOf(String(x.key))
                                                                    if (i >= 0) {
                                                                        clone.splice(i, 1)
                                                                    } else {
                                                                        clone.push(String(x.key))
                                                                    }
                                                                    setVisibleColumns(clone)
                                                                    onColumnVisibilityChange?.(clone)
                                                                }}
                                                            >
                                                                {x.label}
                                                            </Checkbox>
                                                        </List.Item>
                                                    )
                                                }}
                                            />
                                        }
                                    >
                                        <Button size='small' shape='circle' icon={<MenuOutlined />} style={{ margin: '0 10px', border: 'none' }}></Button>
                                    </Popover>
                                ) : null
                            }
                            {
                                showSearch ? (
                                    <Input.Search placeholder={searchPlaceHolder || ''} onSearch={onQuickSearchChange} style={{ width: 240 }} size='small'></Input.Search>
                                ) : null
                            }
                        </div>

                    </div>
                )
                    : null
            }
            <div className="templateTable">
                <AntdTable<T>
                    rowKey="id"
                    dataSource={!columnsWithVisibility ? emptyArray : frontendSearchFilteredData}
                    columns={finalColumns}
                    rowSelection={rowSelection as any}
                    pagination={pagination}
                    loading={quietlyLoading ? false : shouldShowLoading}
                    scroll={
                        columnsWithVisibility && isFixedWidth
                            ? {
                                x: columnsWithVisibility.reduce((t, c) => t + Number(c.width), -100),
                                ...tableProps.scroll
                            }
                            : tableProps.scroll
                    }
                />
            </div>
        </>
    )
}

export const SchemaTable = React.memo(SchemaTable_)
const indentity = (x: any) => x
const emptyArray = [] as any[]
const renderTotal = (total: number) => <span style={{ color: '#999', position: 'absolute', top: '0', left: '0' }}>共计{total}行记录</span>