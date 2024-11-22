import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import html2pdf from 'html2pdf.js'; // Import html2pdf
import { FaSpinner, FaSyncAlt } from 'react-icons/fa'; // For loading spinner
import Modal from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import toast from 'react-hot-toast';
import DataTable from 'react-data-table-component';

interface Meal {
    _id: string; // Meal ID
    name: string; // Meal name
    image: string; // Meal image URL
    category: string; // Category (e.g., Déjeuner, Petit-déjeuner)
    price: number; // Price of the meal
    available: boolean; // Availability status
}

interface MealInOrder {
    meal: Meal; // The actual meal object
    quantity: number; // Quantity of the meal in the order
    _id: string; // Unique ID for this specific meal in the order
}

interface Order {
    _id: string; // Order ID
    client: string; // Client's email
    meals: MealInOrder[]; // List of meals in the order (now with nested meal objects)
    status: string; // Order status (pending, preparing, etc.)
    refusedReason: string | null; // Reason for refusal (if any)
    qrCode: string | null; // QR Code data (base64 string or null)
    createdAt: string; // Creation date of the order (ISO string)
}



const Suivi: React.FC = () => {
    const usermail = useSelector((state: RootState) => state.auth.user); // Email from Redux store
    const username = useSelector((state: RootState) => state.auth.username); // Email from Redux store

    const [Orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Store selected order
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedbacks, setFeedbacks] = useState<boolean>(false);
    const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
    const onCloseSuccessModal = () => setOrderSuccessModalOpen(false);
    const [rating, setRating] = useState<number>(5);
    const [content, setContent] = useState<string>('');

    const onCloseFeedbackOpen = () => setFeedbacks(false)


    // Fetch orders from the backend
    const fetchOrders = async () => {
        if (!usermail) return;

        try {
            const { data } = await axios.get(
                `https://cafeteria-projet.vercel.app/Order/${usermail}`
            );

          

            setOrders(data.orders);
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
        }
    };
    useEffect(() => {


        fetchOrders();
    }, [usermail]);

    const customStyles = {
        pagination: {

            style: {
                position: 'relative' as 'relative',
                backgroundColor: 'white', // White background for pagination
                color: 'black', // Black text color
                borderTop: '1px solid #ddd', // Add a border at the top
                padding: '8px 0', // Add some padding for spacing
            },
            pageButtonsStyle: {
                borderRadius: '5px', // Rounded buttons
                padding: '8px 12px', // Padding inside buttons
                margin: '0 4px', // Space between buttons
                color: '#333', // Darker text for buttons
                border: '1px solid #ccc', // Border for buttons
                transition: 'background-color 0.2s ease-in-out', // Smooth hover effect
                '&:hover:not([disabled])': {
                    backgroundColor: '#2B9CB8', // Hover effect background color
                    border: '1px solid #2B9CB8',
                    color: 'white', // Hover effect text color
                },
                '&[disabled]': {
                    color: '#999', // Disabled button text
                    cursor: 'not-allowed', // Disabled cursor
                },
            },
        },
    };

    // Render table with `react-data-table-component`
    const renderOrderTable = (orders: Order[]) => (
        <DataTable
            columns={columns}
            data={orders}
            pagination
            striped
            customStyles={customStyles}
            paginationPerPage={8}
            fixedHeader
            fixedHeaderScrollHeight="80vh"
            highlightOnHover
            defaultSortFieldId="createdAt"
            defaultSortAsc={false}

            className="bg-white w-full relative z-50 text-black"
        />
    );

    // Update columns to ensure "Créé le" has a field ID
    const columns = [
        {
            name: 'Client',
            selector: (row: Order) => row.client,
            sortable: true,
        },
        {
            name: 'Repas',
            selector: (row: Order) => row.meals[0]?.meal.name || 'N/A', // First meal's name
            sortable: true,
        },
        {
            name: 'Statut',
            cell: (row: Order) => (
                <div className={`px-4 py-2 text-white ${getStatusBgColor(row.status)}`}>
                    {row.status}
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Créé le',
            selector: (row: Order) => moment(row.createdAt).format('YYYY-MM-DD HH:mm'),
            sortable: true,
            id: 'createdAt', // Add ID for default sort
        },
        {
            name: 'QR Code',
            cell: (row: Order) =>
                row.qrCode ? (
                    <img src={row.qrCode} alt="QR Code" className="w-16 h-16" />
                ) : (
                    'Pas de QR'
                ),
        },
        {
            name: 'Détail',
            cell: (row: Order) => (
                <button
                    onClick={() => handleSelectOrder(row)}
                    className="bg-[#2B9CB8] text-white px-4 py-2 rounded-md hover:brightness-95"
                >
                    Afficher detail
                </button>
            ),
        },
    ];


    // Helper function to determine status background color







    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`https://cafeteria-projet.vercel.app/leavefeedback`, {
                orderId: selectedOrder?._id,
                client: usermail,
                mealId : selectedOrder?.meals[0].meal._id,
                feedback: content,
                rating: rating,
            });

            if (response.status === 201 || response.status === 200) {
                toast.success(response.data.message);
                setFeedbacks(true);
                setContent('');
                setRating(5);
            } else {
                console.error('Error placing order', response.data);
            }
        } catch (error) {
            console.error('Network error', error);
        }

    }

    const handleSelectOrder = (order: Order) => {
        console.log(order);
        console.log('Selected Order Meals:', selectedOrder?.meals[0].meal.name);

        setSelectedOrder(order); // Set the selected order
        setOrderSuccessModalOpen(true)
    };

    const handlePrint = () => {
        if (!selectedOrder) return;

        setIsLoading(true); // Start loading when generating the PDF
        const element = document.getElementById('print-content');

        const options = {
            margin: 0.4, // Margin for the content (in inches)
            filename: `order-${selectedOrder._id}.pdf`, // Use order ID in filename
            html2canvas: { scale: 2 }, // Ensures high-quality rendering
            jsPDF: {
                unit: 'in', // The unit of measurement (can be 'mm', 'cm', or 'in')
                format: [3.15, 10], // Custom page size for thermal printer
                orientation: 'portrait', // or 'landscape'
            },
        };

        html2pdf().from(element).set(options).save().then(() => {
            setIsLoading(false); // Stop loading once the PDF is generated
        });
    };
    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500'; // Yellow for pending
            case 'preparing':
                return 'bg-blue-500'; // Blue for preparing
            case 'completed':
                return 'bg-green-500'; // Green for completed
            case 'refused':
                return 'bg-red-500'; // Red for refused
            default:
                return 'bg-gray-500'; // Default gray for unknown status
        }
    };


    return (
        <div className="h-full w-full bg-black overflow-hidden relative">
            <div className="absolute w-full h-full">
                <img
                    src="./agoraCMC.png"
                    className="absolute w-full h-full top-0 left-0 object-cover"
                    alt=""
                />
                <div className="absolute w-full h-full top-0 left-0 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-black/40 before:to-transparent before:pointer-events-none"></div>
            </div>
            <Modal open={feedbacks} onClose={onCloseFeedbackOpen} center>
                <form onSubmit={handleSubmit} className="md:max-w-xl ">
                    <div className='w-full justify-between mx-auto p-4 flex flex-wrap  rounded-xl'>
                        <h2 className="text-2xl font-bold my-4">Laisser votre Avis</h2>

                        {/* Feedback Input */}
                        <div className="input-container w-full mb-4">
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                placeholder=''
                                className="bg-transparent h-full border-none outline-none m-0"
                            />
                            <label htmlFor="content" className="label">Avis</label>
                            <div className="underline"></div>
                        </div>

                        {/* Rating Input */}
                        <div className="flex  w-full min-h-24 items-center justify-center">
                            <div className="radio">
                                <input
                                    value="5"
                                    name="rating"
                                    type="radio"
                                    id="rating-5"
                                    checked={rating === 5} // Check if the rating is 5
                                    onChange={() => setRating(5)}
                                />
                                <label title="5 star" htmlFor="rating-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
                                    </svg>
                                </label>

                                <input
                                    value="4"
                                    name="rating"
                                    type="radio"
                                    id="rating-4"
                                    checked={rating === 4} // Check if the rating is 4
                                    onChange={() => setRating(4)}
                                />
                                <label title="4 stars" htmlFor="rating-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
                                    </svg>
                                </label>

                                <input
                                    value="3"
                                    name="rating"
                                    type="radio"
                                    id="rating-3"
                                    checked={rating === 3} // Check if the rating is 3
                                    onChange={() => setRating(3)}
                                />
                                <label title="3 stars" htmlFor="rating-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
                                    </svg>
                                </label>

                                <input
                                    value="2"
                                    name="rating"
                                    type="radio"
                                    id="rating-2"
                                    checked={rating === 2} // Check if the rating is 2
                                    onChange={() => setRating(2)}
                                />
                                <label title="2 stars" htmlFor="rating-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
                                    </svg>
                                </label>

                                <input
                                    value="1"
                                    name="rating"
                                    type="radio"
                                    id="rating-1"
                                    checked={rating === 1} // Check if the rating is 1
                                    onChange={() => setRating(1)}
                                />
                                <label title="1 star" htmlFor="rating-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                                        <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
                                    </svg>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="w-full bg-[#2B9CB8] text-white  hover:bg-dark-orange focus:ring-4 focus:ring-[#2B9CB8] font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2">
                            Envoyer
                        </button>
                    </div>

                </form>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                        <FaSpinner className="animate-spin text-white text-3xl" />
                    </div>
                )}
            </Modal>
            <Modal open={orderSuccessModalOpen} onClose={onCloseSuccessModal} center>
                <div id="print-content" >
                    <h2 className="text-2xl font-bold my-4">Détails de votre commande</h2>
                    {selectedOrder && (
                        <>
                            <div className={`my-4 p-2 ${getStatusBgColor(selectedOrder.status)} text-white`}>
                                <strong>Statut:</strong> {selectedOrder.status}
                            </div>
                            {selectedOrder.status === 'refused' && (
                                <div className="my-4">

                                    <div className="mt-4 p-4 border rounded bg-red-50 text-red-900">
                                        <strong>Raison du refus:</strong>
                                        <p>{selectedOrder.refusedReason || 'Aucune raison fournie.'}</p>
                                    </div>

                                </div>
                            )}
                            {!isLoading &&
                                (selectedOrder.status === 'completed' && (
                                    <div className="my-4">

                                        <button className='' onClick={() => { setFeedbacks(true) }}>
                                            Laisser un commentaire
                                        </button>

                                    </div>
                                ))}
                        </>
                    )}
                    <div className='bg-slate-200 p-4 text-sm rounded-md'>
                        <p><strong>Nom:</strong> {username}</p>
                        <p className='text-sm'><strong>Email:</strong> {usermail}</p>

                    </div>
                    {isLoading && <hr className='my-2' />}
                    <h3 className="font-bold my-4">{selectedOrder?.meals[0].meal.name}</h3>
                    {isLoading && <hr className='my-2' />}
                    {selectedOrder &&
                        (
                            <>
                                <p><strong>Catégorie:</strong> {selectedOrder?.meals[0].meal.category}</p>
                                <p><strong>Prix:</strong> {selectedOrder?.meals[0].meal.price} DH</p>
                                <p><strong>Quantité:</strong> {selectedOrder?.meals[0].quantity}</p>
                                <p>
                                    <strong>Total:</strong>{' '}
                                    {selectedOrder?.meals?.[0]?.meal.price && selectedOrder?.meals?.[0]?.quantity
                                        ? selectedOrder?.meals[0].meal.price * selectedOrder?.meals[0].quantity
                                        : 0} DH
                                </p>
                            </>

                        )
                    }





                    {selectedOrder?.qrCode && (
                        <div className="mt-4">
                            <img src={selectedOrder?.qrCode} alt="QR Code" className="w-32 h-32 mx-auto mb-4" />
                        </div>
                    )}

                    <h3 className="font-semibold">Créé le: {moment(selectedOrder?.createdAt).format('YYYY-MM-DD HH:mm')}</h3>
                    {/* Print button in the modal */}
                    {!isLoading && <div className="mt-4">
                        <button
                            onClick={handlePrint}
                            className="bg-[#2B9CB8] mx-auto block text-white px-6 py-2 rounded hover:brightness-95 transition duration-200"
                        >
                            Imprimer la commande
                        </button>
                    </div>}
                </div>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                        <FaSpinner className="animate-spin text-white text-3xl" />
                    </div>
                )}
            </Modal>

            <div className="z-[99] bs-container h-screen w-full flex flex-col items-center justify-center text-white">


                <div className="flex z-50 gap-5  justify-between items-center px-6 py-4 rounded-b-xl bg-white">
                    <h2 className="text-2xl font-bold text-black">Commandes d'aujourd'hui</h2>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center bg-[#2B9CB8] text-white px-4 py-2 rounded hover:brightness-95 transition duration-200"
                    >
                        <FaSyncAlt className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Rafraîchir
                    </button>
                </div>
                <div className="z-50 bs-container h-screen w-full flex md:flex-row flex-col items-center justify-evenly text-white">
                    <div className="w-full mx-auto">
                        {renderOrderTable(Orders)}
                    </div>
                </div>

            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                    <FaSpinner className="animate-spin text-white text-3xl" />
                </div>
            )}
        </div>
    );
};

export default Suivi;
