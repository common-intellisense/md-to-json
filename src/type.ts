export type Methods = {
  name: string
  description: string
  params: string
  description_zh: string
}[]

export type Props = Record<string, {
  value: string
  description: string
  description_zh: string
  default: string
  type: string
  required: boolean
  version: string
  foreach?: boolean
}>

export type Events = {
  name: string
  description: string
  description_zh: string
  params: string
}[]

export type TypeDetail = Record<string, {
  name: 'actions'
  description: '选项列表'
  type: 'Actions'
}[]>

export type Slots = {
  name: string
  description: string
  description_zh: string
}[]

export interface Json {
  name: string
  props: Props
  methods: Methods
  typeDetail: TypeDetail
  events: Events
  slots: Slots
  link: string
  link_zh: string
  filename?: string
  suggestions: string[]
}
