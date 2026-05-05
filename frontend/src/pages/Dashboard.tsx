import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Button,
  Skeleton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FitnessCenter,
  CalendarToday,
  Timer,
  LocalFireDepartment,
  TrendingUp,
  EmojiEvents,
  PlayArrow,
  Edit,
} from '@mui/icons-material';
import { trainerApi, historyApi } from '../services/api';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Recommendation {
  message: string;
  motivation: string;
  suggested_exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
  workout_type: string;
  reason: string;
}

interface Progress {
  total_workouts: number;
  workouts_this_month: number;
  total_duration_minutes: number;
  average_duration_minutes: number;
}

interface WorkoutHistory {
  id: number;
  date: string;
  duration_minutes: number;
  calories_burned: number;
  notes: string;
  exercises_data: any[];
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutHistory | null>(null);
  const [editForm, setEditForm] = useState({
    duration_minutes: 0,
    calories_burned: 0,
    notes: '',
  });

  const { data: recommendation, isLoading: recLoading } = useQuery(
    'recommendation',
    () => trainerApi.getRecommendation().then((res) => res.data as Recommendation)
  );

  const { data: progress, isLoading: progressLoading } = useQuery(
    'progress',
    () => trainerApi.getProgress().then((res) => res.data as Progress)
  );

  const { data: recentHistory } = useQuery(
    'recentHistory',
    () => historyApi.getAll().then((res) => res.data.slice(0, 5) as WorkoutHistory[])
  );

  const updateWorkoutMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<WorkoutHistory> }) =>
      historyApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recentHistory');
        setEditDialogOpen(false);
        setEditingWorkout(null);
      },
    }
  );

  const handleEditClick = (workout: WorkoutHistory) => {
    setEditingWorkout(workout);
    setEditForm({
      duration_minutes: workout.duration_minutes,
      calories_burned: workout.calories_burned || 0,
      notes: workout.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingWorkout) {
      updateWorkoutMutation.mutate({
        id: editingWorkout.id,
        data: editForm,
      });
    }
  };

  const getWorkoutTypeLabel = (type: string) => {
    switch (type) {
      case 'light':
        return { text: 'Lekki', color: '#48bb78' };
      case 'moderate':
        return { text: 'Średni', color: '#ed8936' };
      case 'intense':
        return { text: 'Intensywny', color: '#f56565' };
      default:
        return { text: type, color: '#999' };
    }
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: { xs: 'none', md: 1200 }, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Strona główna
        </Typography>

        {/* Wirtualny trener */}
        {recLoading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 3 }} />
        ) : recommendation ? (
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <FitnessCenter />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  🤖 Wirtualny trener
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: 'white' }}>
                {recommendation.message}
              </Typography>

              <Chip
                label={getWorkoutTypeLabel(recommendation.workout_type).text}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  mb: 2,
                }}
              />

              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'white' }}>
                  &ldquo;{recommendation.motivation}&rdquo;
                </Typography>
              </Paper>

              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'white' }}>
                Zalecane ćwiczenia:
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {recommendation.suggested_exercises.slice(0, 4).map((exercise, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      textAlign: 'center',
                      minWidth: 120,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                      {exercise.name}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, color: 'white' }}>
                      {exercise.sets} × {exercise.reps}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => navigate('/plans')}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Rozpocznij trening
              </Button>
            </Box>
          </Paper>
        ) : null}

        {/* Statystyki */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 }, mb: 4 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 200 } }}>
            {progressLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
            ) : (
              <StatCard
                title="Wszystkie treningi"
                value={progress?.total_workouts || 0}
                icon={<FitnessCenter />}
                color="#667eea"
              />
            )}
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 200 } }}>
            {progressLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
            ) : (
              <StatCard
                title="W tym miesiącu"
                value={progress?.workouts_this_month || 0}
                icon={<CalendarToday />}
                color="#48bb78"
              />
            )}
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 200 } }}>
            {progressLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
            ) : (
              <StatCard
                title="Całkowity czas"
                value={`${Math.round((progress?.total_duration_minutes || 0) / 60)}h`}
                icon={<Timer />}
                color="#ed8936"
              />
            )}
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 200 } }}>
            {progressLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
            ) : (
              <StatCard
                title="Średni czas"
                value={`${progress?.average_duration_minutes || 0}min`}
                icon={<LocalFireDepartment />}
                color="#f56565"
              />
            )}
          </Box>
        </Box>

        {/* Postęp */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp sx={{ color: '#667eea', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Postęp tygodniowy
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cel: 5 treningów
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {Math.min(((progress?.workouts_this_month || 0) / 5) * 100, 100).toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(((progress?.workouts_this_month || 0) / 5) * 100, 100)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Ostatnie treningi */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EmojiEvents sx={{ color: '#667eea', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Ostatnie treningi
              </Typography>
            </Box>

            {recentHistory && recentHistory.length > 0 ? (
              isMobile ? (
                // Wersja mobilna - karty
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentHistory.map((workout: WorkoutHistory) => (
                    <Card key={workout.id} variant="outlined">
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {format(new Date(workout.date), 'dd MMM yyyy', { locale: pl })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(workout.date), 'HH:mm', { locale: pl })}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(workout)}
                            sx={{ color: '#667eea' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            size="small" 
                            label={`${workout.exercises_data?.length || 0} ćwiczeń`}
                            variant="outlined"
                          />
                          <Chip 
                            size="small" 
                            label={`${workout.duration_minutes} min`}
                            variant="outlined"
                          />
                          {workout.calories_burned > 0 && (
                            <Chip 
                              size="small" 
                              label={`${workout.calories_burned} kcal`}
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                // Wersja desktop - tabela
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Ćwiczenia</TableCell>
                        <TableCell>Czas trwania</TableCell>
                        <TableCell>Kalorie</TableCell>
                        <TableCell align="right">Akcje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentHistory.map((workout: WorkoutHistory) => (
                        <TableRow key={workout.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {format(new Date(workout.date), 'dd MMM yyyy', { locale: pl })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(workout.date), 'HH:mm', { locale: pl })}
                            </Typography>
                          </TableCell>
                          <TableCell>{workout.exercises_data?.length || 0}</TableCell>
                          <TableCell>{workout.duration_minutes} min</TableCell>
                          <TableCell>{workout.calories_burned || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edytuj">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(workout)}
                                sx={{ color: '#667eea' }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Brak zapisanych treningów
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/plans')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Rozpocznij trening
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Dialog edycji treningu */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edytuj trening</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Czas trwania (minuty)"
                type="number"
                fullWidth
                value={editForm.duration_minutes}
                onChange={(e) =>
                  setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) || 0 })
                }
                InputProps={{
                  startAdornment: <Timer color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                label="Spalone kalorie"
                type="number"
                fullWidth
                value={editForm.calories_burned}
                onChange={(e) =>
                  setEditForm({ ...editForm, calories_burned: parseInt(e.target.value) || 0 })
                }
                InputProps={{
                  startAdornment: <LocalFireDepartment color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                label="Notatki"
                fullWidth
                multiline
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={updateWorkoutMutation.isLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {updateWorkoutMutation.isLoading ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Dashboard;
