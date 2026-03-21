"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [batchYears, setBatchYears] = useState([]);
  const [staffUser, setStaffUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (staffUser) fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedBatch, selectedSemester]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'staff') {
          setStaffUser(parsedUser);
          fetchStudents();
        } else {
          router.push('/feed');
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedBatch !== 'all') params.append('batch', selectedBatch);
      if (selectedSemester !== 'all') params.append('semester', selectedSemester);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/students?${params}`, {
        credentials: 'include',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch');
      if (data.success) {
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
        setBatchYears(data.batchYears || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBatch('all');
    setSelectedSemester('all');
    fetchStudents();
  };

  const handleViewProfile = (registerNumber) => {
    router.push(`/profile/${registerNumber}`);
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Dashboard {staffUser.department && `– ${staffUser.department}`}
          </h1>
          <p className="text-gray-600">View students and achievements in your department</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Students</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Batch Years</p>
            <p className="text-2xl font-bold text-gray-900">{batchYears.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Semester Filter</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedSemester === 'all' ? 'All' : `Sem ${selectedSemester}`}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900">
              {students.reduce((acc, s) => acc + (s.posts?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search (name, regNo, interests, posts, tags...)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button onClick={handleResetFilters} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
              <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black">
                <option value="all">All Batches</option>
                {batchYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black">
                <option value="all">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button onClick={fetchStudents} disabled={loading} className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedBatch !== 'all' || selectedSemester !== 'all') && (
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedBatch !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Batch: {selectedBatch}
                <button onClick={() => setSelectedBatch('all')} className="ml-2 text-blue-600 hover:text-blue-700">×</button>
              </span>
            )}
            {selectedSemester !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Semester: {selectedSemester}
                <button onClick={() => setSelectedSemester('all')} className="ml-2 text-emerald-600 hover:text-emerald-700">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="ml-2 text-gray-600 hover:text-gray-700">×</button>
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Students Cards */}
        {!loading && filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedBatch !== 'all' || selectedSemester !== 'all'
                ? 'Try adjusting your filters'
                : 'No students registered in your department yet.'}
            </p>
            <button onClick={handleResetFilters} className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Left column: student info */}
                  <div className="md:w-1/5 p-4 bg-gray-50 border-r border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-emerald-700">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-xs text-gray-500">{student.registerNumber}</p>
                      </div>
                    </div>
                    {student.profile?.interests?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {student.profile.interests.slice(0, 3).map((int, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">{int}</span>
                          ))}
                          {student.profile.interests.length > 3 && (
                            <span className="text-xs text-gray-500">+{student.profile.interests.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Middle column: certificates */}
                  <div className="md:w-2/5 p-4 border-r border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Certificates</h4>
                    <div className="space-y-3">
                      {student.posts?.filter(p => p.type === 'certificate').map((cert) => (
                        <div key={cert._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-900 text-sm">{cert.title}</span>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Sem {cert.semester || 'N/A'}</span>
                          </div>
                          {cert.issuedBy && (
                            <p className="text-xs text-gray-600 mt-1">Issued by: {cert.issuedBy}</p>
                          )}
                          {cert.tags && cert.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {cert.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">#{tag}</span>
                              ))}
                              {cert.tags.length > 3 && <span className="text-xs text-gray-400">+{cert.tags.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!student.posts || student.posts.filter(p => p.type === 'certificate').length === 0) && (
                        <p className="text-xs text-gray-400 italic">No certificates</p>
                      )}
                    </div>
                  </div>

                  {/* Right column: projects */}
                  <div className="md:w-2/5 p-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Projects</h4>
                    <div className="space-y-3">
                      {student.posts?.filter(p => p.type === 'project').map((proj) => (
                        <div key={proj._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-900 text-sm">{proj.title}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sem {proj.semester || 'N/A'}</span>
                          </div>
                          {proj.techStack && proj.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {proj.techStack.slice(0, 3).map((tech, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">{tech}</span>
                              ))}
                              {proj.techStack.length > 3 && <span className="text-xs text-gray-400">+{proj.techStack.length - 3}</span>}
                            </div>
                          )}
                          {proj.tags && proj.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {proj.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">#{tag}</span>
                              ))}
                              {proj.tags.length > 3 && <span className="text-xs text-gray-400">+{proj.tags.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                      {(!student.posts || student.posts.filter(p => p.type === 'project').length === 0) && (
                        <p className="text-xs text-gray-400 italic">No projects</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-2 flex justify-end border-t border-gray-200">
                  <button
                    onClick={() => handleViewProfile(student.registerNumber)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    View Full Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 flex justify-between text-sm text-gray-600">
          <p>Showing {filteredStudents.length} of {students.length} students</p>
          {students.length > 0 && (
            <button onClick={fetchStudents} disabled={loading} className="hover:text-black disabled:opacity-50">
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          )}
        </div>

        {/* Staff Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-2">Staff Instructions</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>You see only students from your department: <span className="font-medium">{staffUser.department || 'your department'}</span></li>
            <li>Search works across names, register numbers, bio, interests, post titles, descriptions, and tags</li>
            <li>Filter by batch year and semester to narrow down achievements</li>
            <li>Click "View Full Profile" to see the complete student portfolio</li>
            <li>Click the email icon 📧 in the navbar to update your email address</li>
          </ul>
        </div>
      </div>
    </div>
  );
}