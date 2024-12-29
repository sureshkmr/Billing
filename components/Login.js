function Login({ onLogin }) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        try {
            e.preventDefault();
            const userType = authenticateUser(username, password);
            
            if (userType) {
                onLogin(userType);
                setError('');
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            reportError(error);
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" data-name="login-container">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6" data-name="login-title">
                    Snacks Bunk Login
                </h1>
                <form onSubmit={handleSubmit} data-name="login-form">
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 border rounded"
                            data-name="username-input"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            data-name="password-input"
                            required
                        />
                    </div>
                    {error && <div className="error-message mb-4" data-name="error-message">{error}</div>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        data-name="login-button"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
