function calculateItemTotal(item, quantity, settings) {
    try {
        const price = parseFloat(item.offerPrice || item.price);
        const subtotal = price * quantity;
        
        if (!settings.gstEnabled || !item.gstPercentage) {
            return {
                subtotal,
                gst: 0,
                total: subtotal
            };
        }

        const gstAmount = (subtotal * item.gstPercentage) / 100;
        return {
            subtotal,
            gst: gstAmount,
            total: subtotal + gstAmount
        };
    } catch (error) {
        reportError(error);
        throw new Error('Failed to calculate item total');
    }
}

function calculateBillTotal(items, settings) {
    try {
        return items.reduce((acc, item) => {
            const { subtotal, gst, total } = calculateItemTotal(item.menuItem, item.quantity, settings);
            return {
                subtotal: acc.subtotal + subtotal,
                gst: acc.gst + gst,
                total: acc.total + total
            };
        }, { subtotal: 0, gst: 0, total: 0 });
    } catch (error) {
        reportError(error);
        throw new Error('Failed to calculate bill total');
    }
}

function formatCurrency(amount) {
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    } catch (error) {
        reportError(error);
        return `₹${amount.toFixed(2)}`;
    }
}

function calculateChange(billTotal, amountReceived) {
    try {
        const change = amountReceived - billTotal;
        return change >= 0 ? change : 0;
    } catch (error) {
        reportError(error);
        throw new Error('Failed to calculate change');
    }
}

function generateBillHTML(bill, settings) {
    try {
        const { items, billNumber, date, paymentMethod, billTotal } = bill;
        
        return `
            <div class="bill-print">
                <h2>Snacks Bunk</h2>
                <p>Bill No: ${billNumber}</p>
                <p>Date: ${new Date(date).toLocaleString()}</p>
                <hr>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        ${settings.gstEnabled ? '<th>GST</th>' : ''}
                        <th>Total</th>
                    </tr>
                    ${items.map(item => `
                        <tr>
                            <td>${item.menuItem.name}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.menuItem.offerPrice || item.menuItem.price)}</td>
                            ${settings.gstEnabled ? `<td>${item.menuItem.gstPercentage}%</td>` : ''}
                            <td>${formatCurrency(calculateItemTotal(item.menuItem, item.quantity, settings).total)}</td>
                        </tr>
                    `).join('')}
                </table>
                <hr>
                <p>Total: ${formatCurrency(billTotal)}</p>
                <p>Payment Method: ${paymentMethod}</p>
            </div>
        `;
    } catch (error) {
        reportError(error);
        throw new Error('Failed to generate bill HTML');
    }
}
