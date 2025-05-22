// CounsellorApplicationForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Loader2, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CounsellorApplicationForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    education: '',
    certifications: '',
    years_experience: '',
    areas_of_expertise: '',
    cover_letter: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (e.target.name === 'resume') {
        setResumeFile(file);
      } else if (e.target.name === 'profileImage') {
        setProfileImage(file);
      }
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file, resourceType = 'auto') => {
    try {
      const fileData = await convertFileToBase64(file);
      const response = await axios.post('http://localhost:3000/api/v1/connect/upload', {
        fileData,
        resourceType,
      });
      return response.data.url;
    } catch (error) {
      console.error('File upload failed:', error.response ? error.response.data : error.message);
      throw new Error(`Failed to upload ${resourceType}.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Submitting application...');

    try {
      let resume_url = '';
      if (resumeFile) {
        toast.loading('Uploading resume...', { id: toastId });
        resume_url = await uploadFile(resumeFile, 'auto');
      }

      let profile_image_url = '';
      if (profileImage) {
        toast.loading('Uploading profile image...', { id: toastId });
        profile_image_url = await uploadFile(profileImage, 'image');
      }

      toast.loading('Saving application details...', { id: toastId });
      const submissionData = { ...formData, resume_url, profile_image_url };
      
      await axios.post('http://localhost:3000/api/v1/connect/counsellorformsubmit', submissionData);
      
      toast.success('Application submitted successfully!', { id: toastId });
      navigate('/application-received');

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'An error occurred. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const StyledFileInput = ({ id, name, label, accept, file, onChange }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center justify-center w-full">
        <label 
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-gray-400 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">{accept === 'application/pdf' ? 'PDF' : 'Image'} file</p>
          </div>
          <input id={id} name={name} type="file" className="hidden" accept={accept} onChange={onChange} />
        </label>
      </div>
      {file && (
        <div className="mt-2 text-sm text-gray-600 flex items-center">
          {accept === 'application/pdf' ? 
            <FileText className="w-4 h-4 mr-2 text-red-500" /> : 
            <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
          }
          Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 text-slate-600 hover:text-slate-900"
        onClick={() => navigate('/')}
        size="sm"
        disabled={loading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Button>
      
      <Card className="w-full max-w-2xl shadow-xl animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Become a MindfulPath Counsellor</CardTitle>
          <CardDescription>Fill out the form below to join our team of professionals.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(123) 456-7890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State/Country" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input id="education" name="education" value={formData.education} onChange={handleChange} placeholder="Degree(s) and Institution(s)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Input id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} placeholder="Relevant licenses or certifications" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input id="years_experience" name="years_experience" type="number" min="0" value={formData.years_experience} onChange={handleChange} placeholder="e.g., 5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areas_of_expertise">Areas of Expertise</Label>
                <Input id="areas_of_expertise" name="areas_of_expertise" value={formData.areas_of_expertise} onChange={handleChange} placeholder="e.g., CBT, Anxiety, Depression" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_letter">Cover Letter</Label>
              <Textarea 
                id="cover_letter" 
                name="cover_letter" 
                value={formData.cover_letter} 
                onChange={handleChange} 
                placeholder="Tell us why you'd be a great fit for MindfulPath..." 
                rows={5} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <StyledFileInput 
                id="resume" 
                name="resume" 
                label="Upload Resume" 
                accept="application/pdf,.doc,.docx"
                file={resumeFile}
                onChange={handleFileChange}
              />
              <StyledFileInput 
                id="profileImage" 
                name="profileImage" 
                label="Upload Profile Image" 
                accept="image/*" 
                file={profileImage}
                onChange={handleFileChange}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-rose-500 hover:bg-rose-600 text-lg py-3"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CounsellorApplicationForm;
