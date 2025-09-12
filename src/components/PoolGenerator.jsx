import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';

function shuffleArray(array) {
  // Fisher-Yates shuffle
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function splitIntoPools(players, poolSize) {
  // Custom logic for edge cases
  const pools = [];
  let remaining = [...players];
  if (poolSize === 4) {
    // Improved logic for 1-12 players and then fallback to generic for larger
    while (remaining.length > 0) {
      const n = remaining.length;
      if (n === 6) {
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 3));
      } else if (n === 5) {
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 2));
      } else if (n === 7) {
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 3));
      } else if (n === 8) {
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 4));
      } else if (n === 9) {
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 3));
      } else if (n === 10) {
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 3));
      } else if (n === 11) {
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 3));
      } else if (n === 12) {
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 4));
      } else if (n === 13) {
        pools.push(remaining.splice(0, 4));
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 3));
        pools.push(remaining.splice(0, 3));
      } else if (n >= 4) {
        pools.push(remaining.splice(0, 4));
      } else {
        pools.push(remaining.splice(0, remaining.length));
      }
    }
  } else if (poolSize === 8) {
    // Improved splits for 8-pools as per user request
    const n = remaining.length;
    if (n === 9) {
      pools.push(remaining.splice(0, 5));
      pools.push(remaining.splice(0, 4));
    } else if (n === 10) {
      pools.push(remaining.splice(0, 5));
      pools.push(remaining.splice(0, 5));
    } else if (n === 11) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 5));
    } else if (n === 12) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
    } else if (n === 13) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 6));
    } else if (n === 14) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
    } else if (n === 17) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 5));
    } else if (n === 18) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
    } else if (n === 19) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
    } else if (n === 20) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 6));
    } else if (n === 21) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 5));
      pools.push(remaining.splice(0, 5));
      pools.push(remaining.splice(0, 5));
    } else if (n === 22) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 5));
      pools.push(remaining.splice(0, 5));
    } else if (n === 23) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 5));
    } else if (n === 24) {
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
    } else if (n === 25) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
    } else if (n === 26) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 6));
      pools.push(remaining.splice(0, 6));
    } else if (n === 27) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 6));
    } else if (n === 28) {
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
      pools.push(remaining.splice(0, 7));
    } else {
      while (remaining.length > 0) {
        if (remaining.length >= 8) {
          pools.push(remaining.splice(0, 8));
        } else {
          pools.push(remaining.splice(0, remaining.length));
        }
      }
    }
  }
  return pools;
}


const PoolGenerator = ({ filteredRows, columns, resetKey }) => {
  const [pools, setPools] = useState([]);
  const [showButtons, setShowButtons] = useState(true);
  const [poolType, setPoolType] = useState(null); // 4 or 8

  // Reset pools and showButtons when any filter changes
  React.useEffect(() => {
    setPools([]);
    setShowButtons(true);
    setPoolType(null);
  }, [resetKey]);

  const handleGenerate = (type) => {
    if (!filteredRows || filteredRows.length === 0) return;
    const shuffled = shuffleArray(filteredRows);
    const newPools = splitIntoPools(shuffled, type);
    setPools(newPools);
    setShowButtons(false);
    setPoolType(type);
  };

  const handleRegenerate = () => {
    if (!filteredRows || filteredRows.length === 0 || !poolType) return;
    const shuffled = shuffleArray(filteredRows);
    const newPools = splitIntoPools(shuffled, poolType);
    setPools(newPools);
  };


  // Define the preferred order and display names for columns
  const columnMap = [
    { keys: ['name', 'player name', 'full name', 'participant name'], label: 'Name' },
    { keys: ['gender'], label: 'Gender' },
    { keys: ['age', 'age (in yrs)', 'age (years)', 'age(years)', 'age(year)', 'age yrs', 'age in years'], label: 'Age (in yrs)' },
    { keys: ['weight', 'weight (in kg)', 'weight (kg)', 'weight(kg)', 'weight in kg'], label: 'Weight (in kg)' },
    { keys: ['belt', 'belt level'], label: 'Belt' },
    { keys: ['dojo', 'instructor', 'instructors', 'dojo / instructors name', 'dojo/instructors name', 'dojo/instructor', 'dojo / instructor'], label: 'Dojo / Instructors Name' },
  ];
  const lowerColumns = columns.map(c => c.toString().toLowerCase().trim());
  // For each preferred column, find the first matching index in the actual columns
  const selectedIndexes = [];
  const selectedColumns = [];
  columnMap.forEach(colObj => {
    for (let key of colObj.keys) {
      const idx = lowerColumns.indexOf(key);
      if (idx !== -1) {
        selectedIndexes.push(idx);
        selectedColumns.push(colObj.label);
        break;
      }
    }
  });

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      {showButtons && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<span style={{fontWeight:700, fontSize:'1.2em'}}>4️⃣</span>}
            sx={{
              fontWeight: 700,
              fontSize: '1.08rem',
              borderRadius: 999,
              px: 4,
              py: 1.2,
              border: '2px solid #1976d2',
              background: 'rgba(25, 118, 210, 0.07)',
              textTransform: 'none',
              boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.10)',
              transition: 'transform 0.15s',
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.15)',
                borderColor: '#1565c0',
                transform: 'scale(1.05)',
              },
            }}
            onClick={() => handleGenerate(4)}
          >
            Generate Pools
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            endIcon={<span style={{fontWeight:700, fontSize:'1.2em'}}>8️⃣</span>}
            sx={{
              fontWeight: 700,
              fontSize: '1.08rem',
              borderRadius: 999,
              px: 4,
              py: 1.2,
              border: '2px solid #9c27b0',
              background: 'rgba(156, 39, 176, 0.07)',
              textTransform: 'none',
              boxShadow: '0 2px 8px 0 rgba(156, 39, 176, 0.10)',
              transition: 'transform 0.15s',
              '&:hover': {
                background: 'rgba(156, 39, 176, 0.15)',
                borderColor: '#7b1fa2',
                transform: 'scale(1.05)',
              },
            }}
            onClick={() => handleGenerate(8)}
          >
            Generate Pools
          </Button>
        </Box>
      )}
      {pools.length > 0 && (
        <Box>
          <Button
            variant="contained"
            color="info"
            onClick={handleRegenerate}
            sx={{ mb: 3, borderRadius: 999, fontWeight: 700, textTransform: 'none' }}
          >
            Regenerate Pools
          </Button>
          {pools.map((pool, idx) => (
            <Paper key={idx} elevation={3} sx={{ mb: 2, p: 2, borderRadius: 3, background: '#f3f6fa' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Pool {idx + 1} ({pool.length} players)
              </Typography>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #bdbdbd' }}>
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" sx={{ textAlign: 'left', fontWeight: 600, pr: 2, pb: 1, color: '#1976d2', border: '1px solid #bdbdbd', background: '#e3eaf4' }}>Position</Box>
                    {selectedColumns.map((col, i) => (
                      <Box component="th" key={i} sx={{ textAlign: 'left', fontWeight: 600, pr: 2, pb: 1, color: '#1976d2', border: '1px solid #bdbdbd', background: '#e3eaf4' }}>{col}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {pool.map((row, i) => (
                    <Box component="tr" key={i}>
                      <Box component="td" sx={{ pr: 2, py: 0.5, border: '1px solid #bdbdbd', textAlign: 'left', fontWeight: 600, color: '#1976d2', background: '#f3f6fa' }}>{i + 1}</Box>
                      {selectedIndexes.map((colIdx, j) => (
                        <Box component="td" key={j} sx={{ pr: 2, py: 0.5, border: '1px solid #bdbdbd', textAlign: 'left' }}>{row[colIdx]}</Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PoolGenerator;