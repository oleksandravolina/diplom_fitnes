import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Fade,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  PlayArrow,
  FitnessCenter,
  CheckCircle,
  Timer,
  LocalFireDepartment,
} from '@mui/icons-material';
import { plansApi, exercisesApi, historyApi, exerciseCatalogApi } from '../services/api';

interface Exercise {
  id: number;
  name: string;
  description: string;
  sets: number;
  reps: number;
  weight: number;
  rest_seconds: number;
}

interface ExerciseCatalogItem {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  equipment: string;
}

interface TrainingPlan {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  exercises: Exercise[];
}

const TrainingPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const planId = parseInt(id || '0');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openExerciseDialog, setOpenExerciseDialog] = useState(false);
  const [openWorkoutDialog, setOpenWorkoutDialog] = useState(false);
  const [deleteExerciseId, setDeleteExerciseId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  const [selectedExercise, setSelectedExercise] = useState<ExerciseCatalogItem | null>(null);
  const [newExercise, setNewExercise] = useState({
    sets: 3,
    reps: 10,
    weight: 0,
    rest_seconds: 60,
  });
  
  const [workoutData, setWorkoutData] = useState({
    duration_minutes: 30,
    calories_burned: 0,
    notes: '',
  });

  const { data: plan, isLoading } = useQuery(
    ['trainingPlan', planId],
    () => plansApi.getById(planId).then((res) => res.data as TrainingPlan),
    { enabled: !!planId }
  );

  const { data: exerciseCatalog } = useQuery(
    'exerciseCatalog',
    () => exerciseCatalogApi.getAll({}).then((res) => res.data as ExerciseCatalogItem[])
  );

  const addExerciseMutation = useMutation(
    (data: { name: string; description: string; sets: number; reps: number; weight: number; rest_seconds: number }) => 
      exercisesApi.create(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trainingPlan', planId]);
        setOpenExerciseDialog(false);
        setSelectedExercise(null);
        setNewExercise({
          sets: 3,
          reps: 10,
          weight: 0,
          rest_seconds: 60,
        });
      },
    }
  );

  const deleteExerciseMutation = useMutation(
    (exerciseId: number) => exercisesApi.delete(planId, exerciseId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['trainingPlan', planId]);
        setDeleteExerciseId(null);
      },
    }
  );

  const completeWorkoutMutation = useMutation(
    (data: any) => historyApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recentHistory');
        setOpenWorkoutDialog(false);
        setActiveStep(0);
      },
    }
  );

  const handleAddExercise = () => {
    if (selectedExercise) {
      addExerciseMutation.mutate({
        name: selectedExercise.name,
        description: selectedExercise.description || '',
        sets: newExercise.sets,
        reps: newExercise.reps,
        weight: newExercise.weight,
        rest_seconds: newExercise.rest_seconds,
      });
    }
  };

  const handleCompleteWorkout = () => {
    if (!plan?.exercises.length) return;

    const exercisesData = plan.exercises.map((ex) => ({
      exercise_id: ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
    }));

    completeWorkoutMutation.mutate({
      training_plan_id: planId,
      exercises_data: exercisesData,
      duration_minutes: workoutData.duration_minutes,
      calories_burned: workoutData.calories_burned,
      notes: workoutData.notes,
    });
  };

  const workoutSteps = ['Przygotowanie', 'Wykonanie', 'Zakończenie'];

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Ładowanie...</Typography>
      </Box>
    );
  }

  if (!plan) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Plan nie znaleziony</Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: { xs: 'none', md: 1200 }, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/plans')}
          sx={{ mb: 2, color: 'text.primary' }}
        >
          Wróć do planów
        </Button>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {plan.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.description || 'Brak opisu'}
                </Typography>
                <Chip
                  label={plan.is_active ? 'Aktywny' : 'Nieaktywny'}
                  color={plan.is_active ? 'success' : 'default'}
                />
              </Box>
              <Button
                variant="contained"
                size={isMobile ? 'small' : 'large'}
                startIcon={<PlayArrow />}
                onClick={() => setOpenWorkoutDialog(true)}
                disabled={!plan.exercises.length}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {isMobile ? 'Rozpocznij' : 'Rozpocznij trening'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Ćwiczenia ({plan.exercises?.length || 0})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                size="small"
                onClick={() => setOpenExerciseDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Dodaj
              </Button>
            </Box>

            {plan.exercises?.length > 0 ? (
              isMobile ? (
                // Wersja mobilna - karty
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {plan.exercises.map((exercise) => (
                    <Card key={exercise.id} variant="outlined">
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {exercise.name}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteExerciseId(exercise.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        {exercise.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {exercise.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip size="small" label={`${exercise.sets} serii`} variant="outlined" />
                          <Chip size="small" label={`${exercise.reps} powt.`} variant="outlined" />
                          <Chip 
                            size="small" 
                            label={exercise.weight > 0 ? `${exercise.weight} kg` : 'Masa ciała'} 
                            variant="outlined" 
                          />
                          <Chip size="small" label={`${exercise.rest_seconds}s`} variant="outlined" />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                // Wersja desktop - tabela
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ćwiczenie</TableCell>
                        <TableCell align="center">Serie</TableCell>
                        <TableCell align="center">Powtórzenia</TableCell>
                        <TableCell align="center">Waga</TableCell>
                        <TableCell align="center">Odpoczynek</TableCell>
                        <TableCell align="right">Akcje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plan.exercises.map((exercise) => (
                        <TableRow key={exercise.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {exercise.name}
                            </Typography>
                            {exercise.description && (
                              <Typography variant="caption" color="text.secondary">
                                {exercise.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">{exercise.sets}</TableCell>
                          <TableCell align="center">{exercise.reps}</TableCell>
                          <TableCell align="center">
                            {exercise.weight > 0 ? `${exercise.weight} kg` : 'Masa ciała'}
                          </TableCell>
                          <TableCell align="center">{exercise.rest_seconds}s</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Usuń">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteExerciseId(exercise.id)}
                              >
                                <Delete />
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
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <FitnessCenter sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  W tym planie nie ma jeszcze ćwiczeń
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Dodaj ćwiczenia z katalogu, aby rozpocząć trening!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenExerciseDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  Dodaj z katalogu
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Dialog dodawania ćwiczenia z katalogu */}
        <Dialog
          open={openExerciseDialog}
          onClose={() => setOpenExerciseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Dodaj ćwiczenie z katalogu</DialogTitle>
          <DialogContent>
            <Autocomplete
              options={exerciseCatalog || []}
              getOptionLabel={(option) => option.name}
              value={selectedExercise}
              onChange={(_, newValue) => setSelectedExercise(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Wybierz ćwiczenie"
                  margin="dense"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.category} • {option.difficulty}
                    </Typography>
                  </Box>
                </Box>
              )}
              sx={{ mb: 2 }}
            />
            
            {selectedExercise && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedExercise.description || 'Brak opisu'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip size="small" label={selectedExercise.category} sx={{ mr: 1 }} />
                  <Chip size="small" label={selectedExercise.difficulty} />
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 150px' }}>
                <TextField
                  label="Serie"
                  type="number"
                  fullWidth
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 0 })}
                />
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <TextField
                  label="Powtórzenia"
                  type="number"
                  fullWidth
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 0 })}
                />
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <TextField
                  label="Waga (kg)"
                  type="number"
                  fullWidth
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise({ ...newExercise, weight: parseInt(e.target.value) || 0 })}
                />
              </Box>
              <Box sx={{ flex: '1 1 150px' }}>
                <TextField
                  label="Odpoczynek (sek)"
                  type="number"
                  fullWidth
                  value={newExercise.rest_seconds}
                  onChange={(e) => setNewExercise({ ...newExercise, rest_seconds: parseInt(e.target.value) || 0 })}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenExerciseDialog(false)}>Anuluj</Button>
            <Button
              onClick={handleAddExercise}
              variant="contained"
              disabled={!selectedExercise || addExerciseMutation.isLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {addExerciseMutation.isLoading ? 'Dodawanie...' : 'Dodaj'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog zakończenia treningu */}
        <Dialog
          open={openWorkoutDialog}
          onClose={() => setOpenWorkoutDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              Zakończenie treningu
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {workoutSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Kończysz trening &ldquo;{plan.name}&rdquo;
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ćwiczeń: {plan.exercises.length}
                </Typography>
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Czas trwania (minuty)"
                  type="number"
                  fullWidth
                  value={workoutData.duration_minutes}
                  onChange={(e) =>
                    setWorkoutData({ ...workoutData, duration_minutes: parseInt(e.target.value) || 0 })
                  }
                  InputProps={{
                    startAdornment: <Timer color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  label="Spalone kalorie"
                  type="number"
                  fullWidth
                  value={workoutData.calories_burned}
                  onChange={(e) =>
                    setWorkoutData({ ...workoutData, calories_burned: parseInt(e.target.value) || 0 })
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
                  value={workoutData.notes}
                  onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h6">Świetna robota!</Typography>
                <Typography variant="body2" color="text.secondary">
                  Trening zostanie zapisany w historii
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep((prev) => prev - 1)}>Wstecz</Button>
            )}
            {activeStep < workoutSteps.length - 1 ? (
              <Button
                onClick={() => setActiveStep((prev) => prev + 1)}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Dalej
              </Button>
            ) : (
              <Button
                onClick={handleCompleteWorkout}
                variant="contained"
                disabled={completeWorkoutMutation.isLoading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {completeWorkoutMutation.isLoading ? 'Zapisywanie...' : 'Zakończ'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Dialog potwierdzenia usunięcia */}
        <Dialog open={!!deleteExerciseId} onClose={() => setDeleteExerciseId(null)}>
          <DialogTitle>Usunąć ćwiczenie?</DialogTitle>
          <DialogContent>
            <Typography>Tego działania nie można cofnąć.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteExerciseId(null)}>Anuluj</Button>
            <Button
              onClick={() => deleteExerciseId && deleteExerciseMutation.mutate(deleteExerciseId)}
              color="error"
              variant="contained"
              disabled={deleteExerciseMutation.isLoading}
            >
              {deleteExerciseMutation.isLoading ? 'Usuwanie...' : 'Usuń'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default TrainingPlanDetail;
