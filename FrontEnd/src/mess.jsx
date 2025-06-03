import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Components/NavBar';
import SideBar from './Components/SideBar';
import { FaUtensils, FaHamburger, FaCoffee, FaPizzaSlice, FaStar } from 'react-icons/fa';

const Menu = () => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [menu, setMenu] = useState([]);
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      setSubmitMessage('');
      try {
        const response = await axios.get('/api/student/menu');
        const fetchedMenu = response.data.menu;
        setMenu(fetchedMenu);
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const dayIndex = fetchedMenu.findIndex((day) => day.day === dayName);
        setCurrentDayIndex(dayIndex !== -1 ? dayIndex : 0);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setSubmitMessage(`Failed to fetch menu. ${error.response?.data?.message || 'Please try again.'}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const fetchRatings = async (day) => {
    setIsLoading(true);
    setSubmitMessage('');
    if (day) {
      try {
        const response = await axios.get(`/api/student/menu/rate/${day}`);
        const fetchedRatings = response.data.ratings;
        const flatRatings = {
          [day]: {
            ...fetchedRatings.breakfast.reduce((acc, item) => ({ ...acc, [`breakfast_${item.foodItem}`]: item.rating }), {}),
            ...fetchedRatings.lunch.reduce((acc, item) => ({ ...acc, [`lunch_${item.foodItem}`]: item.rating }), {}),
            ...fetchedRatings.snacks.reduce((acc, item) => ({ ...acc, [`snacks_${item.foodItem}`]: item.rating }), {}),
            ...fetchedRatings.dinner.reduce((acc, item) => ({ ...acc, [`dinner_${item.foodItem}`]: item.rating }), {}),
          },
        };
        setRatings((prev) => ({ ...prev, ...flatRatings }));
      } catch (error) {
        console.error('Error fetching ratings:', error);
        setSubmitMessage(`Failed to fetch ratings. ${error.response?.data?.message || 'Please try again.'}`);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (menu[currentDayIndex]?.day) {
      fetchRatings(menu[currentDayIndex].day);
    }
  }, [currentDayIndex, menu]);

  const handlePrevDay = () => {
    setCurrentDayIndex((prev) => (prev > 0 ? prev - 1 : menu.length - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev < menu.length - 1 ? prev + 1 : 0));
  };

  const handleRatingChange = (mealType, foodItem, rating) => {
    const currentDay = menu[currentDayIndex]?.day;
    setRatings((prev) => ({
      ...prev,
      [currentDay]: {
        ...(prev[currentDay] || {}),
        [`${mealType}_${foodItem}`]: rating,
      },
    }));
  };

  const handleSubmitRating = () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    const currentDay = menu[currentDayIndex]?.day;
    const dayRatings = ratings[currentDay] || {};

    const nestedRatings = {
      breakfast: Object.entries(dayRatings)
        .filter(([key]) => key.startsWith('breakfast_'))
        .map(([key, rating]) => ({ foodItem: key.split('_')[1], rating })),
      lunch: Object.entries(dayRatings)
        .filter(([key]) => key.startsWith('lunch_'))
        .map(([key, rating]) => ({ foodItem: key.split('_')[1], rating })),
      snacks: Object.entries(dayRatings)
        .filter(([key]) => key.startsWith('snacks_'))
        .map(([key, rating]) => ({ foodItem: key.split('_')[1], rating })),
      dinner: Object.entries(dayRatings)
        .filter(([key]) => key.startsWith('dinner_'))
        .map(([key, rating]) => ({ foodItem: key.split('_')[1], rating })),
    };

    if (Object.values(nestedRatings).every((arr) => arr.length === 0)) {
      setIsSubmitting(false);
      setSubmitMessage('No ratings to submit');
      return;
    }

    axios
      .post('/api/student/menu/rate', {
        day: currentDay,
        ratings: nestedRatings,
      })
      .then(() => {
        setSubmitMessage('Ratings submitted successfully!');
        fetchRatings(currentDay);
      })
      .catch((error) => {
        console.error('Error submitting ratings:', error);
        setSubmitMessage(`Failed to submit ratings. ${error.response?.data?.message || 'Please try again.'}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const getIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return <FaCoffee className="text-yellow-500" />;
      case 'lunch': return <FaHamburger className="text-red-500" />;
      case 'snacks': return <FaPizzaSlice className="text-green-500" />;
      case 'dinner': return <FaUtensils className="text-purple-500" />;
      default: return null;
    }
  };

  const currentDay = menu[currentDayIndex];

  return (
    <div className="min-h-screen bg-gray-800 dark:bg-gray-900">
      <Navbar />
      <SideBar />
      <div className="pt-20 sm:pl-64 p-6">
        <div className="container mx-auto max-w-4xl">
         <div className="p-[1px] rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handlePrevDay} className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" disabled={isLoading}>
                <svg className="w-6 h-6 transform hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{currentDay?.day || 'Loading...'}</h1>
              <button onClick={handleNextDay} className="text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition-colors" disabled={isLoading}>
                <svg className="w-6 h-6 transform hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => (
                <div key={mealType}>
                  <div className="flex items-center gap-2 mb-2">
                    {getIcon(mealType)}
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 capitalize">{mealType}</h2>
                  </div>
                  <ul className="space-y-2">
                    {currentDay?.[mealType]?.map((foodItem, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="text-gray-800 dark:text-gray-200">{foodItem}</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(mealType, foodItem, star)}
                              className={`text-xl transform transition-transform hover:scale-125 ${
                                star <= (ratings[currentDay?.day]?.[`${mealType}_${foodItem}`] || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              <FaStar />
                            </button>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <hr className="my-4 border-gray-400 dark:border-gray-600" />
                </div>
              ))}
            </div>

            {submitMessage && (
              <p className={`mt-4 text-center ${submitMessage.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {submitMessage}
              </p>
            )}

            <button
              onClick={handleSubmitRating}
              disabled={isSubmitting || isLoading}
              className={`mt-6 w-full py-2 rounded-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors ${isSubmitting || isLoading ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-blue-400 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-500'}`}
            >
              {isSubmitting ? 'Submitting...' : isLoading ? 'Loading...' : 'Submit Rating'}
            </button>
           </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
