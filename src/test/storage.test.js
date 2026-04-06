import { describe, it, expect } from 'vitest'
import { validateFile, formatFileSize, getEmojiForType } from '../services/storage'

describe('Storage Service', () => {
  describe('validateFile', () => {
    it('should accept valid PDF files under 25MB', () => {
      const file = { type: 'application/pdf', size: 1024 * 1024 } // 1MB
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('should accept valid JPEG files', () => {
      const file = { type: 'image/jpeg', size: 5 * 1024 * 1024 } // 5MB
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('should accept valid PNG files', () => {
      const file = { type: 'image/png', size: 2 * 1024 * 1024 } // 2MB
      const result = validateFile(file)
      expect(result.valid).toBe(true)
    })

    it('should reject files over 25MB', () => {
      const file = { type: 'application/pdf', size: 30 * 1024 * 1024 } // 30MB
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject unsupported file types', () => {
      const file = { type: 'application/zip', size: 1024 } // small zip
      const result = validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toContain('B')
    })

    it('should format kilobytes correctly', () => {
      const result = formatFileSize(1024)
      expect(result).toContain('KB')
    })

    it('should format megabytes correctly', () => {
      const result = formatFileSize(5 * 1024 * 1024)
      expect(result).toContain('MB')
    })
  })

  describe('getEmojiForType', () => {
    it('should return emoji for known document types', () => {
      expect(getEmojiForType('Analítica')).toBeDefined()
      expect(getEmojiForType('Radiografía')).toBeDefined()
      expect(getEmojiForType('Otro')).toBeDefined()
    })

    it('should return a fallback emoji for unknown types', () => {
      const result = getEmojiForType('SomeRandomType')
      expect(result).toBeDefined()
    })
  })
})
