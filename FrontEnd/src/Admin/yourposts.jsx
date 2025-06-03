import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Components/NavBar';
import SideBar from '../Components/SideBar';
import { Link } from 'react-router-dom';

const A_YourPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filter, setFilter] = useState('');
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await axios.get('/api/student/community-posts/my'); // Adjust the endpoint as needed
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching your posts:", error);
        setPosts([]); // or show a toast/alert
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    try {
      setDeletingPostId(postId);

      // Assuming post._id is the unique identifier in MongoDB
      await axios.delete(`/api/student/community-posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you store your JWT
        },
      });

      // Filter out the deleted post
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingPostId(null);
    }
  };

  const filterPosts = () => {
    if (!filter) return posts;
    return posts.filter(post =>
      post.content.toLowerCase().includes(filter.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );
  };

  const mockUserPosts = [
    {
      _id: 2,
      content: "Movie night this Saturday in the common room! Bring snacks and good vibes.",
      hashtags: ["#Event", "#Social", "#MovieNight"],
      author: {
        name: "Current User", 
        avatarURL: ".../public/img/default-avatar.png"
      },
      timestamp: "2025-04-19T09:15:00Z",
      upvotes: 32,
      downvotes: 0,
      userVote: 'upvote',
      isAdminPost: false
    },
    {
      _id: 4,
      content: "Has anyone found a blue notebook in the library? I think I left it there yesterday.",
      hashtags: ["#Question", "#Lost"],
      author: {
        name: "Current User", // This would be the logged-in user
        avatarURL: "../public/img/default-avatar.png"
      },
      timestamp: "2025-04-17T15:20:00Z",
      upvotes: 3,
      downvotes: 0,
      userVote: null,
      isAdminPost: false
    }
  ];

  // Admin post gradient (used for borders and tags)
  const adminGradient = "from-amber-500 to-red-600";

  return (
    <div className="bg-gray-900 min-h-screen">
      <Navbar />
      <SideBar />
      
      <div className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Your Posts</h1>
            <div>
              <Link to="/dashboard/Community">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-150 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back to Community
                </button>
              </Link>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="mb-6">
            <input
              type="text"
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search your posts by content or hashtag..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {/* Posts list */}
          <div className="space-y-6">
            {loadingPosts ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-400">Loading your posts...</p>
              </div>
            ) : filterPosts().length > 0 ? (
              filterPosts().map((post, index) => (
                <div 
                  key={post._id || index} 
                  className={`${post.isAdminPost ? `p-[3px] bg-gradient-to-r ${adminGradient}` : ''} rounded-lg transition-all duration-200 hover:shadow-xl`}
                >
                  <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                    <div className="flex items-start gap-3">
                      <img 
                        src={post.author.avatarURL} 
                        alt={post.author.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-white">{post.author.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">
                              {new Date(post.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              onClick={() => handleDeletePost(post._id)}  // Use post._id for delete action
                              className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-1 rounded transition-all duration-200"
                              disabled={deletingPostId === post._id}
                            >
                              {deletingPostId === post._id ? (
                                <div className="w-5 h-5 border-t-2 border-r-2 border-red-500 rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-300 mt-2 whitespace-pre-wrap">{post.content}</p>
                        
                        {/* Display post image if available */}
                        {post.imageURL && (
                          <div className="mt-3 mb-3">
                            <img 
                              src={post.imageURL} 
                              alt="Post attachment" 
                              className="max-h-80 rounded-lg object-contain mx-auto"
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.hashtags.map((tag, i) => (
                            <span 
                              key={i} 
                              className={`text-xs px-2 py-1 rounded-full ${
                                tag.toLowerCase() === '#admin' 
                                  ? `bg-gradient-to-r ${adminGradient} text-white font-medium` 
                                  : 'bg-gray-700 text-blue-400'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Upvote and Downvote buttons */}
                        <div className="flex items-center mt-4 space-x-6">
                          {/* Upvote button */}
                          <button 
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default
                              ${
                                post.userVote === 'upvote' 
                                  ? 'bg-green-500/20 text-green-500 border border-green-500' 
                                  : 'text-gray-400 border border-transparent'
                              }
                            `}
                            disabled
                          >
                            <svg 
                              className="w-5 h-5" 
                              fill={post.userVote === 'upvote' ? "currentColor" : "none"} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            <span>{post.upvotes}</span>
                            <span className="ml-1">Upvote</span>
                          </button>
                          
                          {/* Downvote button */}
                          <button 
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default
                              ${
                                post.userVote === 'downvote' 
                                  ? 'bg-red-500/20 text-red-500 border border-red-500' 
                                  : 'text-gray-400 border border-transparent'
                              }
                            `}
                            disabled
                          >
                            <svg 
                              className="w-5 h-5" 
                              fill={post.userVote === 'downvote' ? "currentColor" : "none"} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                            <span>{post.downvotes}</span>
                            <span className="ml-1">Downvote</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">No posts found matching the filter.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default A_YourPosts;
