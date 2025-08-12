// Google OAuth Integration
export const GOOGLE_CLIENT_ID = '897323707588-l5fbmfkmuet6ethp8o94cqa05mdu3hud.apps.googleusercontent.com'

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
  given_name?: string
  family_name?: string
}

// Initialize Google OAuth
export const initGoogleAuth = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              // This will be handled by the component
            }
          })
          resolve(true)
        }
      }
      document.head.appendChild(script)
    }
  })
}

// Decode JWT token from Google
export const decodeGoogleJWT = (token: string): GoogleUser | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding Google JWT:', error)
    return null
  }
}

// Validate email domain based on user type
export const validateEmailDomain = (email: string, userType: 'student' | 'faculty'): boolean => {
  if (userType === 'student') {
    return email.endsWith('@sanjivani.edu.in')
  } else if (userType === 'faculty') {
    return email.endsWith('@set') || email.endsWith('@sanjivani')
  }
  return false
}

// Google Sign-In using custom button (mobile-friendly)
export const signInWithGoogle = (userType: 'student' | 'faculty', buttonElement?: HTMLElement): Promise<GoogleUser> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          try {
            const user = decodeGoogleJWT(response.credential)
            if (user && validateEmailDomain(user.email, userType)) {
              resolve(user)
            } else {
              reject(new Error(`Please use your ${userType === 'student' ? '@sanjivani.edu.in' : '@set or @sanjivani'} email address`))
            }
          } catch (error) {
            reject(new Error('Failed to process Google authentication'))
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false
      })
      
      // If button element is provided, render Google button there
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular'
        })
      } else {
        // Fallback to One Tap for desktop
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google Sign-In not available. Please try again.'))
          }
        })
      }
    } else {
      reject(new Error('Google OAuth not initialized'))
    }
  })
}

// Render Google Sign-In button in specific element (mobile-friendly)
export const renderGoogleSignInButton = (
  element: HTMLElement, 
  userType: 'student' | 'faculty',
  onSuccess: (user: GoogleUser) => void,
  onError: (error: string) => void
) => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        try {
          const user = decodeGoogleJWT(response.credential)
          if (user && validateEmailDomain(user.email, userType)) {
            onSuccess(user)
          } else {
            onError(`Please use your ${userType === 'student' ? '@sanjivani.edu.in' : '@set or @sanjivani'} email address`)
          }
        } catch (error) {
          onError('Failed to process Google authentication')
        }
      }
    })
    
    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'continue_with',
      shape: 'rectangular'
    })
  }
}

// Type declarations for Google OAuth
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback: (notification: any) => void) => void
          renderButton: (element: HTMLElement, config: any) => void
        }
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}
