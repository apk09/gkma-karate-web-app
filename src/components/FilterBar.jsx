import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Typography } from '@mui/material';

const FilterBar = ({
  genderFilter, setGenderFilter,
  ageGroupFilter, setAgeGroupFilter,
  minWeight, setMinWeight,
  maxWeight, setMaxWeight,
  beltFilter, setBeltFilter,
  onClearFilters
}) => (
  <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 3, alignItems: 'center', justifyContent: 'space-between' }}>
    {/* Gender Filter */}
    <FormControl sx={{ minWidth: 120 }} size="small">
      <InputLabel id="gender-label">Gender</InputLabel>
      <Select
        labelId="gender-label"
        label="Gender"
        value={genderFilter}
        onChange={e => {
          setGenderFilter(e.target.value);
          setAgeGroupFilter('All');
          setMinWeight('');
          setMaxWeight('');
          setBeltFilter('All');
        }}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
      </Select>
    </FormControl>
    {/* Age Group Filter */}
    <FormControl sx={{ minWidth: 160 }} size="small" disabled={genderFilter === 'All'}>
      <InputLabel id="age-group-label">Age Group</InputLabel>
      <Select
        labelId="age-group-label"
        label="Age Group"
        value={ageGroupFilter}
        onChange={e => {
          setAgeGroupFilter(e.target.value);
          setMinWeight('');
          setMaxWeight('');
          setBeltFilter('All');
        }}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Under 6 years">Under 6 years</MenuItem>
        <MenuItem value="6 years">6 years</MenuItem>
        <MenuItem value="7 years">7 years</MenuItem>
        <MenuItem value="8 years">8 years</MenuItem>
        <MenuItem value="9 years">9 years</MenuItem>
        <MenuItem value="10 years">10 years</MenuItem>
        <MenuItem value="11 years">11 years</MenuItem>
        <MenuItem value="12 years">12 years</MenuItem>
        <MenuItem value="13 years">13 years</MenuItem>
        <MenuItem value="Under 16 years">Under 16 years</MenuItem>
        <MenuItem value="Under 18 years">Under 18 years</MenuItem>
        <MenuItem value="Under 21 years">Under 21 years</MenuItem>
        <MenuItem value="Seniors">Seniors</MenuItem>
      </Select>
    </FormControl>
    {/* Weight Filter */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        label="Min Weight"
        size="small"
        type="number"
        sx={{ width: 140 }}
        value={minWeight}
        onChange={e => {
          const val = e.target.value;
          if (val === '' || Number(val) >= 0) {
            setMinWeight(val);
            setBeltFilter('All');
          }
        }}
        disabled={ageGroupFilter === 'All'}
      />
      <Typography sx={{ mx: 1, color: '#888' }}>to</Typography>
      <TextField
        label="Max Weight"
        size="small"
        type="number"
        sx={{ width: 140 }}
        value={maxWeight}
        onChange={e => {
          const val = e.target.value;
          if (val === '' || Number(val) >= 0) {
            setMaxWeight(val);
            setBeltFilter('All');
          }
        }}
        disabled={ageGroupFilter === 'All'}
      />
    </Box>
  {/* Belt Level Filter */}
  <FormControl sx={{ minWidth: 140 }} size="small">
      <InputLabel id="belt-label">Belt Level</InputLabel>
      <Select
        labelId="belt-label"
        label="Belt Level"
        value={beltFilter}
        onChange={e => setBeltFilter(e.target.value)}
      >
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Beginner">Beginner</MenuItem>
        <MenuItem value="Intermediate">Intermediate</MenuItem>
        <MenuItem value="Advanced">Advanced</MenuItem>
      </Select>
    </FormControl>
    {/* Buttons */}
    <Box sx={{ display: 'flex', gap: 1, mt: 0 }}>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ fontWeight: 600, px: 2, minWidth: 90 }}
        onClick={onClearFilters}
      >
        Clear Filters
      </Button>
    </Box>
  </Box>
);

export default FilterBar;
