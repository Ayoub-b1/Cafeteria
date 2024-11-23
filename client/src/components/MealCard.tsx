import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
 // Swiper for feedback carousel
 import 'swiper/swiper-bundle.css';  // Main Swiper CSS
 import 'swiper/modules';
 
import { FaRegStar, FaStar } from 'react-icons/fa';
import { Autoplay } from 'swiper/modules';

interface MealCardProps {
    meal: {
        name: string;
        image: string;
        price: string;
        category: string;
        feedbacks: {
            _id: number;
            user: { name: string; email: string };
            stars: number;
            date: Date;
            feedback: string;
        }[];
    };
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
    const [isSmallScreen , setIsSmallScreen] =useState(false)
    const renderStars = (rating: number) => {
        const totalStars = 5;
        const stars = [];

        for (let i = 1; i <= totalStars; i++) {
            stars.push(
                <li key={i} className="list-none">
                    {i <= rating ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-yellow-500" />}
                </li>
            );
        }

        return stars;
    };
    useEffect(() => {
        // Check screen size on initial render
        const handleResize = () => {
          setIsSmallScreen(window.innerWidth < 768); // Example: Small screen if width < 768px
        };
    
        handleResize(); // Set the initial screen size
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize); // Cleanup event listener
        };
      }, []);
    return (
        <motion.div
            className="flex flex-col items-center w-full md:gap-10 text-white md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex bg-white p-5 rounded-lg md:flex-row flex-col text-center text-black max-h-[300px]  gap-4 md:w-[40%]">
                <img src={meal.image} alt={meal.name} className=" mx-auto w-2/4 object-cover rounded-lg shadow-lg " />
                <div className="flex flex-col">
                    <h2 className="md:text-2xl text-xl font-bold mb-2">{meal.name}</h2>
                    <p className="mb-2">type: {meal.category}</p>
                    <p className="mb-4">Prix: {meal.price} DH</p>
                </div>
            </div>

            <div className="w-full  max-h-64">
                <Swiper
                    spaceBetween={10}
                    loop
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay ]}
                    grabCursor={true}
                    slidesPerView={isSmallScreen ? 1 : 3}
                    className='w-full h-full'
                >
                    {meal.feedbacks.map((feedback) => (
                        <SwiperSlide className='md:w-1/3 w-full' key={feedback._id}>
                            <motion.div
                                className="bg-white flex flex-grow h-full flex-col gap-2 text-black p-3 rounded-lg shadow-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h4 className="font-bold text-center pacifico-regular">{feedback.user.name}</h4>
                                <h4 className="font-bold text-base px-5 mx-auto w-fit bg-slate-300 rounded-full text-center overflow-hidden">{feedback.user.email}</h4>
                                <ul className="flex items-center justify-center gap-2">
                                    {renderStars(feedback.stars ?? 0)}
                                </ul>
                                <p className='text-base text-center  px-4'>{feedback.feedback}</p>
                                <span className="text-xs text-center text-gray-400">
                                    {new Date(feedback.date).toLocaleDateString()}
                                </span>
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </motion.div>
    );
};

export default MealCard;
