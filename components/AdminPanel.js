function AdminPanel() {
    const [activeTab, setActiveTab] = React.useState('menu');

    const tabs = [
        { id: 'menu', label: 'Menu Management' },
        { id: 'bills', label: 'Bill History' },
        { id: 'cash', label: 'Cash Register' }
    ];

    return (
        <div className="admin-container" data-name="admin-panel">
            <div className="admin-tabs" data-name="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        data-name={`tab-${tab.id}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="admin-content" data-name="admin-content">
                {activeTab === 'menu' && <MenuManagement />}
                {activeTab === 'bills' && <BillHistory isAdmin={true} />}
                {activeTab === 'cash' && <CashRegister />}
            </div>
        </div>
    );
}

