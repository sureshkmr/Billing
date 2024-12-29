function BillingSystem() {
    const [selectedItems, setSelectedItems] = React.useState([]);
    const [menuItems, setMenuItems] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('');
    const [cashReceived, setCashReceived] = React.useState('');
    const [settings, setSettings] = React.useState(getSettings());
    const [showHistory, setShowHistory] = React.useState(false);

    React.useEffect(() => {
        try {
            setMenuItems(getMenuItems());
        } catch (error) {
            reportError(error);
        }
    }, []);

    const handleAddItem = (menuItem) => {
        try {
            const existingItem = selectedItems.find(item => item.menuItem.id === menuItem.id);
            if (existingItem) {
                setSelectedItems(selectedItems.map(item =>
                    item.menuItem.id === menuItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                setSelectedItems([...selectedItems, { menuItem, quantity: 1 }]);
            }
        } catch (error) {
            reportError(error);
        }
    };

    const handleUpdateQuantity = (itemId, quantity) => {
        try {
            if (quantity <= 0) {
                setSelectedItems(selectedItems.filter(item => item.menuItem.id !== itemId));
            } else {
                setSelectedItems(selectedItems.map(item =>
                    item.menuItem.id === itemId
                        ? { ...item, quantity }
                        : item
                ));
            }
        } catch (error) {
            reportError(error);
        }
    };

    const handleGenerateBill = () => {
        try {
            if (!selectedItems.length) {
                alert('Please add items to the bill');
                return;
            }
            if (!paymentMethod) {
                alert('Please select a payment method');
                return;
            }
            if (paymentMethod === 'CASH' && !cashReceived) {
                alert('Please enter cash received amount');
                return;
            }

            const billTotal = calculateBillTotal(selectedItems, settings).total;
            if (paymentMethod === 'CASH' && parseFloat(cashReceived) < billTotal) {
                alert('Cash received is less than bill amount');
                return;
            }

            const bill = {
                items: selectedItems,
                date: new Date().toISOString(),
                paymentMethod,
                billTotal,
                cashReceived: paymentMethod === 'CASH' ? parseFloat(cashReceived) : null
            };

            const savedBill = saveBill(bill);
            const billHTML = generateBillHTML(savedBill, settings);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(billHTML);
            printWindow.document.close();
            printWindow.print();

            // Reset form
            setSelectedItems([]);
            setPaymentMethod('');
            setCashReceived('');
        } catch (error) {
            reportError(error);
            alert('Failed to generate bill');
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.price.toString().includes(searchTerm)
    );

    const billTotal = calculateBillTotal(selectedItems, settings).total;
    const change = paymentMethod === 'CASH' ? calculateChange(billTotal, parseFloat(cashReceived || 0)) : 0;

    return (
        <div className="billing-container" data-name="billing-system">
            {showHistory ? (
                <div>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
                        data-name="back-button"
                    >
                        Back to Billing
                    </button>
                    <BillHistory isAdmin={false} />
                </div>
            ) : (
                <div>
                    <div className="bill-header" data-name="bill-header">
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setSelectedItems([]);
                                    setPaymentMethod('');
                                    setCashReceived('');
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                data-name="new-bill-button"
                            >
                                New Bill
                            </button>
                            <button
                                onClick={() => setShowHistory(true)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                data-name="view-history-button"
                            >
                                View History
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border rounded"
                            data-name="search-input"
                        />
                    </div>

                    <div className="menu-grid" data-name="menu-grid">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                className="menu-card cursor-pointer"
                                onClick={() => handleAddItem(item)}
                                data-name={`menu-item-${item.id}`}
                            >
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-gray-600">
                                    Price: {formatCurrency(item.price)}
                                </p>
                                {item.offerPrice && (
                                    <p className="text-green-600">
                                        Offer: {formatCurrency(item.offerPrice)}
                                    </p>
                                )}
                                {settings.gstEnabled && (
                                    <p className="text-gray-500">
                                        GST: {item.gstPercentage}%
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bill-summary" data-name="bill-summary">
                        <h2 className="text-xl font-bold mb-4">Current Bill</h2>
                        {selectedItems.map(item => (
                            <div
                                key={item.menuItem.id}
                                className="flex justify-between items-center mb-2"
                                data-name={`selected-item-${item.menuItem.id}`}
                            >
                                <span>{item.menuItem.name}</span>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateQuantity(item.menuItem.id, parseInt(e.target.value))}
                                        className="w-16 px-2 py-1 border rounded"
                                        min="0"
                                        data-name={`quantity-input-${item.menuItem.id}`}
                                    />
                                    <span>
                                        {formatCurrency(
                                            calculateItemTotal(item.menuItem, item.quantity, settings).total
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(billTotal)}</span>
                            </div>
                        </div>

                        <div className="payment-options" data-name="payment-options">
                            <div className="mb-4">
                                <label className="block mb-2">Payment Method:</label>
                                <div className="flex gap-4">
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="UPI"
                                            checked={paymentMethod === 'UPI'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        UPI
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH"
                                            checked={paymentMethod === 'CASH'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        Cash
                                    </label>
                                </div>
                            </div>

                            {paymentMethod === 'CASH' && (
                                <div className="mb-4">
                                    <label className="block mb-2">Cash Received:</label>
                                    <input
                                        type="number"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        className="w-full px-4 py-2 border rounded"
                                        min="0"
                                        data-name="cash-received-input"
                                    />
                                    {parseFloat(cashReceived) > 0 && (
                                        <div className="mt-2">
                                            Change: {formatCurrency(change)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bill-actions">
                            <button
                                onClick={handleGenerateBill}
                                className="bg-green-500 text-white px-6 py-2 rounded"
                                data-name="generate-bill-button"
                            >
                                Generate Bill
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedItems([]);
                                    setPaymentMethod('');
                                    setCashReceived('');
                                }}
                                className="bg-red-500 text-white px-6 py-2 rounded"
                                data-name="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
