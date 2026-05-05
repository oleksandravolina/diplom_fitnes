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
  Switch,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add,
  Delete,
  Notifications,
  NotificationsActive,
  AccessTime,
  Today,
} from '@mui/icons-material';
import { remindersApi } from '../services/api';

interface Reminder {
  id: number;
  title: string;
  message: string;
  day_of_week: number;
  reminder_time: string;
  is_active: boolean;
}

const DAYS_OF_WEEK = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const DAYS_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

const Reminders: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    day_of_week: 0,
    reminder_time: '09:00',
    is_active: true,
  });

  const { data: reminders } = useQuery(
    'reminders',
    () => remindersApi.getAll().then((res) => res.data as Reminder[])
  );

  const { data: todayReminders } = useQuery(
    'todayReminders',
    () => remindersApi.getToday().then((res) => res.data as Reminder[])
  );

  const createMutation = useMutation(
    (data: typeof newReminder) => remindersApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminders');
        queryClient.invalidateQueries('todayReminders');
        setOpenDialog(false);
        setNewReminder({
          title: '',
          message: '',
          day_of_week: 0,
          reminder_time: '09:00',
          is_active: true,
        });
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<Reminder> }) =>
      remindersApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminders');
        queryClient.invalidateQueries('todayReminders');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => remindersApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminders');
        queryClient.invalidateQueries('todayReminders');
        setDeleteId(null);
      },
    }
  );

  const handleCreate = () => {
    if (newReminder.title.trim()) {
      createMutation.mutate(newReminder);
    }
  };

  const toggleActive = (reminder: Reminder) => {
    updateMutation.mutate({
      id: reminder.id,
      data: { is_active: !reminder.is_active },
    });
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: { xs: 'none', md: 1200 }, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Przypomnienia
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
            Dodaj
          </Button>
        </Box>

        {/* Dzisiejsze przypomnienia */}
        {todayReminders && todayReminders.length > 0 && (
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Today sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Przypomnienia na dziś
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2 } }}>
                {todayReminders.map((reminder) => (
                  <Box key={reminder.id} sx={{ flex: '1 1 250px', minWidth: { xs: '100%', sm: 200 } }}>
                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {reminder.title}
                        </Typography>
                        {reminder.message && (
                          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                            {reminder.message}
                          </Typography>
                        )}
                        <Chip
                          icon={<AccessTime />}
                          label={reminder.reminder_time}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Wszystkie przypomnienia */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 } }}>
          {reminders?.map((reminder) => (
            <Box key={reminder.id} sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: 280 } }}>
              <Card
                sx={{
                  height: '100%',
                  opacity: reminder.is_active ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {reminder.is_active ? (
                        <NotificationsActive color="primary" sx={{ mr: 1 }} />
                      ) : (
                        <Notifications color="disabled" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {reminder.title}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteId(reminder.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {reminder.message || 'Brak opisu'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Chip
                        label={DAYS_FULL[reminder.day_of_week]}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        icon={<AccessTime />}
                        label={reminder.reminder_time}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Switch
                      checked={reminder.is_active}
                      onChange={() => toggleActive(reminder)}
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {reminders?.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Notifications sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Nie masz jeszcze przypomnień
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Utwórz przypomnienia, aby nie przegapić treningów!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Dodaj przypomnienie
            </Button>
          </Box>
        )}

        {/* Dialog tworzenia przypomnienia */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Nowe przypomnienie</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Tytuł"
              fullWidth
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Wiadomość"
              fullWidth
              multiline
              rows={2}
              value={newReminder.message}
              onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Dzień tygodnia:
            </Typography>
            <ToggleButtonGroup
              value={newReminder.day_of_week}
              exclusive
              onChange={(_, value) => value !== null && setNewReminder({ ...newReminder, day_of_week: value })}
              sx={{ mb: 2, flexWrap: 'wrap' }}
            >
              {DAYS_OF_WEEK.map((day, index) => (
                <ToggleButton key={index} value={index} size="small">
                  {day}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <TextField
              label="Godzina"
              type="time"
              fullWidth
              value={newReminder.reminder_time}
              onChange={(e) => setNewReminder({ ...newReminder, reminder_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button
              onClick={handleCreate}
              variant="contained"
              disabled={!newReminder.title.trim() || createMutation.isLoading}
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
          <DialogTitle>Usunąć przypomnienie?</DialogTitle>
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

export default Reminders;
