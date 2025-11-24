import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAlarmsData } from '../hooks/useAlarmsData';
import { useSitesData } from '../../sites/hooks/useSitesData'; // Import useSitesData
import {
  AlarmMethod,
  Severity,
  CommunicationAlarmRequest,
  CommunicationAlarmResponse,
  CommunicationLossDto
} from '../types';

// Validation schema for the form
const validationSchema = yup.object({
  siteId: yup.number().required('Site is required').min(1, 'Site is required'),
  alarmName: yup.string().required('Alarm Name is required').max(200, 'Alarm Name cannot exceed 200 characters'),
  emails: yup.string().optional().nullable(true),
  phones: yup.string().optional().nullable(true),
  method: yup.number().required('Notification Method is required'),
  communicationLoss: yup.object({
    severity: yup.number().required('Severity is required'),
    numHours: yup.number().required('Number of Hours is required').min(1, 'Must be at least 1 hour'),
  }).required('Communication Loss details are required').nullable(true),
});

const CommunicationAlarmConfig: React.FC = () => {
  const { communicationAlarms, createCommunicationAlarm, updateCommunicationAlarm, isLoading: alarmsLoading } = useAlarmsData();
  const { sites, loading: sitesLoading, error: sitesError } = useSitesData(); // Use useSitesData hook
  const [open, setOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<CommunicationAlarmResponse | null>(null);

  const handleOpen = (alarm?: CommunicationAlarmResponse) => {
    setEditingAlarm(alarm || null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAlarm(null);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      id: 0,
      siteId: 0,
      alarmName: '',
      emails: '',
      phones: '',
      method: AlarmMethod.Email,
      communicationLoss: {
        severity: Severity.Critical,
        numHours: 1,
      },
    } as CommunicationAlarmRequest,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const alarmData: CommunicationAlarmRequest = {
        id: values.id,
        siteId: values.siteId,
        alarmName: values.alarmName,
        emails: values.emails === '' ? undefined : values.emails, // Pass undefined if empty string
        phones: values.phones === '' ? undefined : values.phones, // Pass undefined if empty string
        method: values.method,
        communicationLoss: values.communicationLoss || undefined,
      };

      if (editingAlarm) {
        await updateCommunicationAlarm(editingAlarm.alarmId, alarmData);
      } else {
        await createCommunicationAlarm(alarmData);
      }
      handleClose();
    },
  });

  useEffect(() => {
    if (editingAlarm) {
      formik.setValues({
        id: editingAlarm.alarmId,
        siteId: editingAlarm.siteId,
        alarmName: editingAlarm.alarmName,
        emails: editingAlarm.emails || '',
        phones: editingAlarm.phones || '',
        method: editingAlarm.method,
        communicationLoss: {
          severity: editingAlarm.severity || Severity.Critical,
          numHours: editingAlarm.numHours || 1,
        },
      });
    } else {
      formik.resetForm();
    }
  }, [editingAlarm, open]); // Added 'open' to dependency array for reset on new alarm

  if (alarmsLoading || sitesLoading) {
    return <div>Loading communication alarms and sites...</div>;
  }

  if (sitesError) {
    return <div>Error loading sites: {sitesError}</div>;
  }

  return (
    <div>
      <h2>Communication Loss Alarm Configuration</h2>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add New Alarm
      </Button>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Alarm Name</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Emails</TableCell>
              <TableCell>Phones</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {communicationAlarms.map((alarm) => (
              <TableRow key={alarm.alarmId}>
                <TableCell>{alarm.alarmName}</TableCell>
                <TableCell>{alarm.siteName}</TableCell>
                <TableCell>{Severity[alarm.severity || Severity.Critical]}</TableCell>
                <TableCell>{alarm.numHours}</TableCell>
                <TableCell>{alarm.emails}</TableCell>
                <TableCell>{alarm.phones}</TableCell>
                <TableCell>{AlarmMethod[alarm.method]}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary" onClick={() => handleOpen(alarm)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingAlarm ? 'Edit Communication Alarm' : 'Add New Communication Alarm'}</DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Alarm Name"
              name="alarmName"
              value={formik.values.alarmName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.alarmName && Boolean(formik.errors.alarmName)}
              helperText={formik.touched.alarmName && formik.errors.alarmName}
            />
            {/* SiteId selection - needs to be populated from an API call usually */}
            <FormControl fullWidth margin="normal" error={formik.touched.siteId && Boolean(formik.errors.siteId)}>
              <InputLabel>Site</InputLabel>
              <Select
                name="siteId"
                value={formik.values.siteId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Site"
              >
                <MenuItem value={0}>
                  <em>None</em>
                </MenuItem>
                {sites.map((site) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.siteId && formik.errors.siteId && (
                <p style={{ color: 'red', fontSize: '0.75rem', margin: '3px 14px 0' }}>
                  {formik.errors.siteId}
                </p>
              )}
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Emails (comma separated)"
              name="emails"
              value={formik.values.emails || ''}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.emails && Boolean(formik.errors.emails)}
              helperText={formik.touched.emails && formik.errors.emails}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phones (comma separated)"
              name="phones"
              value={formik.values.phones || ''}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.phones && Boolean(formik.errors.phones)}
              helperText={formik.touched.phones && formik.errors.phones}
            />
            <FormControl fullWidth margin="normal" error={formik.touched.method && Boolean(formik.errors.method)}>
              <InputLabel>Notification Method</InputLabel>
              <Select
                name="method"
                value={formik.values.method}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Notification Method"
              >
                <MenuItem value={AlarmMethod.Email}>Email</MenuItem>
                <MenuItem value={AlarmMethod.SMS}>SMS</MenuItem>
                <MenuItem value={AlarmMethod.Both}>Both</MenuItem>
              </Select>
              {formik.touched.method && formik.errors.method && (
                <p style={{ color: 'red', fontSize: '0.75rem', margin: '3px 14px 0' }}>
                  {formik.errors.method}
                </p>
              )}
            </FormControl>

            <h3>Communication Loss Details</h3>
            <FormControl fullWidth margin="normal" error={formik.touched.communicationLoss?.severity && Boolean(formik.errors.communicationLoss?.severity)}>
              <InputLabel>Severity</InputLabel>
              <Select
                name="communicationLoss.severity"
                value={formik.values.communicationLoss?.severity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Severity"
              >
                <MenuItem value={Severity.Critical}>Critical</MenuItem>
                <MenuItem value={Severity.Major}>Major</MenuItem>
                <MenuItem value={Severity.Minor}>Minor</MenuItem>
                <MenuItem value={Severity.Warning}>Warning</MenuItem>
              </Select>
              {formik.touched.communicationLoss?.severity && formik.errors.communicationLoss?.severity && (
                <p style={{ color: 'red', fontSize: '0.75rem', margin: '3px 14px 0' }}>
                  {formik.errors.communicationLoss.severity}
                </p>
              )}
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Number of Hours"
              name="communicationLoss.numHours"
              type="number"
              value={formik.values.communicationLoss?.numHours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.communicationLoss?.numHours && Boolean(formik.errors.communicationLoss?.numHours)}
              helperText={formik.touched.communicationLoss?.numHours && formik.errors.communicationLoss?.numHours}
            />
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {editingAlarm ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationAlarmConfig;
