class AttendanceExpiryService {
  private static intervalId: NodeJS.Timeout | null = null
  private static readonly CHECK_INTERVAL = 60000 // Check every minute

  // Start the automatic expiry service
  static start() {
    if (this.intervalId) {
      return // Already running
    }

    console.log('Starting attendance expiry service...')
    
    // Run immediately
    this.checkAndCloseExpiredSessions()
    
    // Then run every minute
    this.intervalId = setInterval(() => {
      this.checkAndCloseExpiredSessions()
    }, this.CHECK_INTERVAL)
  }

  // Stop the automatic expiry service
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('Stopped attendance expiry service')
    }
  }

  // Check and close expired sessions
  private static async checkAndCloseExpiredSessions() {
    try {
      const response = await fetch('/api/attendance/expire-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.closedCount > 0) {
          console.log(`Attendance expiry check: ${result.message}`)
        }
      } else {
        console.error('Failed to check expired sessions:', response.statusText)
      }
    } catch (error) {
      console.error('Error checking expired sessions:', error)
    }
  }

  // Manual trigger for expired sessions cleanup
  static async triggerCleanup(): Promise<{ success: boolean; closedCount: number; message: string }> {
    try {
      const response = await fetch('/api/attendance/expire-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error triggering cleanup:', error)
      return {
        success: false,
        closedCount: 0,
        message: 'Failed to trigger cleanup'
      }
    }
  }
}

export default AttendanceExpiryService
