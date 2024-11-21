import React, { useEffect, useState } from 'react';
import { BiHomeAlt2 } from "react-icons/bi";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { Link, useLocation } from 'react-router-dom';
import { GiMeal } from "react-icons/gi";
const Navbar: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const location = useLocation();

    const routes = [
        {
            name: 'Home',
            icon: <BiHomeAlt2 />,
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

    return (
        <ul className='fixed z-50 bg-white m-2 p-5 flex items-center justify-between flex-col w-16 right-0 h-64 rounded-full top-1/2 transform -translate-y-1/2 shadow-xl'>
            {/* Sliding Background Div */}
            <div
                className="bg-[#2B9CB8] absolute left-1/2    translate-y-1/2 z-40 w-[70%] aspect-square -translate-x-1/2 rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    top: calculateTransform(),
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
