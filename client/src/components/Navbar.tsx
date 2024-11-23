import React, { useEffect, useState } from 'react';
import { IoHome } from "react-icons/io5";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { Link, useLocation } from 'react-router-dom';
import { GiMeal } from "react-icons/gi";
const Navbar: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const location = useLocation();
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    
    const routes = [
        {
            name: 'Home',
            icon: <IoHome />,
            path: '/'
        },
        {
            name: 'Menu',
            icon: <MdOutlineRestaurantMenu />,
            path: '/Menu'
        },
        {
            name: 'Suivi',
            icon: <GiMeal />,
            path: '/Suivi'
        },
        // Add new routes here
    ];

    useEffect(() => {
        const currentPath = location.pathname; // Current URL path
        const activeRouteIndex = routes.findIndex(route => route.path === currentPath);
        setActiveIndex(activeRouteIndex);  // Set the active index
    }, [location, routes]);

    // Calculate the dynamic transform value based on the active index and number of routes
    const calculateTransform = () => {
        const totalRoutes = routes.length;
        const distancePerRoute = 100 / totalRoutes;  // Space each route evenly (in percentage)
        return `${activeIndex * distancePerRoute}%`;
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
        <ul className='fixed z-50 bg-white m-2  p-2 md:p-5 flex items-center justify-between w-64  md:w-16 md:translate-x-0 md:flex-col flex-row translate-x-1/2 right-1/2 md:right-0 md:h-64 rounded-full bottom-0  md:top-1/2 transform md:-translate-y-1/2 shadow-xl'>
            {/* Sliding Background Div */}
            <div
                className="bg-[#2B9CB8] absolute left-1/2 w-[20%]  md:translate-y-1/2 z-40 md:w-[70%] aspect-square translate-x-1/3 md:-translate-x-1/2 rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    ...(isSmallScreen
                        ? { left: calculateTransform() }
                        : { top: calculateTransform() }),
                    transition: 'all 0.3s ease-in-out' // Apply dynamic transform based on the number of routes
                }}
            ></div>

            {/* Menu Items */}
            {routes.map((route, index) => {
                return (
                    <li key={index} className={`flex w-[70%] max-h-[30px] aspect-square z-50 flex-col items-center justify-center ${index === activeIndex ? 'my-[10px]' : ''}`}>
                        <Link
                            to={route.path}
                            className={`text-2xl flex items-center justify-center flex-col   ${index === activeIndex ? 'text-white' : 'text-gray-500'}`}
                            onClick={() => setActiveIndex(index+1)} 
                        >
                            {route.icon}
                        {index !== activeIndex && <p className='text-xs text-slate-500'>{route.name}</p>}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

export default Navbar;
