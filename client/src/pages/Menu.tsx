import React from 'react';
import { Toaster } from 'react-hot-toast';

const Menu: React.FC = () => {

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

        </div>
    );
};

export default Menu;