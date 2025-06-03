import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './navbar';
import Sidebar from './sidebar';
import { Link } from 'react-router-dom';

const A_Dashboard = () => {
  const navigate = useNavigate();
  const [adminAndEventPosts, setAdminAndEventPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [meals, setMeals] = useState({});
  const [birthdays, setBirthdays] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [activeMealTab, setActiveMealTab] = useState('');

  // Verify cookie on load
  useEffect(() => {
    axios.post('/api/verify')
      .then((response) => {
        if (response.data.message === "cookie not verified") {
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [navigate]);

  // Fetch community posts with Admin or Event tags
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await axios.get('/api/community-posts');
        const posts = response.data || mockPosts;
        
        // Filter posts that have #Admin or #Event tags
        const filteredPosts = posts.filter(post => 
          post.hashtags.some(tag => 
            tag.toLowerCase() === '#admin' || 
            tag.toLowerCase() === '#event' || 
            tag.toLowerCase() === '#announcement'
          )
        );
        
        setAdminAndEventPosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        
        // Filter mock posts as fallback
        const filteredMockPosts = mockPosts.filter(post => 
          post.hashtags.some(tag => 
            tag.toLowerCase() === '#admin' || 
            tag.toLowerCase() === '#event' || 
            tag.toLowerCase() === '#announcement'
          )
        );
        
        setAdminAndEventPosts(filteredMockPosts);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  // Fetch today's meals
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoadingMeals(true);
        const response = await axios.get('/api/meals/today');
        setMeals(response.data || mockMeals);
      } catch (error) {
        console.error("Error fetching meals:", error);
        setMeals(mockMeals);
      } finally {
        setLoadingMeals(false);
      }
    };

    fetchMeals();
  }, []);

  // Fetch today's birthdays
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        setLoadingBirthdays(true);
        const response = await axios.get('/api/birthdays/today');
        setBirthdays(response.data || mockBirthdays);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
        setBirthdays(mockBirthdays);
      } finally {
        setLoadingBirthdays(false);
      }
    };

    fetchBirthdays();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Function to determine next meal based on current time
  const getNextMeal = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentTimeValue = hours * 60 + minutes;

    // Convert meal times to minutes for comparison
    const mealTimes = [
      { name: 'breakfast', start: getTimeInMinutes(meals.breakfast?.time?.start || '07:30'), end: getTimeInMinutes(meals.breakfast?.time?.end || '09:45') },
      { name: 'lunch', start: getTimeInMinutes(meals.lunch?.time?.start || '12:30'), end: getTimeInMinutes(meals.lunch?.time?.end || '14:00') },
      { name: 'snacks', start: getTimeInMinutes(meals.snacks?.time?.start || '16:30'), end: getTimeInMinutes(meals.snacks?.time?.end || '17:30') },
      { name: 'dinner', start: getTimeInMinutes(meals.dinner?.time?.start || '19:30'), end: getTimeInMinutes(meals.dinner?.time?.end || '21:00') }
    ];

    // Find the next upcoming meal
    for (const meal of mealTimes) {
      if (currentTimeValue < meal.end) {
        return meal.name;
      }
    }

    // If all meals are past, return breakfast for tomorrow
    return 'breakfast';
  };

  // Convert time string (HH:MM) to minutes since midnight
  const getTimeInMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Set active meal tab on component mount
  useEffect(() => {
    const nextMeal = getNextMeal();
    setActiveMealTab(nextMeal);
  }, [meals]);

  const handleLogout = () => {
    axios.post('/api/logout')
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log("Logout error:", error);
      });
  };

  // Mock data
  const mockPosts = [
    {
      id: 1,
      content: "IMPORTANT: Maintenance work will be carried out in Block C this weekend. Please plan accordingly.",
      hashtags: ["#Announcement", "#Admin", "#Hostel"],
      author: {
        name: "Admin User",
        avatarURL: ".../public/img/default-avatar.png"
      },
      timestamp: "2025-04-18T18:45:00Z",
      upvotes: 45,
      downvotes: 0,
      userVote: null,
      isAdminPost: true
    },
    {
      id: 2,
      content: "Movie night this Saturday in the common room! Bring snacks and good vibes.",
      hashtags: ["#Event", "#Social", "#MovieNight"],
      author: {
        name: "Events Committee",
        avatarURL: ".../public/img/default-avatar.png"
      },
      timestamp: "2025-04-19T09:15:00Z",
      upvotes: 32,
      downvotes: 0,
      userVote: 'upvote',
      isAdminPost: false
    },
    {
      id: 3,
      content: "The gym will be closed for renovations from April 25th to April 28th. We apologize for the inconvenience.",
      hashtags: ["#Announcement", "#Admin", "#Facilities"],
      author: {
        name: "Admin User",
        avatarURL: ".../public/img/default-avatar.png"
      },
      timestamp: "2025-04-18T10:20:00Z",
      upvotes: 12,
      downvotes: 3,
      userVote: null,
      isAdminPost: true
    }
  ];

  const mockMeals = {
    breakfast: {
      time: { start: "07:30", end: "09:30" },
      items: ["Masala Dosa", "Idli Sambar", "Bread & Jam", "Boiled Eggs", "Tea/Coffee"]
    },
    lunch: {
      time: { start: "12:30", end: "14:30" },
      items: ["Chapati", "Dal Tadka", "Paneer Butter Masala", "Jeera Rice", "Raita", "Salad"]
    },
    snacks: {
      time: { start: "16:30", end: "17:30" },
      items: ["Samosa", "Vada", "Tea/Coffee"]
    },
    dinner: {
      time: { start: "19:30", end: "21:30" },
      items: ["Chapati", "Mixed Vegetable Curry", "Dal Fry", "Pulao", "Ice Cream", "Salad"]
    }
  };

  const mockBirthdays = [
    {
      id: 1,
      name: "Rahul Sharma",
      avatarURL: ".../public/img/default-avatar.png",
      department: "Computer Science",
      year: 2
    },
    {
      id: 2,
      name: "Priya Patel",
      avatarURL: ".../public/img/default-avatar.png",
      department: "Electrical Engineering",
      year: 3
    },
    {
      id: 3,
      name: "Arjun Singh",
      avatarURL: "../public/img/default-avatar.png",
      department: "Mechanical Engineering",
      year: 4
    }
  ];

  // Admin post gradient
  const adminGradient = "from-amber-500 to-red-600";
  const eventGradient = "from-blue-500 to-purple-600";

  // Format time string (convert 24h to 12h format)
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  // Get the current meal period
  const nextMeal = getNextMeal();

  return (
    <div className="bg-gray-900 min-h-screen">
      <Navbar onLogout={handleLogout} />
      <Sidebar />
      
      <div className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Admin/Event Posts */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Important Announcements & Events</h2>
                  <Link to="./dashboard/Community">
                    <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-150 text-sm">
                      View All
                    </button>
                  </Link>
                </div>
                
                {loadingPosts ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-400">Loading posts...</p>
                  </div>
                ) : adminAndEventPosts.length > 0 ? (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                    {adminAndEventPosts.map((post, index) => {
                      // Determine if the post is admin or event based on hashtags
                      const isAdminPost = post.hashtags.some(tag => tag.toLowerCase() === '#admin');
                      const isEventPost = post.hashtags.some(tag => tag.toLowerCase() === '#event');
                      
                      // Set the appropriate gradient based on post type
                      const gradientClass = isAdminPost ? adminGradient : isEventPost ? eventGradient : "";
                      
                      return (
                        <div 
                          key={post.id || index} 
                          className={`${gradientClass ? `p-[2px] bg-gradient-to-r ${gradientClass}` : ''} rounded-lg transition-all duration-200 hover:shadow-lg`}
                        >
                          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
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
                                      className="max-h-60 rounded-lg object-contain mx-auto"
                                    />
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {post.hashtags.map((tag, i) => {
                                    // Apply specific styling based on tag type
                                    const tagLower = tag.toLowerCase();
                                    let tagClass = 'bg-gray-700 text-blue-400';
                                    
                                    if (tagLower === '#admin') {
                                      tagClass = `bg-gradient-to-r ${adminGradient} text-white font-medium`;
                                    } else if (tagLower === '#event') {
                                      tagClass = `bg-gradient-to-r ${eventGradient} text-white font-medium`;
                                    } else if (tagLower === '#announcement') {
                                      tagClass = `bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-medium`;
                                    }
                                    
                                    return (
                                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${tagClass}`}>
                                        {tag}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <p className="mt-2 text-gray-400">No announcements or events at this time.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Today's Menu & Birthdays */}
            <div className="lg:col-span-1">
              {/* Today's Meal - Updated Component */}
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Today's Meals</h2>
                
                {loadingMeals ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-400">Loading meals...</p>
                  </div>
                ) : (
                  <>
                    {/* Next Meal Indicator */}
                    <div className="bg-gray-700 rounded-lg p-3 mb-4">
                      <p className="text-center text-gray-300">
                        <span className="text-blue-400 font-medium">Next Meal: </span>
                        <span className="font-semibold text-white capitalize">{nextMeal}</span>
                        <span className="text-sm text-gray-400 ml-1">
                          ({formatTime(meals[nextMeal]?.time?.start || '00:00')} - {formatTime(meals[nextMeal]?.time?.end || '00:00')})
                        </span>
                      </p>
                    </div>
                    
                    {/* Meal Navigation Tabs with Horizontal Scroll */}
                    <div className="overflow-x-auto meal-tabs mb-4">
                      <div className="flex space-x-3 min-w-max pb-1">
                        {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
                          <button
                            key={mealType}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                              activeMealTab === mealType
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            onClick={() => setActiveMealTab(mealType)}
                          >
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Active Meal Content - Only show currently selected meal */}
                    <div className="h-auto">
                      {Object.keys(meals).map((mealType) => {
                        if (mealType !== activeMealTab) return null;
                        
                        const meal = meals[mealType];
                        if (!meal) return null;
                        
                        // Style the current meal
                        const isNextMeal = nextMeal === mealType;
                        const cardClass = isNextMeal 
                          ? 'border-blue-500 bg-gradient-to-b from-gray-800 to-gray-900' 
                          : 'border-gray-700 bg-gray-800';
                        
                        return (
                          <div 
                            key={mealType}
                            className={`rounded-lg p-4 border ${cardClass}`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-medium text-white capitalize">
                                {mealType}
                                {isNextMeal && (
                                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Next</span>
                                )}
                              </h3>
                              <span className="text-xs text-gray-400">
                                {formatTime(meal.time?.start || '00:00')} - {formatTime(meal.time?.end || '00:00')}
                              </span>
                            </div>
                            
                            <div className="space-y-1 mt-2">
                              {meal.items?.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                  <span className="text-gray-300">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              
              {/* Today's Birthdays */}
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Today's Birthdays</h2>
                
                {loadingBirthdays ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-400">Loading birthdays...</p>
                  </div>
                ) : birthdays.length > 0 ? (
                  <div className="space-y-3">
                    {birthdays.map((person) => (
                      <div key={person.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-750">
                        <div className="relative">
                          <img 
                            src={person.avatarURL} 
                            alt={person.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" fillRule="evenodd"></path>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{person.name}</h3>
                          <p className="text-xs text-gray-400">{person.department}, Year {person.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-gray-700 rounded-lg">
                    <svg className="mx-auto h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path>
                    </svg>
                    <p className="mt-2 text-gray-400">No birthdays today.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A_Dashboard;