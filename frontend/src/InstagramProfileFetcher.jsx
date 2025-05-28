import React, { useState } from 'react';

const InstagramProfileFetcher = () => {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      console.log('Fetching profile for:', username);
      
      const response = await fetch(`http://localhost:3001/api/instagram/${username}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Profile data received:', data);
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Instagram Profile Fetcher</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Instagram username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSearch}
        disabled={loading || !username.trim()}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          loading || !username.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Fetching...' : 'Fetch Profile'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {profile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{profile.fullName}</h3>
            <p className="text-gray-600">@{profile.username}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold">{profile.posts?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{profile.followers?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{profile.following?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>

          {profile.bio && (
            <div>
              <h4 className="font-semibold mb-2">Bio:</h4>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstagramProfileFetcher;