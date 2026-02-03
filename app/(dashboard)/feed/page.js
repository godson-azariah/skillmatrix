"use client";

import { useState, useEffect } from 'react';
import PostCard from '@/components/feed/PostCard';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, we'll simulate with mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in production, fetch from API
      const mockPosts = [
        {
          _id: '1',
          type: 'certificate',
          description: 'Completed Full Stack Web Development course with distinction. Learned React, Node.js, MongoDB, and deployed multiple projects.',
          media: [{ url: '/cert1.jpg', type: 'image' }],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          owner: {
            _id: '101',
            registerNumber: '951321001',
            name: 'Alice Johnson',
            department: 'Computer Science',
            departmentColor: '#3b82f6',
            batchYear: 2023,
            profile: { profilePic: '' }
          }
        },
        {
          _id: '2',
          type: 'project',
          description: 'Built a smart attendance system using facial recognition. Reduced manual attendance time by 80% and improved accuracy.',
          media: [
            { url: '/proj1.jpg', type: 'image' },
            { url: '/proj2.jpg', type: 'image' },
            { url: '/proj3.mp4', type: 'video' }
          ],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          owner: {
            _id: '102',
            registerNumber: '951321002',
            name: 'Bob Smith',
            department: 'Electronics',
            departmentColor: '#ef4444',
            batchYear: 2024,
            profile: { profilePic: '' }
          }
        },
        {
          _id: '3',
          type: 'certificate',
          description: 'Achieved Google Cloud Fundamentals certification. Gained expertise in cloud computing, storage, and deployment.',
          media: [{ url: '/cert2.jpg', type: 'image' }],
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          owner: {
            _id: '103',
            registerNumber: '951321003',
            name: 'Carol Davis',
            department: 'Information Technology',
            departmentColor: '#10b981',
            batchYear: 2023,
            profile: { profilePic: '' }
          }
        }
      ];

      setPosts(mockPosts);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to view the feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Feed</h1>
          <p className="text-gray-600">
            Latest achievements and projects from students across campus
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your achievements or projects!
            </p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Upload Achievement
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post}
                user={post.owner}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      </div>
    </div>
  );
}