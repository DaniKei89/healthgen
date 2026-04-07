import { describe, it, expect } from 'vitest'
import es from '../i18n/es.json'
import en from '../i18n/en.json'

describe('i18n Translations', () => {
  it('should have matching top-level keys in both languages', () => {
    const esKeys = Object.keys(es).sort()
    const enKeys = Object.keys(en).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('should have matching nested keys in both languages', () => {
    function getNestedKeys(obj, prefix = '') {
      return Object.entries(obj).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null) {
          return getNestedKeys(value, path)
        }
        return [path]
      })
    }

    const esKeys = getNestedKeys(es).sort()
    const enKeys = getNestedKeys(en).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('should not have empty string values', () => {
    function checkNoEmpty(obj, path = '') {
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key
        if (typeof value === 'string') {
          expect(value.length, `Empty string at ${fullPath}`).toBeGreaterThan(0)
        } else if (typeof value === 'object') {
          checkNoEmpty(value, fullPath)
        }
      })
    }

    checkNoEmpty(es)
    checkNoEmpty(en)
  })

  it('should have navigation labels in both languages', () => {
    expect(es.nav.home).toBeDefined()
    expect(en.nav.home).toBeDefined()
    expect(es.nav.family).toBeDefined()
    expect(en.nav.family).toBeDefined()
  })

  it('should reference Laidy brand name', () => {
    expect(es.chat.aiLabel).toContain('Laidy')
    expect(en.chat.aiLabel).toContain('Laidy')
  })
})
