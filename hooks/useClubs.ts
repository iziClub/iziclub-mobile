// src/hooks/useClubs.ts

import { useEffect, useState } from 'react';
import { getClubs } from '../services/clubs.service';
import { Club } from '../types/club';

export const useClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await getClubs();
      setClubs(data.data);
    } catch (err) {
      setError('Erreur lors du fetch des clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return { clubs, loading, error, refetch: fetchClubs };
};
