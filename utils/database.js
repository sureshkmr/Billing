const MENU_ITEMS_KEY = 'menuItems';
const BILLS_KEY = 'bills';
const SETTINGS_KEY = 'settings';

function getNextBillNumber() {
    try {
        const bills = JSON.parse(localStorage.getItem(BILLS_KEY) || '[]');
        const maxBillNumber = bills.reduce((max, bill) => 
            bill.billNumber > max ? bill.billNumber : max, 0);
        return maxBillNumber + 1;
    } catch (error) {
        reportError(error);
        return 1;
    }
}

function saveMenuItem(item) {
    try {
        if (!item.name || !item.price) {
            throw new Error('Item name and price are required');
        }
        
        const menuItems = JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || '[]');
        const newItem = {
            ...item,
            id: Date.now().toString(),
            price: parseFloat(item.price),
            offerPrice: item.offerPrice ? parseFloat(item.offerPrice) : null,
            gstPercentage: item.gstPercentage ? parseFloat(item.gstPercentage) : 0
        };
        menuItems.push(newItem);
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(menuItems));
        return newItem;
    } catch (error) {
        reportError(error);
        throw new Error('Failed to save menu item: ' + error.message);
    }
}

function getMenuItems() {
    try {
        return JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || '[]');
    } catch (error) {
        reportError(error);
        return [];
    }
}

function updateMenuItem(id, updatedItem) {
    try {
        if (!id || !updatedItem.name || !updatedItem.price) {
            throw new Error('Invalid item data');
        }

        const menuItems = getMenuItems();
        const index = menuItems.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error('Item not found');
        }

        menuItems[index] = {
            ...menuItems[index],
            ...updatedItem,
            price: parseFloat(updatedItem.price),
            offerPrice: updatedItem.offerPrice ? parseFloat(updatedItem.offerPrice) : null,
            gstPercentage: updatedItem.gstPercentage ? parseFloat(updatedItem.gstPercentage) : 0
        };

        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(menuItems));
        return menuItems[index];
    } catch (error) {
        reportError(error);
        throw new Error('Failed to update menu item: ' + error.message);
    }
}

function saveBill(bill) {
    try {
        if (!bill.items || !bill.items.length) {
            throw new Error('Bill must contain items');
        }

        const bills = JSON.parse(localStorage.getItem(BILLS_KEY) || '[]');
        const newBill = {
            ...bill,
            id: Date.now().toString(),
            billNumber: getNextBillNumber(),
            date: new Date().toISOString(),
            items: bill.items.map(item => ({
                menuItem: { ...item.menuItem },
                quantity: parseInt(item.quantity)
            }))
        };

        bills.push(newBill);
        localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
        return newBill;
    } catch (error) {
        reportError(error);
        throw new Error('Failed to save bill: ' + error.message);
    }
}

function getBills() {
    try {
        const bills = JSON.parse(localStorage.getItem(BILLS_KEY) || '[]');
        return bills.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        reportError(error);
        return [];
    }
}

function updateBill(id, updatedBill) {
    try {
        if (!id) {
            throw new Error('Bill ID is required');
        }

        const bills = getBills();
        const index = bills.findIndex(bill => bill.id === id);
        if (index === -1) {
            throw new Error('Bill not found');
        }

        bills[index] = { ...bills[index], ...updatedBill };
        localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
        return bills[index];
    } catch (error) {
        reportError(error);
        throw new Error('Failed to update bill: ' + error.message);
    }
}

function getSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"gstEnabled": true}');
    } catch (error) {
        reportError(error);
        return { gstEnabled: true };
    }
}

function updateSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return settings;
    } catch (error) {
        reportError(error);
        throw new Error('Failed to update settings: ' + error.message);
    }
}
