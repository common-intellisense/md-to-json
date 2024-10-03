import { describe, expect, it } from 'vitest'
import { mdParseToJSON } from '../src'

describe('should', () => {
  it('exported', async () => {
    const json = await mdParseToJSON('./test/test.md')
    expect(json).toMatchInlineSnapshot(`
      {
        "events": [],
        "link": "",
        "link_zh": "",
        "methods": [],
        "name": "",
        "props": {},
        "slots": [],
        "suggestions": [],
        "typeDetail": {},
      }
    `)
  })
})
