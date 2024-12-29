function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [userType, setUserType] = React.useState(null);
    
    const handleLogin = (type) => {
        try {
            setIsLoggedIn(true);
            setUserType(type);
        } catch (error) {
            reportError(error);
        }
    };

    const handleLogout = () => {
        try {
            setIsLoggedIn(false);
            setUserType(null);
        } catch (error) {
            reportError(error);
        }
    };

    return (
        <div className="app-container" data-name="app-root">
            {!isLoggedIn ? (
                <Login onLogin={handleLogin} />
            ) : (
                <div>
                    <Header onLogout={handleLogout} userType={userType} />
                    {userType === 'admin' ? (
                        <AdminPanel />
                    ) : (
                        <BillingSystem />
                    )}
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
