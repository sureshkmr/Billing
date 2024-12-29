function BillHistory({ isAdmin }) {
    const [bills, setBills] = React.useState([]);
    const [filteredBills, setFilteredBills] = React.useState([]);
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [settings, setSettings] = React.useState(getSettings());

    React.useEffect(() => {
        try {
            const allBills = getBills();
            setBills(allBills);
            setFilteredBills(allBills);
        } catch (error) {
            reportError(error);
        }
    }, []);

    const handleSearch = () => {
        try {
            let filtered = [...bills];
            
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59); // Include the entire end date

                filtered = filtered.filter(bill => {
                    const billDate = new Date(bill.date);
                    return billDate >= start && billDate <= end;
                });
            }

            setFilteredBills(filtered);
        } catch (error) {
            reportError(error);
        }
    };

    const handleExportExcel = () => {
        try {
            const headers = ['Bill No', 'Date', 'Items', 'Payment Method', 'Total Amount'];
            const rows = filteredBills.map(bill => [
                bill.billNumber,
                new Date(bill.date).toLocaleString(),
                bill.items.map(item => `${item.menuItem.name} (${item.quantity})`).join(', '),
                bill.paymentMethod,
                formatCurrency(bill.billTotal)
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bills-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            reportError(error);
            alert('Failed to export bills');
        }
    };

    const handlePrintBill = (bill) => {
        try {
            const billHTML = generateBillHTML(bill, settings);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(billHTML);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            reportError(error);
            alert('Failed to print bill');
        }
    };

    return (
        <div className="p-4" data-name="bill-history">
            <div className="mb-6 flex justify-between items-center" data-name="history-header">
                <h2 className="text-2xl font-bold">Bill History</h2>
                {isAdmin && (
                    <button
                        onClick={handleExportExcel}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        data-name="export-button"
                    >
                        Export to Excel
                    </button>
                )}
            </div>

            <div className="mb-6 flex gap-4 items-end" data-name="date-filter">
                <div>
                    <label className="block mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-4 py-2 border rounded"
                        data-name="start-date-input"
                    />
                </div>
                <div>
                    <label className="block mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-2 border rounded"
                        data-name="end-date-input"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    data-name="search-button"
                >
                    Search
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden" data-name="bills-table">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bill No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBills.map(bill => (
                            <tr key={bill.id} data-name={`bill-row-${bill.id}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {bill.billNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(bill.date).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <ul>
                                        {bill.items.map((item, index) => (
                                            <li key={index}>
                                                {item.menuItem.name} ({item.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {bill.paymentMethod}
                                    {bill.paymentMethod === 'CASH' && bill.cashReceived && (
                                        <div className="text-sm text-gray-500">
                                            Received: {formatCurrency(bill.cashReceived)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {formatCurrency(bill.billTotal)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handlePrintBill(bill)}
                                        className="text-blue-600 hover:text-blue-900"
                                        data-name={`print-button-${bill.id}`}
                                    >
                                        Print
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBills.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No bills found
                    </div>
                )}
            </div>
        </div>
    );
}
