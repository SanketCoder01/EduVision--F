'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createAttendanceSession } from '@/app/actions/attendance-actions';

interface CreateAttendanceSessionProps {
  onCloseAction: () => void;
  onSuccessAction: () => void;
}

export function CreateAttendanceSession({ onCloseAction, onSuccessAction }: CreateAttendanceSessionProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    session_name: '',
    class_id: '',
    session_date: '',
    start_time: '',
    end_time: '',
    location_latitude: '',
    location_longitude: '',
    geo_fence_radius: '100',
    require_face_recognition: true,
    require_geo_fencing: true,
    require_liveness_detection: true
  });

  const [locationEnabled, setLocationEnabled] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_latitude: position.coords.latitude.toString(),
            location_longitude: position.coords.longitude.toString()
          }));
          setLocationEnabled(true);
          setLoading(false);
          toast.success('Location captured successfully');
        },
        (error) => {
          setLoading(false);
          toast.error('Failed to get location. Please enter manually.');
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      toast.error('Geolocation not supported by this browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.session_name || !formData.class_id || !formData.session_date || 
        !formData.start_time || !formData.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Mock faculty ID - in real app, get from auth context
      const facultyId = 'mock-faculty-id';
      
      await createAttendanceSession({
        class_id: formData.class_id,
        faculty_id: facultyId,
        session_name: formData.session_name,
        session_date: formData.session_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location_latitude: formData.location_latitude ? parseFloat(formData.location_latitude) : undefined,
        location_longitude: formData.location_longitude ? parseFloat(formData.location_longitude) : undefined,
        geo_fence_radius: parseInt(formData.geo_fence_radius),
        require_face_recognition: formData.require_face_recognition,
        require_geo_fencing: formData.require_geo_fencing,
        require_liveness_detection: formData.require_liveness_detection
      });

      toast.success('Attendance session created successfully');
      onSuccessAction();
    } catch (error) {
      toast.error('Failed to create attendance session');
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create Attendance Session
          </DialogTitle>
          <DialogDescription>
            Set up a new attendance session with face recognition, geo-fencing, and liveness detection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Session Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session_name">Session Name *</Label>
                <Input
                  id="session_name"
                  value={formData.session_name}
                  onChange={(e) => handleInputChange('session_name', e.target.value)}
                  placeholder="e.g., Computer Science Lecture 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class_id">Class *</Label>
                <Select value={formData.class_id} onValueChange={(value) => handleInputChange('class_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class-1">Computer Science - Year 1</SelectItem>
                    <SelectItem value="class-2">Computer Science - Year 2</SelectItem>
                    <SelectItem value="class-3">Computer Science - Year 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session_date">Date *</Label>
                <Input
                  id="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => handleInputChange('session_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Settings</h3>
            
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {loading ? 'Getting Location...' : 'Get Current Location'}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="geo_fencing"
                  checked={formData.require_geo_fencing}
                  onCheckedChange={(checked: boolean) => handleInputChange('require_geo_fencing', checked)}
                />
                <Label htmlFor="geo_fencing">Require Geo-fencing</Label>
              </div>
            </div>

            {locationEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.location_latitude}
                    onChange={(e) => handleInputChange('location_latitude', e.target.value)}
                    placeholder="Latitude"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.location_longitude}
                    onChange={(e) => handleInputChange('location_longitude', e.target.value)}
                    placeholder="Longitude"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geo_fence_radius">Radius (meters)</Label>
                  <Input
                    id="geo_fence_radius"
                    value={formData.geo_fence_radius}
                    onChange={(e) => handleInputChange('geo_fence_radius', e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="font-medium">Face Recognition</Label>
                    <p className="text-sm text-gray-600">Verify student identity using facial recognition</p>
                  </div>
                </div>
                <Switch
                  checked={formData.require_face_recognition}
                  onCheckedChange={(checked: boolean) => handleInputChange('require_face_recognition', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <Label className="font-medium">Liveness Detection</Label>
                    <p className="text-sm text-gray-600">Detect if the person is live (not a photo/video)</p>
                  </div>
                </div>
                <Switch
                  checked={formData.require_liveness_detection}
                  onCheckedChange={(checked: boolean) => handleInputChange('require_liveness_detection', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCloseAction}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 