import { useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardCard, LargeCard } from "../../components/dashboardCard";
import { Input } from "../../components/form";
import Button from "../../components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/dialog";

// Sample delivery requests data
const deliveryRequests = [
  {
    id: "DEL-001",
    orderId: "OID-239048202450",
    customer: "James Bond Flied",
    customerPhone: "+234 801 234 5678",
    address: "No 20 Wistron church, Victoria Island, Lagos",
    items: ["Fried Rice", "Grilled Chicken", "Pepsi"],
    amount: "₦15,500",
    deliveryFee: "₦2,000",
    total: "₦17,500",
    status: "pending",
    requestTime: "2024-08-13 10:30 AM",
    distance: "3.2 km",
    estimatedTime: "25 mins",
    rider: null
  },
  {
    id: "DEL-002",
    orderId: "OID-239048202451",
    customer: "Sarah Johnson",
    customerPhone: "+234 802 567 8901",
    address: "15 Admiralty Way, Lekki Phase 1, Lagos",
    items: ["Jollof Rice", "Fish Stew", "Coke"],
    amount: "₦12,800",
    deliveryFee: "₦1,500",
    total: "₦14,300",
    status: "assigned",
    requestTime: "2024-08-13 11:45 AM",
    distance: "5.8 km",
    estimatedTime: "35 mins",
    rider: "Mike Ahmed"
  },
  {
    id: "DEL-003",
    orderId: "OID-239048202452",
    customer: "David Williams",
    customerPhone: "+234 803 345 6789",
    address: "8 Allen Avenue, Ikeja, Lagos",
    items: ["Pepper Soup", "White Rice"],
    amount: "₦8,500",
    deliveryFee: "₦1,800",
    total: "₦10,300",
    status: "in_transit",
    requestTime: "2024-08-13 12:15 PM",
    distance: "7.1 km",
    estimatedTime: "40 mins",
    rider: "John Okafor"
  },
  {
    id: "DEL-004",
    orderId: "OID-239048202453",
    customer: "Mary Adebayo",
    customerPhone: "+234 804 456 7890",
    address: "22 Bourdillon Road, Ikoyi, Lagos",
    items: ["Egusi Soup", "Pounded Yam", "Water"],
    amount: "₦18,200",
    deliveryFee: "₦2,200",
    total: "₦20,400",
    status: "delivered",
    requestTime: "2024-08-13 01:20 PM",
    distance: "4.5 km",
    estimatedTime: "30 mins",
    rider: "Grace Okoro"
  },
  {
    id: "DEL-005",
    orderId: "OID-239048202454",
    customer: "Ahmed Hassan",
    customerPhone: "+234 805 567 8901",
    address: "45 Ozumba Mbadiwe, Victoria Island, Lagos",
    items: ["Suya", "Fried Rice", "Sprite"],
    amount: "₦11,000",
    deliveryFee: "₦1,700",
    total: "₦12,700",
    status: "cancelled",
    requestTime: "2024-08-13 02:30 PM",
    distance: "2.8 km",
    estimatedTime: "20 mins",
    rider: null
  }
];

const statusConfig = {
  pending: { color: "text-yellow-600 bg-yellow-100", label: "Pending" },
  assigned: { color: "text-blue-600 bg-blue-100", label: "Assigned" },
  in_transit: { color: "text-purple-600 bg-purple-100", label: "In Transit" },
  delivered: { color: "text-green-600 bg-green-100", label: "Delivered" },
  cancelled: { color: "text-red-600 bg-red-100", label: "Cancelled" }
};

export default function Delivery() {
  const [requests, setRequests] = useState(deliveryRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusChange = (deliveryId, newStatus) => {
    setRequests(prev => prev.map(request => 
      request.id === deliveryId ? { ...request, status: newStatus } : request
    ));
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const inTransitRequests = requests.filter(r => r.status === "in_transit").length;
  const deliveredToday = requests.filter(r => r.status === "delivered").length;

  return (
    <div className="bg-[#fdf6f1] min-h-screen">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900">Delivery Requests</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Requests"
          value={totalRequests.toString()}
          subtitle="All delivery requests"
          icon="majesticons:box-line"
        />
        <DashboardCard
          title="Pending"
          value={pendingRequests.toString()}
          subtitle="Awaiting assignment"
          icon="majesticons:clock-line"
        />
        <DashboardCard
          title="In Transit"
          value={inTransitRequests.toString()}
          subtitle="Currently delivering"
          icon="majesticons:truck-line"
        />
        <DashboardCard
          title="Delivered Today"
          value={deliveredToday.toString()}
          subtitle="Completed deliveries"
          icon="majesticons:check-circle-line"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search by customer, order ID, or address"
            icon="majesticons:search-line"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <Button 
          variant="primary"
          icon="majesticons:refresh-line"
          className="px-6 py-3"
        >
          Refresh
        </Button>
      </div>

      {/* Delivery Requests Table */}
      <LargeCard title="Delivery Requests" icon="majesticons:truck-line">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Delivery ID</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Distance</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{request.id}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{request.customer}</div>
                      <div className="text-xs text-gray-500">{request.requestTime}</div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{request.total}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
                      {statusConfig[request.status].label}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{request.distance}</div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      {request.status === "pending" && (
                        <Button
                          variant="outlineFade"
                          size="sm"
                          onClick={() => handleStatusChange(request.id, "assigned")}
                        >
                          Assign
                        </Button>
                      )}
                      
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        onClick={() => handleViewDetails(request)}
                        title="View Details"
                      >
                        <Icon icon="majesticons:eye-line" className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Icon icon="majesticons:phone-line" className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="majesticons:truck-line" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No delivery requests found</p>
            </div>
          )}
        </div>
      </LargeCard>

      {/* Delivery Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b pb-4">
            <DialogTitle>Delivery Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6 hide-scrollbar">
              {/* Customer & Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{selectedRequest.customer}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="font-medium">{selectedRequest.customerPhone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Address:</span>
                      <p className="font-medium">{selectedRequest.address}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Order ID:</span>
                      <p className="font-medium">{selectedRequest.orderId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Delivery ID:</span>
                      <p className="font-medium">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Request Time:</span>
                      <p className="font-medium">{selectedRequest.requestTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items & Pricing */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedRequest.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="border-t mt-4 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Items Total:</span>
                      <span>{selectedRequest.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>{selectedRequest.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Amount:</span>
                      <span>{selectedRequest.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Distance:</span>
                      <p className="font-medium">{selectedRequest.distance}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Estimated Time:</span>
                      <p className="font-medium">{selectedRequest.estimatedTime}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedRequest.status].color}`}>
                        {statusConfig[selectedRequest.status].label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Rider Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Assigned Rider:</span>
                      <p className="font-medium">
                        {selectedRequest.rider || (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t bg-white">
                {selectedRequest.status === "pending" && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, "assigned");
                      setIsDialogOpen(false);
                    }}
                  >
                    Assign Rider
                  </Button>
                )}
                
                <Button variant="outlineFade">
                  Contact Customer
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}