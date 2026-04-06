import { describe, it, expect } from 'vitest'
import {
  DEMO_PROFILE,
  DEMO_WEAR,
  DEMO_FAMILY,
  DEMO_CONNECTIONS,
  DEMO_RISKS,
  DEMO_LABS,
  DEMO_INSIGHTS,
  DEMO_DOCS,
  DEMO_DOCS_DESKTOP,
  DEMO_TIPS,
  DEMO_CHAT_INIT,
  DEMO_AI_RESPONSES,
} from '../data/demo'
import { RG } from '../data/referenceRanges'

describe('Demo Data', () => {
  it('should have a complete demo profile', () => {
    expect(DEMO_PROFILE).toBeDefined()
    expect(DEMO_PROFILE.name).toBe('Carlos Martínez')
    expect(DEMO_PROFILE.age).toBe(34)
    expect(DEMO_PROFILE.bl).toBe('A+')
    expect(DEMO_PROFILE.h).toBe('178')
    expect(DEMO_PROFILE.w).toBe('76')
    expect(DEMO_PROFILE.al).toBeInstanceOf(Array)
    expect(DEMO_PROFILE.al.length).toBeGreaterThan(0)
    expect(DEMO_PROFILE.meds).toBeInstanceOf(Array)
  })

  it('should have wearable data for all sensors', () => {
    expect(DEMO_WEAR).toBeDefined()
    const keys = ['steps', 'cal', 'sleep', 'o2', 'hrv', 'stand']
    keys.forEach(key => {
      expect(DEMO_WEAR[key]).toBeDefined()
      expect(DEMO_WEAR[key].v).toBeDefined()
      expect(DEMO_WEAR[key].g).toBeDefined()
      expect(DEMO_WEAR[key].l).toBeDefined()
      expect(DEMO_WEAR[key].cl).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('should have family members across 4 generations', () => {
    expect(DEMO_FAMILY.length).toBe(9)
    const generations = new Set(DEMO_FAMILY.map(m => m.gn))
    expect(generations.size).toBe(4) // 0, 1, 2, 3
  })

  it('should have valid family connections', () => {
    const memberIds = DEMO_FAMILY.map(m => m.id)
    DEMO_CONNECTIONS.forEach(([from, to]) => {
      expect(memberIds).toContain(from)
      expect(memberIds).toContain(to)
    })
  })

  it('should have hereditary risks with valid structure', () => {
    expect(DEMO_RISKS.length).toBeGreaterThan(0)
    DEMO_RISKS.forEach(risk => {
      expect(risk.p).toBeDefined()
      expect(risk.m).toBeInstanceOf(Array)
      expect(risk.risk).toBeGreaterThanOrEqual(0)
      expect(risk.risk).toBeLessThanOrEqual(100)
      expect(risk.c).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  it('should have lab results with all biomarkers', () => {
    expect(DEMO_LABS.length).toBe(5)
    const biomarkers = ['ir', 'vc', 'rb', 'ch', 'gl', 'hg', 'wt']
    DEMO_LABS.forEach(lab => {
      biomarkers.forEach(bm => {
        expect(lab[bm]).toBeDefined()
        expect(typeof lab[bm]).toBe('number')
      })
    })
  })

  it('should have insights with urgency levels', () => {
    expect(DEMO_INSIGHTS.length).toBeGreaterThan(0)
    const validUrgencies = ['high', 'med', 'low']
    DEMO_INSIGHTS.forEach(ins => {
      expect(validUrgencies).toContain(ins.ur)
      expect(ins.ti).toBeDefined()
      expect(ins.ds).toBeDefined()
    })
  })

  it('should have documents in both mobile and desktop formats', () => {
    expect(DEMO_DOCS.length).toBe(7)
    expect(DEMO_DOCS_DESKTOP.length).toBe(7)
    // Desktop format should have extra fields
    DEMO_DOCS_DESKTOP.forEach(doc => {
      expect(doc.type).toBeDefined()
      expect(doc.size).toBeDefined()
    })
  })

  it('should have tips with icon keys', () => {
    expect(DEMO_TIPS.length).toBe(5)
    const validIcons = ['Leaf', 'Run', 'Eye', 'Pill']
    DEMO_TIPS.forEach(tip => {
      expect(validIcons).toContain(tip.icKey)
      expect(tip.cat).toBeDefined()
      expect(tip.title).toBeDefined()
    })
  })

  it('should have chat init messages', () => {
    expect(DEMO_CHAT_INIT.length).toBe(2)
    expect(DEMO_CHAT_INIT[0].r).toBe('ai')
    expect(DEMO_CHAT_INIT[1].r).toBe('sug')
    expect(DEMO_CHAT_INIT[1].opts.length).toBeGreaterThan(0)
  })

  it('should have AI responses for all chat suggestions', () => {
    DEMO_CHAT_INIT[1].opts.forEach(opt => {
      expect(DEMO_AI_RESPONSES[opt]).toBeDefined()
      expect(DEMO_AI_RESPONSES[opt].length).toBeGreaterThan(0)
    })
  })
})

describe('Reference Ranges', () => {
  it('should have ranges for all biomarkers', () => {
    const expected = ['ir', 'vc', 'rb', 'ch', 'gl', 'hg', 'wt']
    expected.forEach(key => {
      expect(RG[key]).toBeDefined()
      expect(RG[key].n).toBeDefined() // min normal
      expect(RG[key].x).toBeDefined() // max normal
      expect(RG[key].u).toBeDefined() // unit
      expect(RG[key].l).toBeDefined() // label
      expect(RG[key].n).toBeLessThanOrEqual(RG[key].x)
    })
  })
})
