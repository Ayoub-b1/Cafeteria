import { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper-bundle.css';  // Main Swiper CSS
import 'swiper/modules';  // Import specific effect styles if needed

import { Autoplay, EffectCards } from 'swiper/modules';
import axios from 'axios';
import MealCard from '../components/MealCard';
import { useDispatch } from 'react-redux';
import { setMeals } from '../features/mealSlice';

interface Meal {
  _id: string;
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
}
function Main() {
  const dispatch = useDispatch();
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [mealsWithFeedbacks, setMealsWithFeedbacks] = useState<Meal[]>([]);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);



  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const images = [
    '/images/img1.jpg',
    '/images/img2.jpg',
    '/images/img3.jpg',
    '/images/img4.jpg',
    '/images/img5.jpg',
    '/images/img6.jpg',
  ];

  const handleScroll = (e: WheelEvent) => {
    e.preventDefault(); // Prevent default scrolling behavior

    if (e.deltaY > 0) {
      // Scroll down
      setCurrentSection((prev) => (prev < 1 ? prev + 1 : prev));
    } else {
      // Scroll up
      setCurrentSection((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  // Add Intersection Observer to animate sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scale-up');
          } else {
            entry.target.classList.remove('scale-up');
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://cafeteria-projet.vercel.app/meals`);

        const data = await response.data;

        const mealsWithFeedback = data.MealsList?.filter((meal: Meal) => meal.feedbacks && meal.feedbacks.length > 0) ?? [];
        console.log(mealsWithFeedback);
        setMealsWithFeedbacks(mealsWithFeedback);
        dispatch(setMeals(data.MealsList ?? []));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

  }, [dispatch])
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMealIndex((prevIndex) =>
        mealsWithFeedbacks.length > 0 ? (prevIndex + 1) % mealsWithFeedbacks.length : 0
      );
    }, 5000);
  
    return () => clearInterval(interval); // Cleanup interval
  }, [mealsWithFeedbacks]);
  
  // Add event listener for wheel scroll
  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  return (
    <div className="h-full w-full bg-black overflow-hidden relative">

      {/* Fixed Background */}
      <div className="fixed w-full h-full">
        <img
          src="./agoraCMC.png"
          className="absolute w-full h-full top-0 left-0 object-cover"
          alt="Background"
        />
        <div className="absolute w-full h-full top-0 left-0 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-black/40 before:to-transparent before:pointer-events-none"></div>
      </div>

      {/* Transition Container */}
      <div
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${currentSection * 100}vh)` }}
      >
        <img src="/CMC.png" className='w-20 h-20 filter drop-shadow-2xl shadow-black relative md:absolute top-4 left-1/2 -translate-x-1/2 z-50' alt="" />
        {/* Section 1 */}
        <section
          id="section-0"
          ref={(el) => (sectionRefs.current[0] = el)}
          className="z-50 relative bs-container h-screen w-full flex md:flex-row flex-col items-center justify-around text-white transition-transform duration-1000 scale-initial"
        >
          <div className="flex flex-col md:w-1/2 w-4/5 mx-auto p-0 pl-0 gap-3 md:p-4">
            <h1 className="md:text-3xl text-xl font-bold pacifico-regular">
              Discover the cool place to enjoy your meals
            </h1>
            <p>
              Diverse places to explore, indulge in delicious cuisine, and
              experience unique dining atmospheres that will make every meal
              memorable.
            </p>
          </div>
          <div className="flex flex-col md:w-1/2">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              loop
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,


              }}
              modules={[EffectCards, Autoplay]}
              className="mySwiper"
            >
              {images.map((image, index) => (
                <SwiperSlide className='rounded-none' key={index}>
                  <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt={`Slide ${index + 1}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* Section 2 */}
        <section
          id="section-1"
          ref={(el) => (sectionRefs.current[1] = el)}
          className="z-50 left-1/2 -translate-x-1/2 absolute top-[100vh] bs-container h-screen w-full flex flex-col items-center justify-around text-white transition-transform duration-1000 scale-initial"
        >
          <div className="flex flex-col md:w-1/2 h-1/4 items-start justify-end    pl-0 md:gap-3 p-4">
            <h1 className="md:text-3xl text-xl font-bold pacifico-regular text-center">Découvrer les avis des autres sur nous</h1>

          </div>
          <div className="flex flex-col  flex-grow  w-full">
            <div className="flex h-full justify-center">
              {mealsWithFeedbacks.length > 0 ? (
                <MealCard meal={mealsWithFeedbacks[currentMealIndex]} />
              ) : (
                <p className="text-white">Loading meals...</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Main;
