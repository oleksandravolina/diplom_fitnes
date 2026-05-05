import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Fade,
} from '@mui/material';
import {
  Delete,
  FitnessCenter,
  CalendarToday,
  Timer,
  LocalFireDepartment,
} from '@mui/icons-material';
import { historyApi } from '../services/api';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface WorkoutRecord {
  id: number;
  date: string;
  notes: string;
  exercises_data: Array<{
    exercise_id: number;
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
  duration_minutes: number;
  calories_burned: number;
}

const History: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: history } = useQuery(
    'trainingHistory',
    () => historyApi.getAll().then((res) => res.data as WorkoutRecord[])
  );

  const deleteMutation = useMutation(
    (id: number) => historyApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainingHistory');
      },
    }
  );

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: { xs: 'none', md: 1200 }, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Historia treningów
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 } }}>
          {history && history.length > 0 ? (
            history.map((record) => (
              <Box key={record.id} sx={{ flex: '1 1 400px', minWidth: { xs: '100%', sm: 300 } }}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {format(new Date(record.date), 'dd MMMM yyyy', { locale: pl })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(record.date), 'HH:mm', { locale: pl })}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(record.id)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        icon={<Timer />}
                        label={`${record.duration_minutes} min`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {record.calories_burned > 0 && (
                        <Chip
                          icon={<LocalFireDepartment />}
                          label={`${record.calories_burned} kcal`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        icon={<FitnessCenter />}
                        label={`${record.exercises_data?.length || 0} ćwiczeń`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>

                    {record.notes && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                          mb: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {record.notes}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Wykonane ćwiczenia:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {record.exercises_data?.map((exercise, idx) => (
                        <Chip
                          key={idx}
                          label={`${exercise.name} (${exercise.sets}×${exercise.reps}${exercise.weight > 0 ? ` @ ${exercise.weight}kg` : ''})`}
                          size="small"
                          sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          ) : (
            <Box sx={{ flex: 1, textAlign: 'center', py: 8 }}>
              <CalendarToday sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Brak zapisanych treningów
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Zacznij trenować i zapisuj swoje wyniki!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default History;
