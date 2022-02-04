import { Button, Input, Menu } from 'antd'
import { FilterDropdownProps } from 'antd/lib/table/interface'
import * as React from 'react'
import { EnumOption } from './column'

const FILTER_ITEM_MAXIMUM = 10
const EMPTY_FILTER = [] as EnumOption[]

export function FilterDropdown(props: FilterDropdownProps & { enums: EnumOption[], filterMultiple: boolean }) {
    const [search, setSearch] = React.useState('')

    const optionMap = React.useMemo(() => {
        let optionMap: Record<string, EnumOption> = {}
        for (let option of props.enums) {
            optionMap[option.value + ''] = option
        }
        return optionMap
    }, [props.enums])

    const searchedOptions = React.useMemo(() => {
        return props.enums.map(x => ({
            searchedBy: String(x.label).toLowerCase(),
            origin: x
        }))
    }, [props.enums])

    const { filteredOptionMap, filteredEnums } = React.useMemo(() => {
        let filteredEnums: EnumOption[] = []
        let filteredOptionMap: Record<string, EnumOption> = {}
        const searchToLowerCase = search.toLowerCase()
        if (!search) {
            filteredOptionMap = optionMap
            filteredEnums = props.enums
        } else {
            for (let option of searchedOptions) {
                if (option.searchedBy.includes(searchToLowerCase)) {
                    filteredOptionMap[option.origin.value + ''] = option.origin
                    filteredEnums.push(option.origin)
                }
            }
        }
        return {
            filteredEnums,
            filteredOptionMap
        }
    }, [searchedOptions, search])

    const [selectedOptions, setSelectedOptions] = React.useState(() => {
        return props.selectedKeys ? props.selectedKeys.map(x => optionMap[x]) : EMPTY_FILTER
    })

    React.useEffect(() => {
        setSelectedOptions(props.selectedKeys ? props.selectedKeys.map(x => optionMap[x]) : EMPTY_FILTER)
    }, [props.selectedKeys])

    const selectedKeys = React.useMemo(() => {
        return selectedOptions.map(x => String(x.value))
    }, [selectedOptions])

    const onSelect = (v: { selectedKeys?: React.Key[] }) => {
        const filteredOptions = v.selectedKeys?.map(x => filteredOptionMap[x]).filter(y => !!y) || []
        setSelectedOptions(filteredOptions)
    }

    return (
        <>
            {
                props.enums.length > 10 ? (
                    <div style={{ padding: '7px 8px', borderBottom: '1px solid var(--border-color-split)' }}>
                        <Input
                            value={search}
                            size='small'
                            onChange={e => {
                                setSearch(e.currentTarget.value)
                                if (selectedOptions.length > 0) setSelectedOptions(EMPTY_FILTER)
                            }}
                        />
                    </div>
                ) : null
            }
            <Menu>
                {
                    filteredEnums.slice(0, FILTER_ITEM_MAXIMUM).map(x => {
                        return <Menu.Item key={String(x.value)}>{x.label}</Menu.Item>
                    })
                }
                {
                    filteredEnums.length > 100 && (
                        <Menu.Item key={"--hidden"} disabled>
                            已隐藏剩余的{filteredEnums.length - 100}项，请使用搜索
                        </Menu.Item>
                    )
                }
            </Menu>
            <div className='ant-table-filter-dropdown-btns'>
                <Button
                    size='small'
                    type='link'
                    className='ant-table-filter-dropdown-link clear'
                    onClick={() => {
                        props.setSelectedKeys && props.setSelectedKeys([])
                    }}
                >
                    重置
                </Button>
                <Button
                    size='small'
                    type='primary'
                    className='ant-table-filter-dropdown-link confirm'
                    onClick={() => {
                        props.setSelectedKeys && props.setSelectedKeys(selectedOptions.map(x => x.value as number | string))
                        props.confirm && props.confirm()
                    }}
                >
                    确定
                </Button>
            </div>
        </>
    )

}