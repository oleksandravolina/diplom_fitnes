import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Delete,
  FitnessCenter,
  ArrowForward,
} from '@mui/icons-material';
import { plansApi } from '../services/api';

interface TrainingPlan {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  exercises: Array<any>;
}

const TrainingPlans: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', description: '' });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: plans } = useQuery(
    'trainingPlans',
    () => plansApi.getAll().then((res) => res.data as TrainingPlan[])
  );

  const createMutation = useMutation(
    (data: { name: string; description: string }) => plansApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainingPlans');
        setOpenDialog(false);
        setNewPlan({ name: '', description: '' });
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => plansApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainingPlans');
        setDeleteId(null);
      },
    }
  );

  const handleCreate = () => {
    if (newPlan.name.trim()) {
      createMutation.mutate(newPlan);
    }
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: { xs: 'none', md: 1200 }, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Plany treningowe
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Utwórz plan
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 } }}>
          {plans?.map((plan) => (
            <Box key={plan.id} sx={{ flex: '1 1 350px', minWidth: { xs: '100%', sm: 300 } }}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                }}
                onClick={() => navigate(`/plans/${plan.id}`)}
              >
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
                          {plan.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={plan.is_active ? 'Aktywny' : 'Nieaktywny'}
                          color={plan.is_active ? 'success' : 'default'}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Usuń">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(plan.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
                    {plan.description || 'Brak opisu'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Ćwiczeń: <strong>{plan.exercises?.length || 0}</strong>
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForward />}
                      sx={{ color: 'primary.main' }}
                    >
                      Otwórz
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {plans?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FitnessCenter sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Nie masz jeszcze planów treningowych
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Utwórz pierwszy plan, aby rozpocząć!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Utwórz plan
            </Button>
          </Box>
        )}

        {/* Dialog tworzenia planu */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nowy plan treningowy</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nazwa"
              fullWidth
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Opis"
              fullWidth
              multiline
              rows={3}
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button
              onClick={handleCreate}
              variant="contained"
              disabled={!newPlan.name.trim() || createMutation.isLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {createMutation.isLoading ? 'Tworzenie...' : 'Utwórz'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog potwierdzenia usunięcia */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Usunąć plan?</DialogTitle>
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

export default TrainingPlans;
