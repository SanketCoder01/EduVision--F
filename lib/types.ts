export interface Grievance {
  id: string;
  studentId: string;
  studentName: string;
  studentDepartment?: string;
  studentYear?: string;
  subject: string;
  category: 'academic' | 'administrative' | 'faculty' | 'other';
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  submittedAt: Date;
  isPrivate: boolean;
}

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  facultyId: string;
  department: string[];
  year: string[];
  attachments: { name: string; url: string }[];
  postedAt: Date;
}

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  isLost: boolean;
  location: string;
  reportedById: string;
  reporterName: string;
  reporterDepartment: string;
  reporterPhone?: string;
  reportedAt: Date;
  imageUrl?: string;
}
