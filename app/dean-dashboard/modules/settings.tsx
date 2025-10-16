"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, Bell, Mail, Shield, Database, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsModule({ dean }: { dean: any }) {
  const { toast } = useToast()
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    resultAlerts: true,
    studentUpdates: false,
    facultyReports: true,
    weeklyDigest: true,
    twoFactorAuth: false,
    sessionTimeout: true
  })

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your dashboard preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-gray-600">Browser push notifications</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="event-reminders">Event Reminders</Label>
                <p className="text-sm text-gray-600">Get notified about upcoming events</p>
              </div>
              <Switch
                id="event-reminders"
                checked={settings.eventReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, eventReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="result-alerts">Result Alerts</Label>
                <p className="text-sm text-gray-600">Notifications for result uploads</p>
              </div>
              <Switch
                id="result-alerts"
                checked={settings.resultAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, resultAlerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="student-updates">Student Updates</Label>
                <p className="text-sm text-gray-600">Daily student activity summary</p>
              </div>
              <Switch
                id="student-updates"
                checked={settings.studentUpdates}
                onCheckedChange={(checked) => setSettings({ ...settings, studentUpdates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="faculty-reports">Faculty Reports</Label>
                <p className="text-sm text-gray-600">Weekly faculty performance reports</p>
              </div>
              <Switch
                id="faculty-reports"
                checked={settings.facultyReports}
                onCheckedChange={(checked) => setSettings({ ...settings, facultyReports: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-gray-600">Summary of weekly activities</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Add extra security to your account</p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                <p className="text-sm text-gray-600">Logout after 30 minutes of inactivity</p>
              </div>
              <Switch
                id="session-timeout"
                checked={settings.sessionTimeout}
                onCheckedChange={(checked) => setSettings({ ...settings, sessionTimeout: checked })}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Active Sessions</h4>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Current Session</p>
                      <p className="text-xs text-green-600">Windows • Chrome • Active now</p>
                    </div>
                    <span className="text-xs text-green-700 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Login History</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">Last login: Today at 10:30 AM</p>
                  <p className="text-xs text-gray-500">IP: 192.168.1.1 • Location: Mumbai, India</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-600" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Export Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Download all your dashboard data including events, results, and analytics
              </p>
              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Storage Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Documents</span>
                  <span className="font-medium">245 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Images</span>
                  <span className="font-medium">128 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Database</span>
                  <span className="font-medium">89 MB</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>Total Used</span>
                  <span>462 MB / 5 GB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2 text-orange-600" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dashboard Version</span>
                <span className="font-medium">v2.1.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">Jan 6, 2025</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Database Status</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Status</span>
                <span className="font-medium text-green-600">Operational</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
