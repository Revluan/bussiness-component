import React from "react"
import { storiesOf } from '@storybook/react'
import { SchemaTable, TableColumn } from './schema-table'
import { DocsPage, DocsContainer } from '@storybook/addon-docs'
import { ColumnTypes } from './column';

type columnType = {
    id: number
    name: string
    age: number
    gender: string
}

const genderOptions = [
    { label: '男', value: 0 },
    { label: '女', value: 1 }
]

const columns: TableColumn<columnType>[] = [
    {
        key: 'id',
        label: 'Id'
    },
    {
        key: 'name',
        label: '姓名'
    },
    {
        key: 'age',
        label: '年龄'
    },
    {
        key: 'gender',
        label: '性别',
        type: ColumnTypes.enum(genderOptions)
    }
]

const data: columnType[] = [
    {
        id: 0,
        name: '小米',
        age: 18,
        gender: '男'
    },
    {
        id: 1,
        name: '小王',
        age: 20,
        gender: '男'
    },
    {
        id: 2,
        name: '小红',
        age: 17,
        gender: '女'
    },
    {
        id: 3,
        name: '小田',
        age: 17,
        gender: '男'
    },
    {
        id: 4,
        name: '小凌',
        age: 22,
        gender: '女'
    },
    {
        id: 5,
        name: '小偶',
        age: 15,
        gender: '男'
    }
]

const demo1 = () => {

    return (
        <>
            <SchemaTable
                schema={columns as any}
                dataSource={data}
            />
        </>
    )
}

storiesOf('Schema-Table Component', module)
    .addParameters({
        info: {
            text: 'This is a schema table',
            inline: true
        },
        docs: {
            container: DocsContainer,
            page: DocsPage,
        }
    })
    .add('schemal table示例', demo1)