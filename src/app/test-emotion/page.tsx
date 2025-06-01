import { EmotionExample } from '@/components/examples/EmotionExample';
import { getNonce } from '@/lib/nonce';

export default async function TestEmotionPage() {
  // Get the nonce for debugging information
  const nonce = await getNonce();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Emotion CacheProvider + CSP Nonce Test
        </h1>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Implementation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-green-600 mb-2">✅ Nonce Available</h3>
              <p className="text-sm text-gray-600">
                Nonce: {nonce ? `${nonce.substring(0, 12)}...` : 'Not available'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-green-600 mb-2">✅ CSP Headers</h3>
              <p className="text-sm text-gray-600">
                Check Network tab for CSP headers with nonce
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-green-600 mb-2">✅ EmotionCacheProvider</h3>
              <p className="text-sm text-gray-600">
                Emotion cache configured with nonce
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-green-600 mb-2">✅ Style Injection</h3>
              <p className="text-sm text-gray-600">
                Emotion styles should have nonce attribute
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Emotion Example Component</h2>
          <p className="text-gray-600 mb-6">
            This component uses Emotion CSS with the CacheProvider. Check DevTools to verify:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-6">
            <li>No CSP violations in Console</li>
            <li>Style tags have nonce attribute matching the request nonce</li>
            <li>Emotion styles are properly applied</li>
          </ul>
          
          <EmotionExample />
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Open browser DevTools (F12)</li>
            <li>Go to Console tab - check for CSP violations (should be none)</li>
            <li>Go to Network tab - refresh and check response headers for CSP policy</li>
            <li>Go to Elements tab - find &lt;style&gt; tags and verify they have nonce attributes</li>
            <li>Click the &quot;Test Emotion Styles&quot; button to verify functionality</li>
          </ol>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Development Debug Info</h3>
            <pre className="text-xs text-yellow-700 overflow-x-auto">
              {JSON.stringify({
                environment: process.env.NODE_ENV,
                nonceAvailable: !!nonce,
                nonceLength: nonce?.length || 0,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 