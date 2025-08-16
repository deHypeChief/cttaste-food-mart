import { useState } from 'react';
import { testApiConnection, testAuthEndpoints } from '../api/test.js';
import Button from './button.jsx';

export default function ApiDebugger() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const addResult = (result) => {
        setResults(prev => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
    };

    const runTest = async (testFunction, testName) => {
        setIsLoading(true);
        try {
            const result = await testFunction();
            addResult({ name: testName, ...result });
        } catch (error) {
            addResult({ name: testName, success: false, error: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const clearResults = () => setResults([]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">API Connection Debugger</h1>
                
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Test API Endpoints</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                            onClick={() => runTest(testApiConnection, 'API Connection')}
                            disabled={isLoading}
                            className="w-full"
                        >
                            Test API Connection
                        </Button>
                        <Button 
                            onClick={() => runTest(testAuthEndpoints.testUserRegister, 'User Registration')}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full"
                        >
                            Test User Register
                        </Button>
                        <Button 
                            onClick={() => runTest(testAuthEndpoints.testVendorRegister, 'Vendor Registration')}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full"
                        >
                            Test Vendor Register
                        </Button>
                    </div>
                    <div className="mt-4">
                        <Button 
                            onClick={clearResults}
                            variant="outline"
                            className="w-full"
                        >
                            Clear Results
                        </Button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Test Results</h2>
                    {isLoading && (
                        <div className="text-blue-600 mb-4">Running test...</div>
                    )}
                    
                    {results.length === 0 && !isLoading && (
                        <div className="text-gray-500">No tests run yet. Click a test button above.</div>
                    )}
                    
                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div 
                                key={index} 
                                className={`p-4 rounded border-l-4 ${
                                    result.success 
                                        ? 'bg-green-50 border-green-500' 
                                        : 'bg-red-50 border-red-500'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{result.name}</h3>
                                        <p className="text-sm text-gray-600">{result.timestamp}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        result.success 
                                            ? 'bg-green-200 text-green-800' 
                                            : 'bg-red-200 text-red-800'
                                    }`}>
                                        {result.success ? 'SUCCESS' : 'FAILED'}
                                    </span>
                                </div>
                                {result.error && (
                                    <div className="mt-2 text-red-600 text-sm">
                                        <strong>Error:</strong> {result.error}
                                    </div>
                                )}
                                {result.data && (
                                    <div className="mt-2">
                                        <details className="text-sm">
                                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                                Show response data
                                            </summary>
                                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                                {JSON.stringify(result.data, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
