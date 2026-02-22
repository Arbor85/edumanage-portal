import { Mentee } from '../types';

export interface MenteeCreate {
  name: string;
  email_address: string;
  creator_id: string;
}

export const getMentees = async (userId: string, signal?: AbortSignal): Promise<Mentee[]> => {
  const response = await fetch(`http://127.0.0.1:8000/api/mentees?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    throw new Error('Failed to load mentees.');
  }

  return (await response.json()) as Mentee[];
};

export const createMentee = async (payload: MenteeCreate): Promise<Mentee> => {
  const response = await fetch('http://127.0.0.1:8000/api/mentees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Failed to create mentee.');
  }

  return (await response.json()) as Mentee;
};

export const acceptInvitation = async (inviteKey: string, name: string, userId: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`http://127.0.0.1:8000/api/mentees/accept-invitation/${inviteKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, user_id: userId })
  });

  if (!response.ok) {
    throw new Error('Failed to accept invitation.');
  }

  return (await response.json()) as { success: boolean; message: string };
};

export const deleteMentee = async (menteeId: string): Promise<{ message: string }> => {
  const response = await fetch(`http://127.0.0.1:8000/api/mentees/${menteeId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete mentee.');
  }

  return (await response.json()) as { message: string };
};
