/**
 * Password validation utility with complexity requirements
 * Security: Enforces strong password policy
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength?: 'faible' | 'moyen' | 'fort'
}

/**
 * Validate password strength (simplified for e-commerce)
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one digit
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  const strength = getPasswordStrength(password)

  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Get password strength indicator
 * Returns: 'faible' | 'moyen' | 'fort'
 */
export function getPasswordStrength(password: string): 'faible' | 'moyen' | 'fort' {
  if (!password) return 'faible'
  
  let score = 0
  
  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  
  // Character variety
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  // Determine strength
  if (score <= 2) return 'faible'
  if (score <= 4) return 'moyen'
  return 'fort'
}

/**
 * Validate password strength (strict - for admin/initial setup)
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function validatePasswordStrengthStrict(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check if password is in common passwords list (basic check)
 * In production, consider using Have I Been Pwned API
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '123456', '123456789', '12345678', '12345',
    '1234567', '1234567890', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '12345678910'
  ]
  
  return commonPasswords.some(common => 
    password.toLowerCase().includes(common.toLowerCase())
  )
}

