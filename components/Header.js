function Header({ onLogout, userType }) {
    return (
        <header className="bg-white shadow-md" data-name="header">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold" data-name="header-title">
                    Snacks Bunk
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600" data-name="user-type">
                        {userType === 'admin' ? 'Admin Panel' : 'Billing System'}
                    </span>
                    <button
                        onClick={onLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        data-name="logout-button"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
