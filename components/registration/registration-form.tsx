'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Phone, MapPin, GraduationCap, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IntegratedFaceCapture from '../face-capture/IntegratedFaceCapture';
import { createClient } from '@/lib/supabase/client';

interface RegistrationFormProps {
  userType: 'student' | 'faculty';
  initialData?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export default function RegistrationForm({ userType, initialData }: RegistrationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: '',
    address: '',
    department: '',
    year: '',
    // Student specific fields
    date_of_birth: '',
    parent_name: '',
    parent_phone: '',
    // Faculty specific fields
    designation: '',
    qualification: '',
    experience_years: '',
  });
  const [faceData, setFaceData] = useState<{
    imageData: string;
    faceData: any;
  } | null>(null);

  const departments = [
    { value: 'CSE', label: 'Computer Science Engineering' },
    { value: 'Cyber', label: 'Cyber Security' },
    { value: 'AIDS', label: 'Artificial Intelligence & Data Science' },
    { value: 'AIML', label: 'Artificial Intelligence & Machine Learning' },
  ];

  const years = [
    { value: '1st', label: 'First Year' },
    { value: '2nd', label: 'Second Year' },
    { value: '3rd', label: 'Third Year' },
    { value: '4th', label: 'Fourth Year' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFaceCapture = (imageData: string, faceData: any) => {
    console.log('Face captured:', { imageData: imageData.substring(0, 50) + '...', faceData });
    setFaceData({ imageData, faceData });
  };

  const validateStep1 = () => {
    const required = ['name', 'email', 'phone', 'department'];
    if (userType === 'student') {
      required.push('year');
    }
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill in all required fields. Missing: ${field}`);
        return false;
      }
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    console.log('Starting registration submission...');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      console.log('User authenticated:', user.email);

      // Simple test data without face image first
      const testData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        year: userType === 'student' ? formData.year : undefined,
        user_type: userType,
        face_url: null, // Skip face image for now
        face_data: {},
        additional_data: {},
        status: 'pending_approval'
      };

      console.log('Test data prepared:', testData);

      // Test database insert
      const { data, error: insertError } = await supabase
        .from('pending_registrations')
        .insert(testData)
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(insertError.message);
      }
      
      console.log('Registration inserted successfully:', data);

      // Redirect to pending approval page
      router.push('/auth/pending-approval');

    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="pl-10"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
              placeholder="Enter your email"
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {userType === 'student' && (
          <div className="space-y-2">
            <Label htmlFor="year">Academic Year *</Label>
            <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {userType === 'faculty' && (
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              placeholder="e.g., Assistant Professor"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="pl-10"
            placeholder="Enter your address"
            rows={3}
          />
        </div>
      </div>

      {userType === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_name">Parent/Guardian Name</Label>
            <Input
              id="parent_name"
              value={formData.parent_name}
              onChange={(e) => handleInputChange('parent_name', e.target.value)}
              placeholder="Parent/Guardian name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_phone">Parent/Guardian Phone</Label>
            <Input
              id="parent_phone"
              type="tel"
              value={formData.parent_phone}
              onChange={(e) => handleInputChange('parent_phone', e.target.value)}
              placeholder="Parent/Guardian phone"
            />
          </div>
        </div>
      )}

      {userType === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) => handleInputChange('qualification', e.target.value)}
              placeholder="e.g., M.Tech, Ph.D"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              value={formData.experience_years}
              onChange={(e) => handleInputChange('experience_years', e.target.value)}
              placeholder="Years of experience"
              min="0"
            />
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Face Registration</h3>
        <p className="text-gray-600">
          Please capture a clear photo of your face. This will be used for attendance and security purposes.
        </p>
      </div>
      
             <IntegratedFaceCapture
         onCapture={handleFaceCapture}
         onSkip={() => setFaceData(null)}
         isCapturing={true}
       />
    </motion.div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {userType === 'student' ? 'Student' : 'Faculty'} Registration
        </CardTitle>
        <div className="flex justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </AnimatePresence>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          {step === 1 ? (
            <Button onClick={handleNext}>
              Next
              <Camera className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !faceData}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : !faceData ? (
                <>
                  Capture Face Photo First
                  <Camera className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Submit Registration
                  <GraduationCap className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
