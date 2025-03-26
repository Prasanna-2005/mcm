import React, { useEffect, useState } from 'react';

const Profile = () => {
    const [profile, setProfile] = useState({});

    useEffect(() => {
        fetch('http://localhost:5002/getprofile', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => console.error('Error fetching profile:', err));
    }, []);

    return (
        <div>
            <h2>Profile</h2>
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
        </div>
    );
};

export default Profile;
