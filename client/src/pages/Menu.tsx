import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Modal } from 'react-responsive-modal';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa'; // To display the loading spinner

import 'react-responsive-modal/styles.css';
import html2pdf from 'html2pdf.js';

const Menu: React.FC = () => {
    const meals = useSelector((state: RootState) => state.meal.meals);
    const usermail = useSelector((state: RootState) => state.auth.user);
    const username = useSelector((state: RootState) => state.auth.username);

    const [qrcode, setQrCode] = useState<string | null>(null);
    const [filter, setFilter] = useState('Déjeuner');
    const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // State to manage loading status

    const onCloseModal = () => setOpen(false);
    const onCloseSuccessModal = () => setOrderSuccessModalOpen(false);

    const handleOrderSubmit = async () => {
        if (!selectedMeal) return;

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PORT}/Order`, {
                mealId: selectedMeal._id,
                mealName: selectedMeal.name,
                client: usermail,
                price: selectedMeal.price,
                quantity: quantity,
            });

            if (response.status === 201) {
                toast.success(response.data.message);
                setQrCode(response.data.qrCode);
                setOrderSuccessModalOpen(true);
                setOpen(false);
            } else {
                console.error('Error placing order', response.data);
            }
        } catch (error) {
            console.error('Network error', error);
        }
    };

    const handleIncreaseQuantity = () => {
        if (quantity >= 3) {
            toast.error('Le max est est de 3');
        } else {
            setQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) setQuantity(prevQuantity => prevQuantity - 1);
    };

    const filteredMeals = meals.filter((meal) => meal.category === filter);

    const handlePrint = () => {
        setIsLoading(true); // Start loading when generating the PDF
        const element = document.getElementById('print-content');

        const thermalReceiptSize = [3.15, 11]; // [width, height] in inches

        const options = {
            margin: 0.4, // Margin for the content (in inches)
            filename: 'order-details.pdf',
            html2canvas: { scale: 2 }, // Ensures high-quality rendering
            jsPDF: {
                unit: 'in', // The unit of measurement (can be 'mm', 'cm', or 'in')
                format: thermalReceiptSize, // Custom page size for thermal printer
                orientation: 'portrait', // or 'landscape'
            },
        };

        html2pdf().from(element).set(options).save().then(() => {
            setIsLoading(false); // Stop loading once the PDF is generated
        });
    };

    return (
        <div className="h-full w-full bg-black">
            {/* Order Details Modal */}
            <Modal open={open} onClose={onCloseModal} center>
                {selectedMeal && (
                    <div className="text-center mx-5 rounded-lg ">
                        <h2 className="text-2xl font-bold mb-4">{selectedMeal.name}</h2>
                        <div className="flex items-start w-full justify-start gap-10">
                            <img
                                src={selectedMeal.image}
                                alt={selectedMeal.name}
                                className="w-48 h-48 object-cover  mb-4"
                            />
                            <div className="flex flex-col h-full  items-start">
                                <p className="mb-2 font-bold text-lg">Catégorie: <span className="font-normal">{selectedMeal.category}</span></p>
                                <p className="mb-2 font-bold text-lg">Prix : <span className="font-normal">{selectedMeal.price} DH</span></p>
                                <div className="mb-2 font-bold flex items-center gap-4  text-lg">Quantité :
                                    <div className="flex justify-center rounded  border-2 items-center">
                                        <button
                                            className="bg-[#2B9CB8] text-white px-4 py-2 rounded-l hover:brightness-95 transition duration-200"
                                            onClick={handleDecreaseQuantity}
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="mx-4 text-xl">{quantity}</span>
                                        <button
                                            className="bg-[#2B9CB8] text-white px-4 py-2 rounded-r hover:brightness-95 transition duration-200"
                                            onClick={handleIncreaseQuantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-2 font-bold text-xl mt-10">Total : <span className="font-normal ml-auto">{selectedMeal.price * quantity} DH</span></p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                className="mt-4 bg-[#2B9CB8] text-white px-6 py-2 rounded hover:brightness-95 transition duration-200"
                                onClick={handleOrderSubmit}
                                disabled={!selectedMeal.available}
                            >
                                Commander
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Order Success Modal */}
            <Modal open={orderSuccessModalOpen} onClose={onCloseSuccessModal} center>
                <div id="print-content" className="text-center">
                    <h2 className="text-2xl font-bold my-4">Détails de votre commande</h2>
                    {isLoading ? (
                        <div className='bg-slate-200 p-4 text-sm rounded-md'>
                            <p><strong>Nom:</strong> {username}</p>
                            <p className='text-sm'><strong>Email:</strong> {usermail}</p>

                        </div>
                    ) :
                        <img
                            src={selectedMeal?.image}
                            alt={selectedMeal?.name}
                            className="w-48 h-48 object-cover mb-4 mx-auto"
                        />
                    }
                    {isLoading && <hr className='my-6'/>}
                    <h3 className="font-bold">{selectedMeal?.name}</h3>
                    {isLoading && <hr className='my-6'/>}
                    <p><strong>Catégorie:</strong> {selectedMeal?.category}</p>
                    <p><strong>Prix:</strong> {selectedMeal?.price} DH</p>
                    <p><strong>Quantité:</strong> {quantity}</p>
                    <p><strong>Total:</strong> {selectedMeal?.price * quantity} DH</p>

                    <div className="mt-4">
                        {qrcode && (
                            <img src={qrcode} alt="QR Code" className="w-32 h-32 mx-auto mb-4" />
                        )}
                        {/* Conditionally show the print button based on the loading state */}
                        {!isLoading && (
                            <button
                                onClick={handlePrint}
                                className="bg-[#2B9CB8] text-white px-6 py-2 rounded hover:brightness-95 transition duration-200"
                            >
                                Imprimer
                            </button>
                        )}
                        {isLoading && (
                            <p>date : {new Date().toLocaleTimeString()}</p>
                        )}
                    </div>
                </div>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                        <FaSpinner className="animate-spin text-white text-3xl" />
                    </div>
                )}
            </Modal>


            {/* Background Image */}
            <div className="absolute w-full h-full">
                <img
                    src="./agoraCMC.png"
                    className="absolute w-full h-full top-0 left-0 object-cover"
                    alt=""
                />
                <div className="absolute w-full h-full top-0 left-0 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-black/40 before:to-transparent before:pointer-events-none"></div>
            </div>

            <div className="z-50 flex-wrap h-full w-full flex md:flex-row flex-col items-start py-10 justify-evenly text-white">
                {/* Filter Divs */}
                <div onClick={() => { setFilter('Petit-déjeuner') }} className="mb-5 w-1/2 z-50 p-6 rounded-lg flex cursor-pointer hover:scale-105 flex-col items-center justify-center gap-4 text-center">
                    <img src="/svg/breakfast.svg" className="w-28 drop-shadow-xl h-28 object-cover" alt="" />
                    <h2 className="text-xl pacifico-regular">Petit-déjeuner</h2>
                </div>
                <div onClick={() => { setFilter("Déjeuner") }} className="mb-5 w-1/2 z-50 p-6 rounded-lg flex cursor-pointer hover:scale-105 flex-col items-center justify-center gap-4 text-center">
                    <img src="/svg/lunch.svg" className="w-28 h-28 object-cover" alt="" />
                    <h2 className="text-xl pacifico-regular">Déjeuner</h2>
                </div>

                {/* Meal Cards */}
                <div className="w-full flex-grow flex flex-wrap justify-center gap-5 overflow-y-auto p-5">
                    {filteredMeals?.map((meal) => (
                        <div
                            key={meal.id}
                            className="bg-white max-w-28 flex-grow p-4 text-slate-700 rounded-lg shadow-lg hover:scale-105 transform transition duration-300 flex flex-col items-center"
                            style={{ minWidth: '200px', maxWidth: '250px' }}
                        >
                            <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-32 object-cover rounded mb-3"
                            />
                            <h2 className="text-lg font-bold mb-2 text-[#2B9CB8]">{meal.name}</h2>
                            <p className="text-sm mb-2">Prix: {meal.price} DH</p>
                            <p className="text-sm mb-2">Catégorie: {meal.category}</p>
                            <p
                                className={`text-sm font-medium ${meal.available ? 'text-green-500' : 'text-red-500'}`}
                            >
                                {meal.available ? 'Disponible' : 'Indisponible'}
                            </p>
                            <button
                                disabled={meal.available ? false : true}
                                className={`mt-3 bg-[#2B9CB8] text-white px-4 py-2 rounded hover:brightness-95 transition duration-200 ${!meal.available ? 'bg-slate-500 cursor-not-allowed' : ''}`}
                                onClick={() => { setSelectedMeal(meal); setOpen(true); setQuantity(1) }}
                            >
                                Commander
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Menu;
