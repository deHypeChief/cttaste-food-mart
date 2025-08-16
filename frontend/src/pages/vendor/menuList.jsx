import { useEffect, useRef, useState } from "react";
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
import { menuService } from "../../api/menu.js";

export default function MenuList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    type: "",
    price: "",
    status: "Available",
    imageFile: null,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const menuTypes = [
    "Rice",
    "Swallow",
    "Soup",
    "Grill",
    "Pasta",
    "Salad",
    "Dessert",
    "Drinks",
    "Sides",
    "Others",
  ];

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await menuService.list();
      const list = res?.data?.items || [];
      setItems(list);
    } catch (e) {
      setError(e.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onSelectImageNew = (file) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('Image exceeds 1MB limit');
      return;
    }
    setError("");
    setNewItem(prev => ({ ...prev, imageFile: file }));
  };

  const onDropNew = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) onSelectImageNew(file);
  };

  const onDragEnter = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const onBrowseClick = () => fileInputRef.current?.click();

  const handleToggleItem = async (id, isActive) => {
    try {
      // Sync both isActive and status so toggle controls availability
      await menuService.update(id, { 
        isActive,
        status: isActive ? 'Available' : 'Unavailable'
      });
      await loadItems();
    } catch (e) {
      setError(e.message || 'Failed to update availability');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      setFormError("");
      console.log('Deleting menu item:', id);
      await menuService.remove(id);
      await loadItems();
      setDeletingItem(null);
      console.log('Menu item deleted successfully');
    } catch (e) {
      console.error('Error deleting menu item:', e);
      setFormError(e.message || 'Failed to delete menu item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setFormError(""); // Clear any previous errors
  };

  const handleSaveEdit = async () => {
    try {
      setFormError("");
      if (!editingItem.name?.trim()) {
        setFormError('Name is required');
        return;
      }
      const priceNum = Number(editingItem.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        setFormError('Valid price is required');
        return;
      }
      
      console.log('Updating menu item:', editingItem._id);
      const payload = {
        name: editingItem.name,
        type: editingItem.type,
        price: priceNum,
        status: editingItem.status,
      };
      await menuService.update(editingItem._id, payload);
      await loadItems();
      setEditingItem(null); // This will close the dialog
      setFormError(""); // Clear any errors
      console.log('Menu item updated successfully');
    } catch (e) {
      console.error('Error updating menu item:', e);
      setFormError(e.message || 'Failed to update menu item');
    }
  };

  const handleAddItem = async () => {
    try {
      setFormError("");
      // Basic validation
      if (!newItem.name?.trim()) {
        setFormError('Name is required');
        return;
      }
      const priceNum = Number(newItem.price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        setFormError('Valid price is required');
        return;
      }
      setIsSubmitting(true);
      console.log('Creating menu item:', newItem.name);
      
      const res = await menuService.create({
        name: newItem.name,
        type: newItem.type || '',
        price: priceNum,
        status: newItem.status,
      });
      
      console.log('Menu item created:', res);
      let created = res.data.item;
      
      // Upload image if provided
      if (newItem.imageFile) {
        console.log('Uploading image for item:', created._id);
        const up = await menuService.uploadImage(created._id, newItem.imageFile);
        console.log('Image upload response:', up);
        created = up.data.item;
      }
      
      await loadItems();
      setNewItem({ name: "", type: "", price: "", status: "Available", imageFile: null });
      setDialogOpen(false); // Close dialog after successful submission
      console.log('Menu item added successfully');
    } catch (e) {
      console.error('Error adding menu item:', e);
      setFormError(e.message || 'Failed to add menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fdf6f1] min-h-screen">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900">Your Menu List</h1>
  {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
  {loading && <p className="mb-4 text-sm">Loading menu...</p>}
      
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
      value={`${items.length}`}
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="primary"
              className="px-6 py-3"
              onClick={() => setDialogOpen(true)}
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
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Select type</option>
                  {menuTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Price">
                <Input
                  placeholder="Enter price (₦)"
                  value={newItem.price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                />
              </FormField>
              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}
              <FormField label="Image (max 1MB)">
                <div
                  className={`rounded-xl border-2 border-dashed transition-colors ${dragOver ? 'border-primary bg-orange-50' : 'border-gray-300 bg-white'} p-4 md:p-6 flex items-center gap-4 cursor-pointer`}
                  onClick={onBrowseClick}
                  onDrop={onDropNew}
                  onDragEnter={onDragEnter}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  role="button"
                  aria-label="Upload image"
                >
                  {newItem.imageFile ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <img
                          src={URL.createObjectURL(newItem.imageFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-800 font-medium">{newItem.imageFile.name}</p>
                        <p className="text-xs text-gray-500">{Math.round(newItem.imageFile.size / 1024)} KB</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className="text-sm text-primary hover:underline"
                            onClick={(e) => { e.stopPropagation(); onBrowseClick(); }}
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:underline"
                            onClick={(e) => { e.stopPropagation(); setNewItem(prev => ({ ...prev, imageFile: null })); }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <Icon icon="majesticons:image-line" className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="text-primary font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 1MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onSelectImageNew(e.target.files?.[0])}
                  />
                </div>
              </FormField>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button 
                  variant="outlineFade"
                  onClick={() => {
                    setNewItem({ name: "", type: "", price: "", status: "Available", imageFile: null });
                    setFormError("");
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleAddItem} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
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
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td className="py-8 px-4 text-center text-gray-500 text-sm" colSpan={5}>
                    {items.length === 0 ? 'No menu created' : 'No items match your search'}
                  </td>
                </tr>
              )}
              {filteredItems.map((item) => (
                <tr key={item._id} className="border-b last:border-b-0">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                            <Icon icon="majesticons:food" className="w-6 h-6 text-orange-600" />
                          </div>
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{item.type}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{item.status}</td>
                  <td className="py-4 px-4 text-gray-900 font-medium">₦ {item.price}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 justify-end">
                      <Switch
                        checked={item.isActive}
                        onChange={(isActive) => handleToggleItem(item._id, isActive)}
                        size="md"
                      />
                      
                      {/* Edit button triggers global dialog */}
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => handleEditItem(item)}
                      >
                        <Icon icon="majesticons:pencil-line" className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Delete button triggers global dialog */}
                      <button 
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Icon icon="majesticons:delete-bin-line" className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
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
                <select
                  value={editingItem.type}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Select type</option>
                  {menuTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Price">
                <Input
                  value={editingItem.price}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                />
              </FormField>
              <FormField label="Status">
                <select
                  value={editingItem.status}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </FormField>
              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outlineFade" onClick={() => setEditingItem(null)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Delete Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outlineFade" onClick={() => setDeletingItem(null)}>Cancel</Button>
            </DialogClose>
            <Button 
              variant="primary" 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => handleDeleteItem(deletingItem?._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
