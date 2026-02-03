"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ColorPicker from '@/components/ui/ColorPicker';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Form states
  const [deptForm, setDeptForm] = useState({
    name: '',
    color: '#10b981',
  });
  const [staffForm, setStaffForm] = useState({
    name: '',
    department: '',
    username: '',
    staffId: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role === 'admin') {
        setAdminUser(parsedUser);
      } else {
        router.push('/feed');
      }
    } else {
      router.push('/login');
    }

    fetchDepartments();
    fetchStaff();
  }, [router]);

  const fetchDepartments = async () => {
    try {
      // In a real app, fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockDepts = [
        { _id: '1', name: 'Computer Science', color: '#3b82f6' },
        { _id: '2', name: 'Electronics', color: '#ef4444' },
        { _id: '3', name: 'Information Technology', color: '#10b981' },
        { _id: '4', name: 'Mechanical', color: '#f59e0b' },
        { _id: '5', name: 'Civil', color: '#8b5cf6' },
      ];
      
      setDepartments(mockDepts);
      if (mockDepts.length > 0) {
        setStaffForm(prev => ({ ...prev, department: mockDepts[0].name }));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      // Fetch REAL staff from API
      const response = await fetch('/api/users/staff');
      
      if (response.ok) {
        const data = await response.json();
        setStaffList(data.staff || []);
      } else {
        console.error('Failed to fetch staff');
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    
    if (!deptForm.name.trim()) {
      alert('Department name is required');
      return;
    }

    setLoading(true);
    try {
      // In a real app, send to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDept = {
        _id: Date.now().toString(),
        name: deptForm.name,
        color: deptForm.color,
      };
      
      setDepartments([...departments, newDept]);
      setDeptForm({ name: '', color: '#10b981' });
      
      alert('Department created successfully!');
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    
    if (staffForm.password !== staffForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (staffForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // Validate staff ID format
    if (!staffForm.staffId || staffForm.staffId.trim() === '') {
      alert('Staff ID is required');
      return;
    }

    setLoading(true);
    try {
      // Create staff via API instead of local state
      const response = await fetch('/api/users/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffForm,
          // Get admin user from localStorage
          adminUserId: adminUser._id,
          adminUserRole: adminUser.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh staff list from API
        await fetchStaff();
        
        // Reset form
        setStaffForm({
          name: '',
          department: departments[0]?.name || '',
          username: '',
          staffId: '',
          password: '',
          confirmPassword: '',
        });
        
        alert('Staff account created successfully!');
      } else {
        alert(data.error || 'Failed to create staff account');
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDept = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        // In a real app, send DELETE request
        console.log('Deleting department:', deptId);
        
        setDepartments(departments.filter(dept => dept._id !== deptId));
        alert('Department deleted successfully');
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Failed to delete department');
      }
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff account? This action cannot be undone.')) {
      try {
        // In a real app, send DELETE request
        console.log('Deleting staff:', staffId);
        
        setStaffList(staffList.filter(staff => staff._id !== staffId));
        alert('Staff account deleted successfully');
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff account');
      }
    }
  };

  if (!adminUser) {
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
              <p className="text-gray-600">
                Manage departments and staff accounts
              </p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('departments')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'departments'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Departments
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'staff'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Staff Accounts
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {/* Departments Tab */}
            {activeTab === 'departments' && (
              <div className="space-y-8">
                {/* Create Department Form */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Department</h2>
                  <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department Name *
                        </label>
                        <input
                          type="text"
                          value={deptForm.name}
                          onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Computer Science"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department Color *
                        </label>
                        <ColorPicker
                          value={deptForm.color}
                          onChange={(color) => setDeptForm({ ...deptForm, color })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={loading || !deptForm.name.trim()}
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating...' : 'Create Department'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Departments List */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">All Departments</h2>
                  {departments.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first department to get started
                      </p>
                      <p className="text-sm text-gray-500">
                        Departments will appear here after creation
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {departments.map((dept) => (
                        <div
                          key={dept._id}
                          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: dept.color }}
                              />
                              <h3 className="font-medium text-gray-900">{dept.name}</h3>
                            </div>
                            <button
                              onClick={() => handleDeleteDept(dept._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="flex items-center mr-4">
                              <span
                                className="inline-block w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: dept.color }}
                              />
                              <span>{dept.color}</span>
                            </div>
                            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              ID: {dept._id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staff Accounts Tab */}
            {activeTab === 'staff' && (
              <div className="space-y-8">
                {/* Create Staff Form */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Create Staff Account</h2>
                  <form onSubmit={handleStaffSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Staff Name *
                        </label>
                        <input
                          type="text"
                          value={staffForm.name}
                          onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Dr. Robert Chen"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <select
                          value={staffForm.department}
                          onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        >
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={staffForm.username}
                          onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., r.chen"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Staff ID *
                        </label>
                        <input
                          type="text"
                          value={staffForm.staffId}
                          onChange={(e) => setStaffForm({ ...staffForm, staffId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., STAFF001"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          value={staffForm.confirmPassword}
                          onChange={(e) => setStaffForm({ ...staffForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Creating...' : 'Create Staff Account'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Staff List */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">All Staff Accounts</h2>
                  {staffList.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                      <p className="text-gray-600">No staff accounts created yet</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Staff Info
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {staffList.map((staff) => (
                              <tr key={staff._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-medium text-gray-900">{staff.name}</div>
                                    <div className="text-sm text-gray-500">
                                      ID: {staff.staffId} • @{staff.username}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: staff.departmentColor }}
                                    />
                                    <span className="text-sm text-gray-900">{staff.department}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(staff.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => handleDeleteStaff(staff._id)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}