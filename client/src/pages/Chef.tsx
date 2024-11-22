import { useEffect, useState } from 'react'
import { RootState } from '../store';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import { FaSpinner, FaSyncAlt } from 'react-icons/fa';
import Modal from 'react-responsive-modal';
import DataTable from 'react-data-table-component';
import toast from 'react-hot-toast';

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
function Chef() {
  const usermail = useSelector((state: RootState) => state.auth.user); // Email from Redux store
  const username = useSelector((state: RootState) => state.auth.username); // Email from Redux store
  const [selectedStatus, setSelectedStatus] = useState<string>(''); // To manage status dropdown
  const [refusedReason, setRefusedReason] = useState<string>('');   // To manage refusal reason

  const [Orders, setOrders] = useState<Order[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Store selected order
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
  const onCloseSuccessModal = () => setOrderSuccessModalOpen(false);

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    if (selectedStatus === 'refused' && !refusedReason.trim()) {
      toast.error('Veuillez fournir une raison pour le refus.');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.patch(
        `https://cafeteria-projet.vercel.app/orders/${selectedOrder._id}/status`,
        {
          status: selectedStatus,
          refusedReason: selectedStatus === 'refused' ? refusedReason : null,
        }
      );

      setOrders(data.orders);


      setSelectedOrder(null);
      setOrderSuccessModalOpen(false);
      setSelectedStatus('');
      setRefusedReason('');
    } catch (error) {
      console.error('Error updating status:', error);
      toa('Erreur lors de la mise à jour du statut.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!usermail) return;

    setIsLoading(true); // Show loading spinner

    try {
      const { data } = await axios.get(
        `https://cafeteria-projet.vercel.app/Orders/${usermail}`
      );
      setOrders(data.orders); // Update the state with the fetched orders
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      toast.error('Erreur lors de la récupération des commandes.');
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };
  useEffect(() => {



    fetchOrders();
  }, [usermail]);


  // Custom styles for the DataTable
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
          Changer Statut
        </button>
      ),
    },
  ];


  // Helper function to determine status background color
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'refused':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };






  const handleSelectOrder = (order: Order) => {
    console.log(order);
    console.log('Selected Order Meals:', selectedOrder?.meals[0].meal.name);

    setSelectedOrder(order); // Set the selected order
    setOrderSuccessModalOpen(true)
  };





  return (
    <div className="h-full w-full bg-black">
      <Modal open={orderSuccessModalOpen} onClose={onCloseSuccessModal} center>
        <div id="print-content">
          <h2 className="text-2xl font-bold my-4">Détails de votre commande</h2>
          {selectedOrder && (
            <>
              <div className="mb-4">
                <strong>Statut actuel:</strong> {selectedOrder.status}
              </div>
              <div className="mb-4">
                <label htmlFor="status" className="block text-lg font-medium mb-2">
                  Changer le statut:
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Sélectionner un statut --</option>
                  <option value="pending">En attente</option>
                  <option value="preparing">En préparation</option>
                  <option value="completed">Terminé</option>
                  <option value="refused">Refusé</option>
                </select>
              </div>
              {selectedStatus === 'refused' && (
                <div className="mb-4">
                  <label htmlFor="refusedReason" className="block text-lg font-medium mb-2">
                    Raison du refus:
                  </label>
                  <textarea
                    id="refusedReason"
                    value={refusedReason}
                    onChange={(e) => setRefusedReason(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Expliquer la raison du refus..."
                  ></textarea>
                </div>
              )}
              <button
                onClick={handleStatusUpdate}
                className="bg-[#2B9CB8] text-white px-6 py-2 rounded hover:brightness-95 transition duration-200"
              >
                Mettre à jour le statut
              </button>
            </>
          )}
        </div>
      </Modal>
      <div className="absolute w-full h-full">
        <img
          src="./agoraCMC.png"
          className="absolute w-full h-full top-0 left-0 object-cover"
          alt=""
        />
        <div className="absolute w-full h-full top-0 left-0 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-black/40 before:to-transparent before:pointer-events-none"></div>
      </div>

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






  )
}

export default Chef