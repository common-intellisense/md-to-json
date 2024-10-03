import fsp from 'node:fs/promises'
import { marked } from 'marked'
import type { Events, Json, Methods, Props, Slots } from './type'

export async function mdParseToJSON(mdUri: string): Promise<Json | void> {
  try {
    const md = await fsp.readFile(mdUri, 'utf-8')
    const tokens = marked.lexer(md)
    const events: Events = []
    const props: Props = {}
    const methods: Methods = []
    const slots: Slots = []
    const typeDetail: any = {}
    const suggestions: string[] = []
    const link = ''
    const link_zh = ''
    let name = ''
    let index = 0

    tokens.forEach((token: any) => {
      if (token.type === 'heading') {
        const { text } = token
        const match = text.match(/name:\s*([\w-]+)/)
        if (match) {
          name = match[1].replace(/-(\w)/g, (_: string, v: string) =>
            v.toUpperCase())
          name = name[0].toUpperCase() + name.slice(1)
        }
      }
      else if (token.type === 'table') {
        index++
        const data: any = []
        const header = token.header.map((item: any) => item.text)
        const rows = token.rows
        rows.forEach((row: any) => {
          const temp: any = {}
          data.push(temp)
          row.forEach((item: any, i: any) => {
            const content = item.text
            // events
            temp[header[i]] = content
          })
        })
        const _name = header[0]
        const _description = header[1]
        const _callback = header[2]
        const _value = header[3]
        if (/键名/.test(_name)) {
          // 类型
          typeDetail[`type${index}`] = data.map((item: any) => {
            let name = ''
            let description = ''
            let type = ''

            Object.keys(item).forEach((key) => {
              if (key === '键名')
                name = item[key]
              else if (key === '类型')
                type = item[key]
              else if (key === '介绍' || key === '说明' || key === '描述')
                description = item[key]
            })
            return {
              name,
              description,
              type: type
                ? (type as string)
                    .replace(/\s*\/\s*/g, ' | ')
                    .replace(/_/g, '')
                    .replace(/\\\\/g, '')
                : '',
            }
          })
        }
        else {
          data.forEach((item: any) => {
            const name = item[_name].replace(/`/g, '')
            const _des = item['说明'] ?? item['描述'] ?? item[_description]
            const _par = item['类型'] ?? item[_callback]
            const description = _des?.replaceAll('<br>', ' ') || ''
            const params
              = _par
                ?.replaceAll('<br>', ' ')
                .replace(/\s*\/\s*/g, ' | ')
                .replace(/_/g, '')
                .replace(/\\\\/g, '') || ''
            if ((name && name.startsWith('on')) || /事件名/.test(_name)) {
              events.push({
                name: /on-/.test(name) ? name.replace('on-', '') : name,
                params,
                description: '',
                description_zh: '',
              })
            }
            else if (/方法名/.test(_name)) {
              methods.push({
                name,
                params,
                description: '',
                description_zh: '',
              })
            }
            else {
              const type = params.replaceAll('<br>', ' ').replace(/`/g, '')
              const _v = item['默认值'] ?? item[_value]
              let _default
                = _v
                  ?.replaceAll('<br>', ' ')
                  .replace(/\s*\/\s*/g, ' | ')
                  .replace(/`/g, '')
                  .replace(/\\\\/g, '') || ''
              let value = ''
              if (_default.includes('|'))
                value = _default.split(' | ')
              else if (/^[—\-\s]$/.test(_default) && type === 'boolean')
                _default = 'false'
              if (name.includes('/')) {
                name.split(' / ').forEach((name: string) => {
                  props[name] = {
                    value,
                    description,
                    description_zh: '',
                    version: '',
                    required: false,
                    default: _default,
                    type,
                  }
                })
              }
              else {
                props[name] = {
                  value,
                  description,
                  description_zh: '',
                  version: '',
                  required: false,
                  default: _default,
                  type,
                }
              }
            }
          })
        }
      }
      else if (token.type === 'list') {
        const items = token.raw.split('\n')
        items.forEach((item: any) => {
          const text = item
            .replace(/\s*\*\s*/g, '')
            .replace(/\s+/g, ' ')
            .split(' ')
          const prop = text[0]
          if (prop[0] === '@') {
            const propName = prop.slice(1)
            if (propName === 'property') {
              props[text[2]] = {
                value: '',
                description: text[3],
                default: '',
                version: '',
                description_zh: '',
                required: false,
                type: text[1].slice(1, -1),
              }
            }
            else if (propName === 'event') {
              events.push({
                name: text[2],
                description: text[3],
                description_zh: '',
                params: text[1].slice(1, -1),
              })
            }
          }
        })
      }
      else if (token.type === 'code') {
        const items = token.text.split('\n')
        items.forEach((item: any) => {
          const text = item
            .replace(/\s*\*\s*/g, '')
            .replace(/\s+/g, ' ')
            .split(' ')
          const prop = text[0]
          if (prop[0] === '@') {
            const propName = prop.slice(1)
            if (propName === 'property') {
              props[text[2]] = {
                value: '',
                description: text[3],
                default: '',
                description_zh: '',
                version: '',
                required: false,
                type: text[1].slice(1, -1),
              }
            }
            else if (propName === 'event') {
              events.push({
                name: text[2],
                description: text[3],
                description_zh: '',
                params: text[1].slice(1, -1),
              })
            }
          }
        })
      }
    })

    return {
      name,
      props,
      methods,
      typeDetail,
      events,
      slots,
      suggestions,
      link,
      link_zh,
    }
  }
  catch (error) {
    console.error(error)
  }
}
