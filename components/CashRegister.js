function CashRegister() {
    const [bills, setBills] = React.useState([]);
    const [selectedDate, setSelectedDate] = React.useState('');
    const [totals, setTotals] = React.useState({ cash: 0, upi: 0 });
    const [dateWiseTotals, setDateWiseTotals] = React.useState([]);

    React.useEffect(() => {
        try {
            const allBills = getBills();
            setBills(allBills);
            calculateDateWiseTotals(allBills);
        } catch (error) {
            reportError(error);
        }
    }, []);

    const calculateDateWiseTotals = (billsData) => {
        try {
            const totalsMap = new Map();

            billsData.forEach(bill => {
                const date = new Date(bill.date).toLocaleDateString();
                const current = totalsMap.get(date) || { cash: 0, upi: 0, total: 0, date };

                if (bill.paymentMethod === 'CASH') {
                    current.cash += bill.billTotal;
                } else if (bill.paymentMethod === 'UPI') {
                    current.upi += bill.billTotal;
                }
                current.total = current.cash + current.upi;
                totalsMap.set(date, current);
            });

            const sortedTotals = Array.from(totalsMap.values())
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setDateWiseTotals(sortedTotals);

            if (selectedDate) {
                const selected = totalsMap.get(new Date(selectedDate).toLocaleDateString());
                setTotals({
                    cash: selected?.cash || 0,
                    upi: selected?.upi || 0
                });
            }
        } catch (error) {
            reportError(error);
        }
    };

    const handleDateChange = (e) => {
        try {
            const date = e.target.value;
            setSelectedDate(date);

            if (date) {
                const selected = dateWiseTotals.find(
                    total => new Date(total.date).toLocaleDateString() === 
                            new Date(date).toLocaleDateString()
                );
                setTotals({
                    cash: selected?.cash || 0,
                    upi: selected?.upi || 0
                });
            } else {
                setTotals({ cash: 0, upi: 0 });
            }
        } catch (error) {
            reportError(error);
        }
    };

    const handleExportReport = () => {
        try {
            const headers = ['Date', 'Cash Amount', 'UPI Amount', 'Total Amount'];
            const rows = dateWiseTotals.map(total => [
                total.date,
                formatCurrency(total.cash),
                formatCurrency(total.upi),
                formatCurrency(total.total)
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cash-register-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            reportError(error);
            alert('Failed to export report');
        }
    };

    return (
        <div className="p-4" data-name="cash-register">
            <div className="mb-6 flex justify-between items-center" data-name="register-header">
                <h2 className="text-2xl font-bold">Cash Register</h2>
                <button
                    onClick={handleExportReport}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    data-name="export-button"
                >
                    Export Report
                </button>
            </div>

            <div className="mb-6" data-name="date-selector">
                <label className="block mb-2">Select Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="px-4 py-2 border rounded"
                    data-name="date-input"
                />
            </div>

            {selectedDate && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-name="selected-date-summary">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Cash Payments</h3>
                        <p className="text-2xl text-green-600">{formatCurrency(totals.cash)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">UPI Payments</h3>
                        <p className="text-2xl text-blue-600">{formatCurrency(totals.upi)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Total</h3>
                        <p className="text-2xl text-gray-800">{formatCurrency(totals.cash + totals.upi)}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden" data-name="totals-table">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cash Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                UPI Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dateWiseTotals.map((total, index) => (
                            <tr key={index} data-name={`total-row-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {total.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-green-600">
                                    {formatCurrency(total.cash)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                                    {formatCurrency(total.upi)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                                    {formatCurrency(total.total)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {dateWiseTotals.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No transactions found
                    </div>
                )}
            </div>
        </div>
    );
}
