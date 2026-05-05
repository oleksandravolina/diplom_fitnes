import React, { useState } from 'react';
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add,
  Delete,
  FitnessCenter,
  Search,
} from '@mui/icons-material';
import { exerciseCatalogApi } from '../services/api';

interface Exercise {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  equipment: string;
}

const CATEGORIES = [
  { value: 'klatka_piersiowa', label: 'Klatka piersiowa' },
  { value: 'nogi', label: 'Nogi' },
  { value: 'plecy', label: 'Plecy' },
  { value: 'brzuch', label: 'Brzuch' },
  { value: 'ramiona', label: 'Ramiona' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'kardio', label: 'Kardio' },
  { value: 'rozgrzewka', label: 'Rozgrzewka' },
];

const DIFFICULTIES = [
  { value: 'latwy', label: 'Łatwy', color: 'success' },
  { value: 'sredni', label: 'Średni', color: 'warning' },
  { value: 'trudny', label: 'Trudny', color: 'error' },
];

const EQUIPMENT = [
  { value: 'brak', label: 'Brak (masa ciała)' },
  { value: 'hantle', label: 'Hantle' },
  { value: 'sztanga', label: 'Sztanga' },
  { value: 'maszyna', label: 'Maszyna' },
  { value: 'gumy', label: 'Gumy oporowe' },
  { value: 'kettlebell', label: 'Kettlebell' },
];

const ExerciseCatalog: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    category: 'klatka_piersiowa',
    difficulty: 'sredni',
    equipment: 'brak',
  });

  const { data: exercises } = useQuery(
    ['exerciseCatalog', categoryFilter, difficultyFilter, searchQuery],
    () => exerciseCatalogApi.getAll({
      category: categoryFilter || undefined,
      difficulty: difficultyFilter || undefined,
      search: searchQuery || undefined,
    }).then((res) => res.data as Exercise[])
  );

  const createMutation = useMutation(
    (data: typeof newExercise) => exerciseCatalogApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exerciseCatalog');
        setOpenDialog(false);
        setNewExercise({
          name: '',
          description: '',
          category: 'klatka_piersiowa',
          difficulty: 'sredni',
          equipment: 'brak',
        });
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => exerciseCatalogApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exerciseCatalog');
        setDeleteId(null);
      },
    }
  );

  const handleCreate = () => {
    if (newExercise.name.trim()) {
      createMutation.mutate(newExercise);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = DIFFICULTIES.find(d => d.value === difficulty);
    return diff?.color || 'default';
  };

  const getDifficultyLabel = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.label || difficulty;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getEquipmentLabel = (equipment: string) => {
    return EQUIPMENT.find(e => e.value === equipment)?.label || equipment;
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: { xs: 'none', md: 1200 }, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Katalog ćwiczeń
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Dodaj ćwiczenie
          </Button>
        </Box>

        {/* Filtry */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 }, alignItems: 'center' }}>
              <TextField
                placeholder="Szukaj ćwiczenia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
                size="small"
                sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 200 } }}
              />
              <FormControl sx={{ flex: '1 1 150px', minWidth: { xs: 'calc(50% - 6px)', sm: 150 } }} size="small">
                <InputLabel>Kategoria</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Kategoria"
                  onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">Wszystkie</MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: '1 1 150px', minWidth: { xs: 'calc(50% - 6px)', sm: 150 } }} size="small">
                <InputLabel>Poziom</InputLabel>
                <Select
                  value={difficultyFilter}
                  label="Poziom"
                  onChange={(e: SelectChangeEvent) => setDifficultyFilter(e.target.value)}
                >
                  <MenuItem value="">Wszystkie</MenuItem>
                  {DIFFICULTIES.map((diff) => (
                    <MenuItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Lista ćwiczeń */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 } } }>
          {exercises?.map((exercise) => (
            <Box key={exercise.id} sx={{ flex: '1 1 350px', minWidth: { xs: '100%', sm: 300 } }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          mr: 2,
                        }}
                      >
                        <FitnessCenter />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {exercise.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={getCategoryLabel(exercise.category)}
                          color="primary"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Tooltip title="Usuń">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(exercise.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {exercise.description || 'Brak opisu'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      size="small"
                      label={getDifficultyLabel(exercise.difficulty)}
                      color={getDifficultyColor(exercise.difficulty) as any}
                    />
                    <Chip
                      size="small"
                      label={getEquipmentLabel(exercise.equipment)}
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {exercises?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FitnessCenter sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Brak ćwiczeń w katalogu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Dodaj pierwsze ćwiczenie do katalogu!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Dodaj ćwiczenie
            </Button>
          </Box>
        )}

        {/* Dialog dodawania ćwiczenia */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nowe ćwiczenie</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nazwa"
              fullWidth
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Opis"
              fullWidth
              multiline
              rows={3}
              value={newExercise.description}
              onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Kategoria</InputLabel>
              <Select
                value={newExercise.category}
                label="Kategoria"
                onChange={(e: SelectChangeEvent) => setNewExercise({ ...newExercise, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Poziom trudności</InputLabel>
              <Select
                value={newExercise.difficulty}
                label="Poziom trudności"
                onChange={(e: SelectChangeEvent) => setNewExercise({ ...newExercise, difficulty: e.target.value })}
              >
                {DIFFICULTIES.map((diff) => (
                  <MenuItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Sprzęt</InputLabel>
              <Select
                value={newExercise.equipment}
                label="Sprzęt"
                onChange={(e: SelectChangeEvent) => setNewExercise({ ...newExercise, equipment: e.target.value })}
              >
                {EQUIPMENT.map((eq) => (
                  <MenuItem key={eq.value} value={eq.value}>
                    {eq.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button
              onClick={handleCreate}
              variant="contained"
              disabled={!newExercise.name.trim() || createMutation.isLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {createMutation.isLoading ? 'Dodawanie...' : 'Dodaj'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog potwierdzenia usunięcia */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Usunąć ćwiczenie?</DialogTitle>
          <DialogContent>
            <Typography>Tego działania nie można cofnąć.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Anuluj</Button>
            <Button
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              color="error"
              variant="contained"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Usuwanie...' : 'Usuń'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

// Dodaj import Avatar
import { Avatar } from '@mui/material';

export default ExerciseCatalog;
