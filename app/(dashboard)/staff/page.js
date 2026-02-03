"use client";

import { useState, useEffect } from 'react';
import UserTile from '@/components/ui/UserTile';

export default function StaffDashboard() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [batchYears, setBatchYears] = useState([]);
  const [staffUser, setStaffUser] = useState(null);

  useEffect(() => {
    // Get staff user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'staff' || parsedUser.role === 'admin') {
        setStaffUser(parsedUser);
      } else {
        // Redirect if not staff/admin
        window.location.href = '/feed';
      }
    } else {
      // Redirect to login if not logged in
      window.location.href = '/login';
    }
    
    fetchStudents();
    fetchDepartments();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockStudents = [
        {
          _id: '1',
          registerNumber: '951321001',
          name: 'Alice Johnson',
          role: 'student',
          department: 'Computer Science',
          batchYear: 2023,
          profile: { 
            profilePic: '',
            bio: 'Full Stack Developer passionate about creating scalable web applications.',
            interests: ['Web Development', 'Cloud Computing', 'UI/UX Design']
          },
          departmentColor: '#3b82f6',
          createdAt: '2023-09-01'
        },
        {
          _id: '2',
          registerNumber: '951321002',
          name: 'Bob Smith',
          role: 'student',
          department: 'Electronics',
          batchYear: 2024,
          profile: { 
            profilePic: '',
            bio: 'Electronics enthusiast with interest in IoT and embedded systems.',
            interests: ['IoT', 'Embedded Systems', 'Robotics']
          },
          departmentColor: '#ef4444',
          createdAt: '2023-09-01'
        },
        {
          _id: '3',
          registerNumber: '951321003',
          name: 'Carol Davis',
          role: 'student',
          department: 'Information Technology',
          batchYear: 2023,
          profile: { 
            profilePic: '',
            bio: 'IT student focused on cybersecurity and network administration.',
            interests: ['Cybersecurity', 'Networking', 'Cloud Security']
          },
          departmentColor: '#10b981',
          createdAt: '2023-09-01'
        },
        {
          _id: '4',
          registerNumber: '951321004',
          name: 'David Wilson',
          role: 'student',
          department: 'Mechanical',
          batchYear: 2024,
          profile: { 
            profilePic: '',
            bio: 'Mechanical engineering student specializing in automotive design.',
            interests: ['Automotive', 'CAD', 'Thermodynamics']
          },
          departmentColor: '#f59e0b',
          createdAt: '2023-09-01'
        },
        {
          _id: '5',
          registerNumber: '951321005',
          name: 'Eva Brown',
          role: 'student',
          department: 'Civil',
          batchYear: 2023,
          profile: { 
            profilePic: '',
            bio: 'Civil engineering student interested in sustainable infrastructure.',
            interests: ['Structural Design', 'Sustainability', 'Urban Planning']
          },
          departmentColor: '#8b5cf6',
          createdAt: '2023-09-01'
        },
        {
          _id: '6',
          registerNumber: '951321006',
          name: 'Frank Miller',
          role: 'student',
          department: 'Computer Science',
          batchYear: 2024,
          profile: { 
            profilePic: '',
            bio: 'Aspiring software engineer with focus on AI and machine learning.',
            interests: ['AI/ML', 'Data Science', 'Algorithms']
          },
          departmentColor: '#3b82f6',
          createdAt: '2023-09-01'
        },
        {
          _id: '7',
          registerNumber: '951321007',
          name: 'Grace Lee',
          role: 'student',
          department: 'Electronics',
          batchYear: 2023,
          profile: { 
            profilePic: '',
            bio: 'Electronics student working on renewable energy systems.',
            interests: ['Renewable Energy', 'Power Systems', 'Circuit Design']
          },
          departmentColor: '#ef4444',
          createdAt: '2023-09-01'
        },
        {
          _id: '8',
          registerNumber: '951321008',
          name: 'Henry Taylor',
          role: 'student',
          department: 'Information Technology',
          batchYear: 2024,
          profile: { 
            profilePic: '',
            bio: 'IT student specializing in database management and cloud services.',
            interests: ['Database', 'Cloud Computing', 'DevOps']
          },
          departmentColor: '#10b981',
          createdAt: '2023-09-01'
        }
      ];
      
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      
      // Extract unique batch years
      const years = [...new Set(mockStudents.map(s => s.batchYear))].sort((a, b) => b - a);
      setBatchYears(years);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // In a real app, fetch from API
      const mockDepts = [
        { name: 'Computer Science', color: '#3b82f6' },
        { name: 'Electronics', color: '#ef4444' },
        { name: 'Information Technology', color: '#10b981' },
        { name: 'Mechanical', color: '#f59e0b' },
        { name: 'Civil', color: '#8b5cf6' },
      ];
      
      setDepartments(mockDepts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    let result = students;
    
    // Apply department filter
    if (selectedDept !== 'all') {
      result = result.filter(student => student.department === selectedDept);
    }
    
    // Apply batch year filter
    if (selectedBatch !== 'all') {
      result = result.filter(student => student.batchYear === parseInt(selectedBatch));
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.registerNumber.toLowerCase().includes(query)
      );
    }
    
    setFilteredStudents(result);
  }, [searchQuery, selectedDept, selectedBatch, students]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedBatch('all');
  };

  if (!staffUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">
            View and filter student profiles, certificates, and projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Departments</p>
            <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Batch Years</p>
            <p className="text-2xl font-bold text-gray-900">{batchYears.length}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Showing</p>
            <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or register number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No departments in database. Admin can create them.
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Year
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Batches</option>
                {batchYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={fetchStudents}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedDept !== 'all' || selectedBatch !== 'all' || searchQuery) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedDept !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Dept: {selectedDept}
                  <button
                    onClick={() => setSelectedDept('all')}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedBatch !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Batch: {selectedBatch}
                  <button
                    onClick={() => setSelectedBatch('all')}
                    className="ml-2 text-emerald-600 hover:text-emerald-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-600 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Students Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedDept !== 'all' || selectedBatch !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No students in the system yet'}
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                <UserTile user={student} />
                <div className="p-4 pt-2 border-t border-gray-100">
                  <a
                    href={`/profile/${student.registerNumber}`}
                    className="block w-full text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} students
          </p>
          <div className="text-sm text-gray-600">
            Last updated: Just now
          </div>
        </div>

        {/* Staff Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-900 mb-2">Staff Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Click on "View Profile" to see complete student portfolio</li>
            <li>Use filters to find specific groups of students</li>
            <li>You can view certificates and projects on student profiles</li>
            <li>Staff accounts have view-only access (no editing/deleting)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}