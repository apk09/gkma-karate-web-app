import React, { useRef, useState, useLayoutEffect } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';
import FilterBar from './FilterBar';

import ParticipantsTable from './ParticipantsTable';
import PoolGenerator from './PoolGenerator';



function KaratePortal({ onLogout }) {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };
  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    onLogout();
  };
  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };
  const textRef = useRef();
  const [underlineWidth, setUnderlineWidth] = useState(0);

  useLayoutEffect(() => {
    if (textRef.current) {
      setUnderlineWidth(textRef.current.offsetWidth);
    }
  }, []);
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [beltFilter, setBeltFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rowsPerPage = 10;
  const handleStartOver = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    setRows([]);
    setColumns([]);
    setFileName('');
    setPage(0);
    setConfirmOpen(false);
  };

  const handleCancelClear = () => {
    setConfirmOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length > 0) {
          setColumns(json[0]);
          setRows(json.slice(1));
          setFilteredRows(json.slice(1));
          setPage(0);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Filtering logic: apply all filters reactively
  React.useEffect(() => {
    let filtered = [...rows];
    // Gender
    const genderColIdx = columns.findIndex(col => col.toLowerCase().includes('gender'));
    if (genderColIdx !== -1 && genderFilter !== 'All') {
      filtered = filtered.filter(row => {
        const val = (row[genderColIdx] || '').toString().trim().toUpperCase();
        if (genderFilter === 'Male') return val === 'M';
        if (genderFilter === 'Female') return val === 'F';
        return true;
      });
    }
    // Age Group
    const ageColIdx = columns.findIndex(col => col.toLowerCase().includes('age'));
    if (ageColIdx !== -1 && ageGroupFilter !== 'All') {
      if (ageGroupFilter === 'Under 6 years') {
        filtered = filtered.filter(row => {
          const age = parseInt(row[ageColIdx], 10);
          return !isNaN(age) && age < 6;
        });
      } else if (ageGroupFilter === 'Under 16 years') {
        filtered = filtered.filter(row => {
          const age = parseInt(row[ageColIdx], 10);
          return !isNaN(age) && (age === 14 || age === 15);
        });
      } else if (ageGroupFilter === 'Under 18 years') {
        filtered = filtered.filter(row => {
          const age = parseInt(row[ageColIdx], 10);
          return !isNaN(age) && (age === 16 || age === 17);
        });
      } else if (ageGroupFilter === 'Under 21 years') {
        filtered = filtered.filter(row => {
          const age = parseInt(row[ageColIdx], 10);
          return !isNaN(age) && (age === 18 || age === 19 || age === 20);
        });
      } else if (ageGroupFilter === 'Seniors') {
        filtered = filtered.filter(row => {
          const age = parseInt(row[ageColIdx], 10);
          return !isNaN(age) && age >= 21;
        });
      } else if (/^\d+ years$/.test(ageGroupFilter)) {
        const match = ageGroupFilter.match(/^(\d+) years$/);
        if (match) {
          const targetAge = parseInt(match[1], 10);
          filtered = filtered.filter(row => {
            const age = parseInt(row[ageColIdx], 10);
            return !isNaN(age) && age === targetAge;
          });
        }
      } else {
        // fallback to string match
        filtered = filtered.filter(row => (row[ageColIdx] || '').toString().trim() === ageGroupFilter);
      }
    }
    // Weight
    const weightColIdx = columns.findIndex(col => col.toLowerCase().includes('weight'));
    let minW = '';
    let maxW = '';
    if (minWeight !== '' && !isNaN(parseFloat(minWeight)) && parseFloat(minWeight) > 0) {
      minW = parseFloat(minWeight);
    }
    if (maxWeight !== '' && !isNaN(parseFloat(maxWeight)) && parseFloat(maxWeight) > 0) {
      maxW = parseFloat(maxWeight);
    }
    if (weightColIdx !== -1 && (minW !== '' || maxW !== '')) {
      filtered = filtered.filter(row => {
        const val = parseFloat(row[weightColIdx]);
        if (isNaN(val) || val <= 0) return false;
        if (minW !== '' && maxW !== '') {
          return val >= minW && val <= maxW;
        } else if (minW !== '') {
          return val >= minW;
        } else if (maxW !== '') {
          return val <= maxW;
        }
        return true;
      });
    }
    // Belt Level
    const beltColIdx = columns.findIndex(col => col.toLowerCase().includes('belt'));
    if (beltColIdx !== -1 && beltFilter !== 'All') {
      const beginnerBelts = ['white', 'yellow', 'orange'];
      const advancedBelts = ['brown', 'black'];
      const intermediateBelts = ['green', 'blue', 'purple', 'maroon', 'red'];
      filtered = filtered.filter(row => {
        const belt = (row[beltColIdx] || '').toString().trim().toLowerCase();
        if (beltFilter === 'Beginner') {
          return beginnerBelts.includes(belt);
        } else if (beltFilter === 'Advanced') {
          return advancedBelts.includes(belt);
        } else if (beltFilter === 'Intermediate') {
          // If not beginner or advanced, treat as intermediate
          return intermediateBelts.includes(belt) || (!beginnerBelts.includes(belt) && !advancedBelts.includes(belt));
        }
        return true;
      });
    }
    setFilteredRows(filtered);
    setPage(0);
  }, [rows, columns, genderFilter, ageGroupFilter, minWeight, maxWeight, beltFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #232526 0%, #414345 100%)',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: { xs: '100%', sm: '80%', md: '80%', lg: '80%', xl: '80%' },
          maxWidth: 'none',
          mx: 'auto',
          p: { xs: 3, sm: 6 },
          borderRadius: 5,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          background: 'rgba(255,255,255,0.95)',
          zIndex: 1,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Paper elevation={2} sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          px: { xs: 2, sm: 4 },
          py: 2,
          borderRadius: 3,
          boxShadow: '0 2px 12px 0 rgba(33,150,243,0.07)',
          background: '#f8fafc',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ display: 'inline-block', position: 'relative' }}>
              <Typography
                ref={textRef}
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: '#222',
                  fontFamily: 'Oswald, Arial, sans-serif',
                  mb: 0.5,
                  display: 'inline-block',
                }}
              >
                GKMA Karate
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  bottom: -4,
                  height: 3,
                  width: underlineWidth,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  borderRadius: 2,
                  mb: 0.5,
                  transition: 'width 0.2s',
                }}
              />
            </span>
          </Box>
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogoutClick}
              sx={{
                color: '#1976d2',
                background: 'rgba(25, 118, 210, 0.07)',
                borderRadius: 2,
                ml: 2,
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.15)',
                  color: '#0d47a1',
                },
                transition: 'all 0.2s',
              }}
              size="large"
            >
              <LogoutIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to logout?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLogoutCancel} color="primary">
                Cancel
              </Button>
              <Button onClick={handleLogoutConfirm} color="error" variant="contained">
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
        {/* Removed subtitle text as requested */}


        {/* Excel Upload Section (hidden after upload) */}
        {rows.length === 0 && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Upload Participants Excel Sheet
            </Typography>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              sx={{ mb: 1 }}
            >
              Choose File
            </Button>
            <Typography variant="body2" sx={{ color: '#666', minHeight: 24 }}>
              {fileName ? fileName : 'No file selected'}
            </Typography>
          </Box>
        )}

        {/* Filter + Paginated Table Section */}
        {rows.length > 0 && columns.length > 0 && (
          <>
            {/* New Upload Button (above filters) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={handleStartOver}
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  borderRadius: 999,
                  px: 4,
                  py: 1.2,
                  borderWidth: 2,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.10)',
                  background: '#f5faff',
                  '&:hover': {
                    background: '#e3f2fd',
                    borderColor: '#1976d2',
                  },
                }}
              >
                New Upload
              </Button>
            </Box>
            <Paper elevation={1} sx={{ mb: 3, px: { xs: 2, sm: 4 }, py: 2, borderRadius: 3, background: '#f8fafc', boxShadow: '0 1px 6px 0 rgba(33,150,243,0.04)' }}>
              <FilterBar
                genderFilter={genderFilter}
                setGenderFilter={setGenderFilter}
                ageGroupFilter={ageGroupFilter}
                setAgeGroupFilter={setAgeGroupFilter}
                minWeight={minWeight}
                setMinWeight={setMinWeight}
                maxWeight={maxWeight}
                setMaxWeight={setMaxWeight}
                beltFilter={beltFilter}
                setBeltFilter={setBeltFilter}
                onClearFilters={() => {
                  setGenderFilter('All');
                  setAgeGroupFilter('All');
                  setMinWeight('');
                  setMaxWeight('');
                  setBeltFilter('All');
                }}
              />
            </Paper>
            <Box sx={{ mb: 4 }}>
              <ParticipantsTable
                columns={columns}
                filteredRows={filteredRows}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
              />
              {/* PoolGenerator below the table, only if all required filters except belt are applied */}
              {(genderFilter !== 'All' && ageGroupFilter !== 'All' && minWeight !== '' && maxWeight !== '') && (
                <PoolGenerator
                  filteredRows={filteredRows}
                  columns={columns}
                  resetKey={genderFilter + '-' + ageGroupFilter + '-' + minWeight + '-' + maxWeight + '-' + beltFilter}
                />
              )}
              <Dialog open={confirmOpen} onClose={handleCancelClear}>
                <DialogTitle>Confirm Clear</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to clear the current table and upload a new file? This will remove all current data.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCancelClear} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmClear} color="error" variant="contained">
                    Clear & New Upload
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default KaratePortal;
