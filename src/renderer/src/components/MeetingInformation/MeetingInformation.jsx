import React from 'react';
import { useMeetingSessionState, useMeetingState, useNetwork, useParticipantIds, useRoom } from '@daily-co/daily-react';
import './MeetingInformation.css';

export default function MeetingInformation() {
  const { data } = useMeetingSessionState();
  console.log(data);
  const room = useRoom();
  const network = useNetwork();
  const allParticipantsArray = useParticipantIds();
  console.log(allParticipantsArray);
  const meetingState = useMeetingState();


  return (
    <section className="meeting-information">
      <h1>Meeting information</h1>
      <ul>
        <li>Meeting state: {meetingState ?? 'unknown'}</li>
        <li>Meeting ID: {room?.id ?? 'unknown'}</li>
        <li>Room name: {room?.name ?? 'unknown'}</li>
        <li>Network status: {network?.threshold ?? 'unknown'}</li>
        <li>Network topology: {network?.topology ?? 'unknown'}</li>
        <li>Participant IDs: {allParticipantsArray.join(', ')}</li>
      </ul>
    </section>
  );
}
