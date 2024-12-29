function MenuManagement() {
    const [menuItems, setMenuItems] = React.useState([]);
    const [editingItem, setEditingItem] = React.useState(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [settings, setSettings] = React.useState(getSettings());
    
    const [formData, setFormData] = React.useState({
        name: '',
        price: '',
        offerPrice: '',
        gstPercentage: ''
    });

    React.useEffect(() => {
        try {
            setMenuItems(getMenuItems());
        } catch (error) {
            reportError(error);
        }
    }, []);

    const handleSubmit = (e) => {
        try {
            e.preventDefault();
            
            if (editingItem) {
                const updated = updateMenuItem(editingItem.id, formData);
                setMenuItems(menuItems.map(item => 
                    item.id === editingItem.id ? updated : item
                ));
                setEditingItem(null);
            } else {
                const newItem = saveMenuItem(formData);
                setMenuItems([...menuItems, newItem]);
            }
            
            setFormData({
                name: '',
                price: '',
                offerPrice: '',
                gstPercentage: ''
            });
        } catch (error) {
            reportError(error);
            alert('Failed to save menu item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            offerPrice: item.offerPrice || '',
            gstPercentage: item.gstPercentage || ''
        });
    };

    const handleGSTToggle = () => {
        try {
            const newSettings = { ...settings, gstEnabled: !settings.gstEnabled };
            updateSettings(newSettings);
            setSettings(newSettings);
        } catch (error) {
            reportError(error);
            alert('Failed to update GST settings');
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.price.toString().includes(searchTerm)
    );

    return (
        <div className="p-4" data-name="menu-management">
            <div className="mb-6 flex justify-between items-center" data-name="menu-header">
                <h2 className="text-2xl font-bold">Menu Management</h2>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.gstEnabled}
                            onChange={handleGSTToggle}
                            data-name="gst-toggle"
                        />
                        Enable GST
                    </label>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded"
                        data-name="search-input"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded" data-name="menu-form">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Item Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded"
                            required
                            data-name="name-input"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Price</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 border rounded"
                            required
                            min="0"
                            step="0.01"
                            data-name="price-input"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Offer Price (Optional)</label>
                        <input
                            type="number"
                            value={formData.offerPrice}
                            onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                            className="w-full px-4 py-2 border rounded"
                            min="0"
                            step="0.01"
                            data-name="offer-price-input"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">GST Percentage</label>
                        <input
                            type="number"
                            value={formData.gstPercentage}
                            onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                            className="w-full px-4 py-2 border rounded"
                            min="0"
                            max="100"
                            data-name="gst-input"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded"
                        data-name="submit-button"
                    >
                        {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                    {editingItem && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingItem(null);
                                setFormData({
                                    name: '',
                                    price: '',
                                    offerPrice: '',
                                    gstPercentage: ''
                                });
                            }}
                            className="ml-4 bg-gray-500 text-white px-6 py-2 rounded"
                            data-name="cancel-edit-button"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <div className="menu-item-list" data-name="menu-list">
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className="menu-item flex justify-between items-center"
                        data-name={`menu-item-${item.id}`}
                    >
                        <div>
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-gray-600">
                                Price: {formatCurrency(item.price)}
                                {item.offerPrice && (
                                    <span className="ml-2 text-green-600">
                                        Offer: {formatCurrency(item.offerPrice)}
                                    </span>
                                )}
                                {item.gstPercentage && (
                                    <span className="ml-2 text-gray-500">
                                        GST: {item.gstPercentage}%
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            data-name={`edit-button-${item.id}`}
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
