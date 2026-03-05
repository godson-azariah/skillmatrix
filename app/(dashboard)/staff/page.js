"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [deptLoading, setDeptLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get staff user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'staff' || parsedUser.role === 'admin') {
          setStaffUser(parsedUser);
          fetchStudents();
          fetchDepartments();
        } else {
          // Redirect if not staff/admin
          router.push('/feed');
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        router.push('/login');
      }
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch real students from API
      const response = await fetch('/api/users/students', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Students loaded:', data.students.length);
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
        
        // Extract unique batch years
        const years = [...new Set(data.students.map(s => s.batchYear))].sort((a, b) => b - a);
        setBatchYears(years);
      } else {
        throw new Error(data.error || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to empty array if API fails
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      // Fetch departments from API - same as register page
      const response = await fetch('/api/depts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Department API returned error:', response.status);
        return;
      }

      const data = await response.json();
      
      // Handle different response formats
      let deptArray = [];
      
      if (Array.isArray(data)) {
        // Direct array response (what your register page expects)
        deptArray = data;
      } else if (data && data.success && Array.isArray(data.departments)) {
        // Object with success flag
        deptArray = data.departments;
      } else if (data && Array.isArray(data)) {
        // Just in case it's nested differently
        deptArray = data;
      }
      
      console.log('✅ Departments loaded:', deptArray.length);
      setDepartments(deptArray);
      
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to extracting departments from students
      if (students.length > 0) {
        const uniqueDepts = [...new Set(students.map(s => s.department))]
          .filter(dept => dept && dept.trim() !== '')
          .map(dept => ({ name: dept }));
        setDepartments(uniqueDepts);
      }
    } finally {
      setDeptLoading(false);
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
        (student.name && student.name.toLowerCase().includes(query)) ||
        (student.registerNumber && student.registerNumber.toLowerCase().includes(query))
      );
    }
    
    setFilteredStudents(result);
  }, [searchQuery, selectedDept, selectedBatch, students]);

  // Also fetch departments when students data changes (for fallback)
  useEffect(() => {
    if (students.length > 0 && departments.length === 0) {
      const uniqueDepts = [...new Set(students.map(s => s.department))]
        .filter(dept => dept && dept.trim() !== '')
        .map(dept => ({ name: dept }));
      if (uniqueDepts.length > 0) {
        setDepartments(uniqueDepts);
      }
    }
  }, [students, departments.length]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedBatch('all');
  };

  const handleViewProfile = (registerNumber) => {
    router.push(`/profile/${registerNumber}`);
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!staffUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user session...</p>
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
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  disabled={deptLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id || dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {deptLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </div>
              {!deptLoading && departments.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No departments in database. Departments will appear when students register.
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                  onClick={() => {
                    fetchStudents();
                    fetchDepartments();
                  }}
                  disabled={loading || deptLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(loading || deptLoading) ? 'Refreshing...' : 'Refresh'}
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
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-[280px]">
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {students.length === 0 ? 'No students registered yet' : 'No students found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedDept !== 'all' || selectedBatch !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Students will appear here once they register and complete their profiles'}
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div 
                key={student._id || student.registerNumber} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow duration-200 flex flex-col h-[320px]"
              >
                {/* Student Card Content - Fixed Height */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Profile Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center overflow-hidden mr-4">
                      {student.profile?.profilePic ? (
                        <img 
                          src={student.profile.profilePic} 
                          alt={student.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <span class="text-gray-600 font-bold text-xl">
                                ${student.name?.charAt(0).toUpperCase() || 'S'}
                              </span>
                            `;
                          }}
                        />
                      ) : (
                        <span className="text-gray-600 font-bold text-xl">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{student.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500 truncate">{student.registerNumber}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {student.department && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 truncate max-w-[120px]">
                            {student.department}
                          </span>
                        )}
                        {student.batchYear && (
                          <span className="text-xs text-gray-500">Batch {student.batchYear}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio - Fixed Height with Truncation */}
                  <div className="flex-1 min-h-0 mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3 h-[60px] overflow-hidden">
                      {student.profile?.bio ? truncateText(student.profile.bio, 120) : 'No bio provided'}
                    </p>
                  </div>

                  {/* Interests - Fixed Height */}
                  {student.profile?.interests && student.profile.interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Interests</p>
                      <div className="flex flex-wrap gap-1 max-h-[40px] overflow-hidden">
                        {student.profile.interests.slice(0, 3).map((interest, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {interest}
                          </span>
                        ))}
                        {student.profile.interests.length > 3 && (
                          <span className="text-xs text-gray-500">+{student.profile.interests.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* View Profile Button - Fixed at bottom */}
                <div className="p-4 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleViewProfile(student.registerNumber)}
                    className="block w-full text-center py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                  >
                    View Profile
                  </button>
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
            {students.length > 0 && (
              <button
                onClick={() => {
                  fetchStudents();
                  fetchDepartments();
                }}
                disabled={loading || deptLoading}
                className="text-gray-600 hover:text-black disabled:opacity-50"
              >
                {(loading || deptLoading) ? 'Refreshing...' : 'Refresh Data'}
              </button>
            )}
          </div>
        </div>

        {/* Staff Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-2">Staff Instructions</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Click on "View Profile" to see complete student portfolio</li>
            <li>Use filters to find specific groups of students</li>
            <li>You can view certificates and projects on student profiles</li>
            <li>Staff accounts have view-only access (no editing/deleting)</li>
            {departments.length === 0 && (
              <li className="text-amber-600">
                Note: Departments will automatically appear when students register with departments
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}