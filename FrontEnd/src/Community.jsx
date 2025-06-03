import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from './Components/NavBar';
import SideBar from './Components/SideBar';
import { Link } from 'react-router-dom';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setPending] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const fileInputRef = useRef(null);

  const hashtagSuggestions = [
    'Announcement', 'Event', 'Question', 'General',  
    'Hostel', 'Mess', 'Academic', 'Social',  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await axios.get('/api/student/community-posts', { withCredentials: true });
        const postsData = response.data || [];
        // Initialize with local userVote and backend counts
        const updatedPosts = postsData.map(post => ({
          ...post,
          userVote: getUserVote(post._id) || null, // Local user-specific vote
        }));
        setPosts(updatedPosts);
        console.log(updatedPosts)
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  // Helper functions to manage user votes in localStorage
  const getUserVote = (postId) => {
    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    return votes[postId] || null;
  };

  const setUserVote = (postId, voteType) => {
    const votes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    if (voteType === null) {
      delete votes[postId];
    } else {
      votes[postId] = voteType;
    }
    localStorage.setItem('userVotes', JSON.stringify(votes));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedImage) return;

    try {
      setPending(true);
      const hashtagArray = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      const isAdminPost = hashtagArray.some(tag => tag.toLowerCase() === '#announcement');

      let imageURL = null;
      if (selectedImage) {
        const fileRef = ref(storage, `communityPosts/${localStorage.getItem('email') || 'user'}/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(fileRef, selectedImage);
        imageURL = await getDownloadURL(fileRef);
      }

      const response = await axios.post('/api/student/community-posts', {
        content: newPost,
        hashtags: hashtagArray,
        imageURL,
      }, {
        withCredentials: true,
      });

      const newPostData = {
        ...response.data.post,
        author: {
          name: response.data.post.author.name,
          avatarURL: response.data.post.author.avatarURL,
        },
        timestamp: response.data.post.timestamp,
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      };

      setPosts(prevPosts => [newPostData, ...prevPosts]);
      setNewPost('');
      setHashtags('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowPostForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPending(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      const currentPost = posts.find(post => post._id === postId);
      const currentVote = getUserVote(postId);

      let newVote = null;
      if (currentVote === voteType) {
        // Unvote
        newVote = null;
      } else {
        // Vote or switch vote
        newVote = voteType;
      }

      // Update local user vote state immediately
      setUserVote(postId, newVote);

      // Send vote to backend to update counts
      const response = await axios.post(`/api/student/community-posts/${postId}/vote`, { voteType }, { withCredentials: true });
      const { upvotes, downvotes } = response.data;

      // Update posts state with new counts and local userVote
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? { ...post, upvotes, downvotes, userVote: newVote } : post
        )
      );
    } catch (error) {
      console.error("Error voting on post:", error);
      // Revert local vote if backend fails
      setUserVote(postId, currentVote);
    }
  };

  const filterPosts = () => {
    if (!filter) return posts;
    return posts.filter(post =>
      post.content.toLowerCase().includes(filter.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );
  };

  const adminGradient = "from-amber-500 to-red-600";
  const eventGradient = "from-blue-500 to-purple-600";

  const getPostGradient = (hashtags) => {
    const hasAnnouncement = hashtags.some(tag => tag.toLowerCase() === '#announcement');
    const hasEvent = hashtags.some(tag => tag.toLowerCase() === '#event');
    
    if (hasAnnouncement) return adminGradient; // Announcement takes precedence if both are present
    if (hasEvent) return eventGradient;
    return '';
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <Navbar />
      <SideBar />
      
      <div className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Community Posts</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPostForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-150 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Post
              </button>
              <Link to="/dashboard/Community/yourposts">
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-150 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Your Posts
                </button>
              </Link>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="mb-6">
            <input
              type="text"
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search posts by content or hashtag..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {/* Posts list */}
          <div className="space-y-6">
            {loadingPosts ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-400">Loading posts...</p>
              </div>
            ) : filterPosts().length > 0 ? (
              filterPosts().map((post, index) => {
                const gradientBorder = getPostGradient(post.hashtags);
                return (
                  <div 
                    key={post._id || index} 
                    className={`${gradientBorder ? `p-[3px] bg-gradient-to-r ${gradientBorder}` : ''} rounded-lg transition-all duration-200 hover:shadow-xl`}
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
                            <span className="text-xs text-gray-400">
                              {new Date(post.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
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
                            {post.hashtags.map((tag, i) => {
                              const isAnnouncement = tag.toLowerCase() === '#announcement';
                              const isEvent = tag.toLowerCase() === '#event';
                              
                              let tagClassName = 'text-xs px-2 py-1 rounded-full ';
                              
                              if (isAnnouncement) {
                                tagClassName += `bg-gradient-to-r ${adminGradient} text-white font-medium`;
                              } else if (isEvent) {
                                tagClassName += `bg-gradient-to-r ${eventGradient} text-white font-medium`;
                              } else {
                                tagClassName += 'bg-gray-700 text-blue-400';
                              }
                              
                              return (
                                <span key={i} className={tagClassName}>
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Improved vote buttons */}
                          <div className="flex items-center mt-4 space-x-6">
                            {/* Upvote button */}
                            <button 
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                post.userVote === 'upvote' 
                                  ? 'bg-green-500/20 text-green-500 border border-green-500' 
                                  : 'text-gray-400 hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/50 border border-transparent'
                              } transition-all duration-200`}
                              onClick={() => handleVote(post._id, 'upvote')}
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
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                post.userVote === 'downvote' 
                                  ? 'bg-red-500/20 text-red-500 border border-red-500' 
                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 border border-transparent'
                              } transition-all duration-200`}
                              onClick={() => handleVote(post._id, 'downvote')}
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
                );
              })
            ) : (
              <div className="text-center py-8 bg-gray-800 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <p className="mt-2 text-gray-400">No posts found. Be the first to post something!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Creation Modal/Popup */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            {/* Post creation form with gradient border */}
            <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg relative">
                <button 
                  onClick={() => setShowPostForm(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>

                <h2 className="text-xl font-bold text-white mb-4">Create a Post</h2>
                
                <form onSubmit={handleSubmitPost}>
                  <div className="mb-4">
                    <textarea
                      className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      placeholder="Share something with the community..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      autoFocus
                    ></textarea>
                  </div>
                  
                  {/* Image upload preview */}
                  {imagePreview && (
                    <div className="mb-4 relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-60 rounded-lg mx-auto object-contain bg-gray-700 p-2" 
                      />
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {/* Image upload button */}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Add Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </label>
                    
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add hashtags separated by commas (e.g., event, question)"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hashtagSuggestions.map((tag) => {
                      const isAnnouncement = tag === 'Announcement';
                      const isEvent = tag === 'Event';
                      
                      let buttonClassName = 'text-xs text-white px-2 py-1 rounded-full transition-colors ';
                      
                      if (isAnnouncement) {
                        buttonClassName += `bg-gradient-to-r ${adminGradient}`;
                      } else if (isEvent) {
                        buttonClassName += `bg-gradient-to-r ${eventGradient}`;
                      } else {
                        buttonClassName += 'bg-gray-700 hover:bg-gray-600';
                      }
                      
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={buttonClassName}
                          onClick={() => {
                            const newTag = tag.startsWith('#') ? tag : `#${tag}`;
                            const currentTags = hashtags.split(',').map(t => t.trim()).filter(t => t);
                            if (!currentTags.includes(newTag)) {
                              setHashtags(prev => prev ? `${prev}, ${newTag}` : newTag);
                            }
                          }}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-150 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;