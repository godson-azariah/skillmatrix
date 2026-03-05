"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const regNo = params?.regNo || '';
  
  console.log('Profile page - Register number from params:', regNo);
  
  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ bio: '', interests: '' });

  useEffect(() => {
    console.log('Effect running, regNo:', regNo);
    
    // Get logged in user
    const userData = localStorage.getItem('user');
    console.log('LocalStorage user:', userData);
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setLoggedInUser(parsed);
        console.log('Logged in user set:', parsed.registerNumber);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    if (regNo && regNo !== 'undefined') {
      fetchUserProfile();
    } else {
      console.log('No valid regNo, skipping fetch');
      setLoading(false);
    }
  }, [regNo]);

  const fetchUserProfile = async () => {
    console.log('Fetching profile for:', regNo);
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${regNo}`);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        console.log('User found:', data.user);
        setUser(data.user);
        setEditData({
          bio: data.user.profile?.bio || '',
          interests: data.user.profile?.interests?.join(', ') || ''
        });
      } else {
        console.log('User not found or error:', data.error);
        setUser(null);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('Please log in first');
        return;
      }
      
      const loggedInUserData = JSON.parse(userData);
      console.log('Saving with user ID:', loggedInUserData._id);
      
      const response = await fetch(`/api/users/${regNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loggedInUserData._id,
          role: loggedInUserData.role,
          updates: {
            profile: {
              bio: editData.bio,
              interests: editData.interests.split(',').map(i => i.trim()).filter(i => i)
            }
          }
        }),
      });

      const data = await response.json();
      console.log('Save response:', data);
      
      if (response.ok && data.success) {
        setUser(data.user);
        setIsEditing(false);
        alert('Profile updated!');
      } else {
        alert('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error updating profile');
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditData({
        bio: user.profile?.bio || '',
        interests: user.profile?.interests?.join(', ') || ''
      });
    }
    setIsEditing(false);
  };

  const isOwnProfile = loggedInUser && user && (
    loggedInUser._id === user._id ||
    loggedInUser.registerNumber === user.registerNumber
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile for: {regNo}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">
            No user found with register number: <code className="bg-gray-100 px-2 py-1 rounded">{regNo}</code>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/feed')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Back to Feed
            </button>
            <button
              onClick={fetchUserProfile}
              className="w-full border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50"
            >
              Try Again
            </button>
            <div className="text-sm text-gray-500 mt-4">
              <p>Debug info:</p>
              <p>Logged in user: {loggedInUser?.registerNumber || 'None'}</p>
              <p>Target register number: {regNo}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col items-center">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full bg-gray-100 mb-4 flex items-center justify-center">
                <div className="text-4xl font-bold text-emerald-600">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              
              {/* Name and ID */}
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
                {user.name || 'Unknown'}
              </h1>
              <p className="text-gray-600 mb-4">
                {user.registerNumber || user.staffId}
              </p>
              
              {/* Department */}
              {user.department && (
                <div className="mb-6">
                  <div className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    {user.department}
                  </div>
                </div>
              )}
              
              {/* Batch Year */}
              {user.batchYear && (
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500">Batch Year</p>
                  <p className="text-lg font-semibold text-gray-900">{user.batchYear}</p>
                </div>
              )}
              
              {/* Bio */}
              <div className="w-full mb-6">
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows="3"
                    placeholder="Write about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {user.profile?.bio || 'No bio yet'}
                  </p>
                )}
              </div>
              
              {/* Interests */}
              <div className="w-full mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Interests</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.interests}
                    onChange={(e) => setEditData({ ...editData, interests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Web Development, Design, AI"
                  />
                ) : user.profile?.interests?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No interests yet</p>
                )}
              </div>
              
              {/* Edit Button */}
              {isOwnProfile && (
                <div className="w-full pt-6 border-t border-gray-100">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 ${
                      activeTab === 'certificates'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Certificates
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 ${
                      activeTab === 'projects'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Projects
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'certificates' ? (
                  <CertificateSection userId={user._id} isOwnProfile={isOwnProfile} />
                ) : (
                  <ProjectSection userId={user._id} isOwnProfile={isOwnProfile} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Certificate Section Component
// Certificate Section Component (updated)
function CertificateSection({ userId, isOwnProfile }) {
  const [certificates, setCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    issuedBy: '',
    tags: '',
    semester: '1' // 👈 default semester
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?userId=${userId}&type=certificate`);
      const data = await response.json();
      if (data.success) {
        setCertificates(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a certificate title');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!selectedFile) {
      alert('Please select a certificate image');
      return;
    }

    setUploading(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('type', 'certificate');
      uploadFormData.append('userId', userId);
      uploadFormData.append('issuedBy', formData.issuedBy || 'Self');
      uploadFormData.append('tags', formData.tags);
      uploadFormData.append('semester', formData.semester); // 👈 ADD
      uploadFormData.append('file', selectedFile);

      const response = await fetch('/api/posts/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        alert('Server returned invalid response. Check console.');
        return;
      }
      
      if (response.ok && data.success) {
        const newCertificate = {
          _id: data.post._id || Date.now().toString(),
          title: data.post.title,
          description: data.post.description,
          media: data.post.media || [],
          issuedBy: data.post.issuedBy || 'Self',
          tags: data.post.tags || [],
          semester: data.post.semester, // 👈 store semester
          createdAt: data.post.createdAt || new Date().toISOString(),
        };
        
        setCertificates([newCertificate, ...certificates]);
        setShowForm(false);
        setFormData({ title: '', description: '', issuedBy: '', tags: '', semester: '1' });
        setSelectedFile(null);
        alert('Certificate uploaded successfully!');
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok && data.success) {
        setCertificates(certificates.filter(c => c._id !== postId));
        alert('Certificate deleted successfully!');
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading certificates...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Test button removed */}

      {isOwnProfile && !showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Certificate
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3">Upload Certificate</h4>
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Certificate Title *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              required
            />
            <input
              type="text"
              value={formData.issuedBy}
              onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              placeholder="Issued by (e.g., University Name)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Tags (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            
            {/* 👇 NEW: Semester dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Image * (Max 2MB)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                required
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={uploading}
                className={`${
                  uploading ? 'bg-emerald-400' : 'bg-emerald-500 hover:bg-emerald-600'
                } text-white px-4 py-2 rounded-lg flex items-center gap-2`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : 'Upload Certificate'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', issuedBy: '', tags: '', semester: '1' });
                  setSelectedFile(null);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No certificates yet</p>
          {isOwnProfile && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Upload your first certificate
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{cert.title || 'Untitled Certificate'}</h4>
                  <p className="text-sm text-gray-600 mt-1">{cert.description || ''}</p>
                  
                  {/* 👇 Show semester */}
                  {cert.semester && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Semester:</span> {cert.semester}
                    </p>
                  )}
                  
                  {cert.media && cert.media.length > 0 && cert.media[0]?.url && (
                    <div className="mt-3">
                      <img 
                        src={cert.media[0].url} 
                        alt={cert.title || 'Certificate'}
                        className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  {cert.issuedBy && (
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Issued by:</span> {cert.issuedBy}
                    </p>
                  )}
                  
                  {cert.tags && cert.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cert.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => handleDelete(cert._id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-4"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Project Section Component
// Project Section Component (updated)
function ProjectSection({ userId, isOwnProfile }) {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    techStack: '',
    tags: '',
    semester: '1' // 👈 default
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?userId=${userId}&type=project`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a valid image type. Skipping.`);
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 2MB). Skipping.`);
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a project title');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please select at least one image for your project');
      return;
    }

    setUploading(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('type', 'project');
      uploadFormData.append('userId', userId);
      uploadFormData.append('techStack', formData.techStack);
      uploadFormData.append('tags', formData.tags);
      uploadFormData.append('semester', formData.semester); // 👈 ADD
      // For now, upload first file only
      if (selectedFiles[0]) {
        uploadFormData.append('file', selectedFiles[0]);
      }

      const response = await fetch('/api/posts/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const newProject = {
          _id: data.post._id || Date.now().toString(),
          title: data.post.title,
          description: data.post.description,
          media: data.post.media || [],
          techStack: data.post.techStack || [],
          tags: data.post.tags || [],
          semester: data.post.semester, // 👈 store semester
          createdAt: data.post.createdAt || new Date().toISOString(),
        };
        
        setProjects([newProject, ...projects]);
        setShowForm(false);
        setFormData({ title: '', description: '', techStack: '', tags: '', semester: '1' });
        setSelectedFiles([]);
        alert('Project uploaded successfully!');
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok && data.success) {
        setProjects(projects.filter(p => p._id !== postId));
        alert('Project deleted successfully!');
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      {isOwnProfile && !showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Add Project
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3">Upload Project</h4>
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Project Title *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              required
            />
            <input
              type="text"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
              placeholder="Technologies used (comma separated, e.g., React, Node.js, MongoDB)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Tags (comma separated, e.g., web-app, mobile, ai)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            
            {/* 👇 NEW: Semester dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Images * (Max 2MB each)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                multiple
              />
              
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected {selectedFiles.length} file(s):
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500 mx-2">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={uploading}
                className={`${
                  uploading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-4 py-2 rounded-lg flex items-center gap-2`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : 'Upload Project'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', techStack: '', tags: '', semester: '1' });
                  setSelectedFiles([]);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No projects yet</p>
          {isOwnProfile && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Upload your first project
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.title || 'Untitled Project'}</h4>
                  <p className="text-sm text-gray-600 mt-1">{project.description || ''}</p>
                  
                  {/* 👇 Show semester */}
                  {project.semester && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Semester:</span> {project.semester}
                    </p>
                  )}
                  
                  {project.media && project.media.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        {project.media.slice(0, 2).map((media, index) => (
                          <div key={index} className="relative">
                            {media?.url && (
                              <img 
                                src={media.url} 
                                alt={`${project.title || 'Project'} - ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            )}
                            {index === 1 && project.media.length > 2 && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <span className="text-white font-medium">
                                  +{project.media.length - 2} more
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Technologies:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.map((tech, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-4"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}