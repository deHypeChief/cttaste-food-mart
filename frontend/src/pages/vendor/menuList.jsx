import { useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardCard } from "../../components/dashboardCard";
import { Input, FormField } from "../../components/form";
import Button from "../../components/button";
import Switch from "../../components/switch";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose 
} from "../../components/dialog";

// Sample menu data
const menuItems = [
  {
    id: 1,
    name: "Fried rice",
    type: "Rice",
    status: "Available",
    price: "₦ 4,315",
    image: "/fried-rice.jpg", // Replace with actual image path
    isActive: true
  },
  {
    id: 2,
    name: "Fried rice",
    type: "Rice", 
    status: "Available",
    price: "₦ 4,315",
    image: "/fried-rice.jpg", // Replace with actual image path
    isActive: true
  },
  {
    id: 3,
    name: "Fried rice",
    type: "Rice",
    status: "Available", 
    price: "₦ 4,315",
    image: "/fried-rice.jpg", // Replace with actual image path
    isActive: true
  }
];

export default function MenuList() {
  const [items, setItems] = useState(menuItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    type: "",
    price: "",
    status: "Available"
  });

  const handleToggleItem = (id, isActive) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isActive } : item
    ));
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    setItems(prev => prev.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
  };

  const handleAddItem = () => {
    const id = Math.max(...items.map(item => item.id)) + 1;
    setItems(prev => [...prev, { 
      id, 
      ...newItem, 
      isActive: true,
      image: "/placeholder.jpg"
    }]);
    setNewItem({ name: "", type: "", price: "", status: "Available" });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fdf6f1] min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900">Your Orders</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="Popular Items"
          value="5"
          subtitle="Your Most Selling"
          icon="majesticons:home-line"
        />
        <DashboardCard
          title="Menu Items"
          value="12"
          subtitle="Total counts on your menu"
          icon="majesticons:menu-line"
        />
      </div>

      {/* Search and Add Item */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search menu"
            icon="majesticons:search-line"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[500px]"
          />
        </div>
        <Button 
          variant="outlineFade"
          icon="majesticons:filter-line"
          iconPosition="left"
          className="px-6 py-3"
        >
          Date Sort
        </Button>
        
        {/* Add Item Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="primary"
              className="px-6 py-3"
            >
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Add a new item to your restaurant menu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField label="Item Name">
                <Input
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Type">
                <Input
                  placeholder="Enter food type"
                  value={newItem.type}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                />
              </FormField>
              <FormField label="Price">
                <Input
                  placeholder="Enter price (₦)"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                />
              </FormField>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outlineFade">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Food</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Type</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Price</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {/* Placeholder for food image */}
                        <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                          <Icon icon="majesticons:food" className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{item.type}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{item.status}</td>
                  <td className="py-4 px-4 text-gray-900 font-medium">{item.price}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Switch
                        checked={item.isActive}
                        onChange={(isActive) => handleToggleItem(item.id, isActive)}
                        size="md"
                      />
                      
                      {/* Edit Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => handleEditItem(item)}
                          >
                            <Icon icon="majesticons:pencil-line" className="w-5 h-5 text-gray-600" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Menu Item</DialogTitle>
                            <DialogDescription>
                              Update the details of this menu item.
                            </DialogDescription>
                          </DialogHeader>
                          {editingItem && (
                            <div className="space-y-4 py-4">
                              <FormField label="Item Name">
                                <Input
                                  value={editingItem.name}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </FormField>
                              <FormField label="Type">
                                <Input
                                  value={editingItem.type}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, type: e.target.value }))}
                                />
                              </FormField>
                              <FormField label="Price">
                                <Input
                                  value={editingItem.price}
                                  onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                                />
                              </FormField>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outlineFade">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={handleSaveEdit}>Save Changes</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Delete Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Icon icon="majesticons:delete-bin-line" className="w-5 h-5 text-red-500" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Menu Item</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{item.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outlineFade">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button 
                                variant="primary" 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                Delete
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
