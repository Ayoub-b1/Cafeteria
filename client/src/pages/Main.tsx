import  { useEffect, useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-cards';

import { Autoplay, EffectCards } from 'swiper/modules';
import axios from 'axios';
import MealCard from '../components/MealCard';

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
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [meals, setMeals] = useState<Meal[]>([]);
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
        const response = await axios.get(`${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PORT}/meals`);

        const data = await response.data;

        setMeals(data.MealsList ?? []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

  }, [])
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMealIndex((prevIndex) =>
        meals.length > 0 ? (prevIndex + 1) % meals.length : 0
      );
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval
  }, [meals]);
  // Add event listener for wheel scroll
  useEffect(() => {
    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  return (
    <div className="h-full w-full bg-black overflow-hidden relative">
      <Toaster />

      {/* Fixed Background */}
      <div className="fixed w-full h-full">
        <img
          src="./agoraCMC.png"
          className="absolute w-full h-full top-0 left-0 object-cover"
          alt="Background"
        />
        <div className="absolute w-full h-full top-0 left-0 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-black before:to-transparent before:pointer-events-none"></div>
      </div>

      {/* Transition Container */}
      <div
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${currentSection * 100}vh)` }}
      >
      <img src="/CMC.png" className='w-20 h-20 absolute top-4 left-1/2 -translate-x-1/2 z-50' alt="" />
        {/* Section 1 */}
        <section
          id="section-0"
          ref={(el) => (sectionRefs.current[0] = el)}
          className="z-50 relative bs-container h-screen w-full flex md:flex-row flex-col items-center justify-around text-white transition-transform duration-1000 scale-initial"
        >
          <div className="flex flex-col w-1/2 pl-0 gap-3 p-4">
            <h1 className="text-3xl font-bold pacifico-regular">
              Discover the cool place to enjoy your meals
            </h1>
            <p>
              Diverse places to explore, indulge in delicious cuisine, and
              experience unique dining atmospheres that will make every meal
              memorable.
            </p>
          </div>
          <div className="flex flex-col w-1/2">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              

              }}
              modules={[EffectCards, Autoplay]}
              className="mySwiper"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
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
          className="z-50 relative p-5 bs-container h-screen w-full flex flex-col items-center justify-around text-white transition-transform duration-1000 scale-initial"
        >
          <div className="flex flex-col w-1/2 h-1/4 items-center justify-center *: pl-0 gap-3 p-4">
            <h1 className="text-3xl font-bold pacifico-regular text-center">Découvrer les avis des autres sur nous</h1>

          </div>
          <div className="flex flex-col  flex-grow  w-full">
            <div className="flex h-full justify-center">
              {meals.length > 0 ? (
                <MealCard meal={meals[currentMealIndex]} />
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
