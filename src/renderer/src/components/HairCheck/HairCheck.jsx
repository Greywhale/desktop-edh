import React, { useCallback, useEffect, useState } from 'react';
import {
  useDevices,
  useDaily,
  useDailyEvent,
  DailyVideo,
  useLocalSessionId,
  useParticipantProperty,
} from '@daily-co/daily-react';
import UserMediaError from '../UserMediaError/UserMediaError';

import './HairCheck.css';

export default function HairCheck({ joinCall, cancelCall }) {
  const localSessionId = useLocalSessionId();
  const initialUsername = useParticipantProperty(localSessionId, 'user_name');
  const { currentCam, cameras, setCamera } = useDevices();
  const callObject = useDaily();
  const [username, setUsername] = useState(initialUsername);

  const [getUserMediaError, setGetUserMediaError] = useState(false);

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  const handleChange = (e) => {
    setUsername(e.target.value);
    callObject.setUserName(e.target.value);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    //Default Player Params
    //TODO Make an init object
    callObject.setUserData({eliminated: false, lifeTotal: 40, order: 0})
    joinCall(username.trim());
  };

  const updateCamera = (e) => {
    setCamera(e.target.value);
  };

  return getUserMediaError ? (
    <UserMediaError />
  ) : (
    <form className="hair-check" onSubmit={handleJoin}>
      <h1>Setup your hardware</h1>
      {/* Video preview */}
      {localSessionId && <DailyVideo sessionId={localSessionId} mirror />}

      {/* Username */}
      <div>
        <label htmlFor="username">Your name:</label>
        <input
          name="username"
          type="text"
          placeholder="Enter username"
          onChange={handleChange}
          value={username || ' '}
        />
      </div>

      {/* Camera select */}
      <div>
        <label htmlFor="cameraOptions">Camera:</label>
        <select name="cameraOptions" id="cameraSelect" onChange={updateCamera} value={currentCam?.device?.deviceId}>
          {cameras.map((camera) => (
            <option key={`cam-${camera.device.deviceId}`} value={camera.device.deviceId}>
              {camera.device.label}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleJoin} type="submit">
        Join call
      </button>
      <button onClick={cancelCall} className="cancel-call" type="button">
        Back to start
      </button>
    </form>
  );
}
