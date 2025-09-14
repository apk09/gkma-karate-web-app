import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Box, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoopIcon from '@mui/icons-material/Loop';

// Fisher-Yates shuffle
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate pools of 8 logic
function generatePoolsOf8(players) {
  // Step 1: Split into main pools (A, B, ...) as evenly as possible, each <= 16
  // (since each main pool can be split into two sub-pools of up to 8)
  const mainPools = splitEvenly(players, 16);
  // Step 2: For each main pool, if >8 players, split into 2 sub-pools, else just one sub-pool
  return mainPools.map((poolPlayers, idx) => {
    let subPools;
    if (poolPlayers.length > 8) {
      const split = splitIntoParts(poolPlayers, 2);
      subPools = [
        { name: String.fromCharCode(65 + idx) + '1', players: split[0] },
        { name: String.fromCharCode(65 + idx) + '2', players: split[1] },
      ];
    } else {
      subPools = [
        { name: String.fromCharCode(65 + idx) + '1', players: poolPlayers }
      ];
    }
    return {
      name: String.fromCharCode(65 + idx),
      subPools,
    };
  });
}



// Belt/Rank mapping logic (same as ParticipantsTable)
function mapBeltRank(cellValue) {
  let mapped = '';
  if (typeof cellValue === 'string') {
    const val = cellValue.trim().toLowerCase();
    if (val.endsWith('.kyu')) {
      if (val.startsWith('10')) mapped = 'White';
      else if (val.startsWith('9')) mapped = 'Yellow';
      else if (val.startsWith('8')) mapped = 'Orange';
      else if (val.startsWith('7')) mapped = 'Green';
      else if (val.startsWith('6')) mapped = 'Blue';
      else if (val.startsWith('5')) mapped = 'Purple';
      else if (val.startsWith('4') || val.startsWith('3') || val.startsWith('2') || val.startsWith('1')) mapped = 'Brown';
    } else if (val.endsWith('.dan')) {
      mapped = 'Black';
    } else {
      // Try to parse as number
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        if (num === -10) mapped = 'White';
        else if (num === -9) mapped = 'Yellow';
        else if (num === -8) mapped = 'Orange';
        else if (num === -7) mapped = 'Green';
        else if (num === -6) mapped = 'Blue';
        else if (num === -5) mapped = 'Purple';
        else if ([-4,-3,-2,-1].includes(num)) mapped = 'Brown';
        else if ([1,2,3,4,5].includes(num)) mapped = 'Black';
      }
    }
  } else if (typeof cellValue === 'number') {
    const num = cellValue;
    if (num === -10) mapped = 'White';
    else if (num === -9) mapped = 'Yellow';
    else if (num === -8) mapped = 'Orange';
    else if (num === -7) mapped = 'Green';
    else if (num === -6) mapped = 'Blue';
    else if (num === -5) mapped = 'Purple';
    else if ([-4,-3,-2,-1].includes(num)) mapped = 'Brown';
    else if ([1,2,3,4,5].includes(num)) mapped = 'Black';
  }
  return mapped || cellValue;
}

// Helper to split an array into n nearly equal parts
function splitIntoParts(arr, n) {
  const len = arr.length;
  const out = [];
  let i = 0;
  for (let part = 0; part < n; ++part) {
    const size = Math.floor((len - i) / (n - part));
    out.push(arr.slice(i, i + size));
    i += size;
  }
  return out;
}

// Main pool generation logic for "4" button
function splitEvenly(arr, maxPerGroup) {
  // Split arr into as few groups as possible, each <= maxPerGroup, and as even as possible
  const n = arr.length;
  const numGroups = Math.ceil(n / maxPerGroup);
  const baseSize = Math.floor(n / numGroups);
  const remainder = n % numGroups;
  const groups = [];
  let i = 0;
  for (let g = 0; g < numGroups; ++g) {
    const size = baseSize + (g < remainder ? 1 : 0);
    groups.push(arr.slice(i, i + size));
    i += size;
  }
  return groups;
}

function generatePoolsOf4(players) {
  // Step 1: Split into main pools (A, B, ...) as evenly as possible, each <= 8
  const mainPools = splitEvenly(players, 8);
  // Step 2: For each main pool, if >4 players, split into 2 sub-pools, else just one sub-pool
  return mainPools.map((poolPlayers, idx) => {
    let subPools;
    if (poolPlayers.length > 4) {
      const split = splitIntoParts(poolPlayers, 2);
      subPools = [
        { name: String.fromCharCode(65 + idx) + '1', players: split[0] },
        { name: String.fromCharCode(65 + idx) + '2', players: split[1] },
      ];
    } else {
      subPools = [
        { name: String.fromCharCode(65 + idx) + '1', players: poolPlayers }
      ];
    }
    return {
      name: String.fromCharCode(65 + idx),
      subPools,
    };
  });
}



const PoolGenerator = ({ filteredRows = [], columns = [] }) => {

  const [pools, setPools] = useState([]);
  const [lastPoolType, setLastPoolType] = useState(null); // '4' or '8'
  const [pdfDialog, setPdfDialog] = useState({ open: false, src: '', title: '' });
  const pdfBlobUrl = useRef('');

  // Reset pools when filteredRows or columns change
  React.useEffect(() => {
    setPools([]);
  }, [filteredRows, columns]);


  // Find indices for all required columns
  function findColIdx(keys) {
    return columns.findIndex(col => keys.some(k => col.toString().toLowerCase().includes(k)));
  }
  const nameColIdx = findColIdx(['name', 'player name', 'full name', 'participant name']);
  const genderColIdx = findColIdx(['gender']);
  const ageColIdx = findColIdx(['age']);
  const weightColIdx = findColIdx(['weight']);
  const beltColIdx = findColIdx(['belt', 'rank']);
  const dojoColIdx = findColIdx(['dojo', 'instructor', 'school']);

  // Extract player objects from filteredRows, use unique id (row index)
  const playerObjs = nameColIdx !== -1
    ? filteredRows.map((row, i) => ({
        id: i,
        position: i + 1,
        name: row[nameColIdx] || '',
        gender: genderColIdx !== -1 ? row[genderColIdx] || '' : '',
        age: ageColIdx !== -1 ? row[ageColIdx] || '' : '',
        weight: weightColIdx !== -1 ? row[weightColIdx] || '' : '',
        belt: beltColIdx !== -1 ? row[beltColIdx] || '' : '',
        dojo: dojoColIdx !== -1 ? row[dojoColIdx] || '' : '',
      }))
    : [];
  // Use id for mapping, not just name



  // When generating pools, keep the full player object for each player

  const handleGenerate4 = () => {
    const poolsRaw = generatePoolsOf4(playerObjs);
    setPools(poolsRaw);
    setLastPoolType('4');
  };

  const handleGenerate8 = () => {
    const poolsRaw = generatePoolsOf8(playerObjs);
    setPools(poolsRaw);
    setLastPoolType('8');
  };

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" gap={3} my={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            borderRadius: 999,
            px: 2.5,
            py: 0.7,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 2,
            letterSpacing: 1,
            fontSize: '1rem',
            minWidth: 110,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'scale(1.05)' },
          }}
          endIcon={<span style={{fontSize:'1.3em',fontWeight:800,marginLeft:4}} role="img" aria-label="4">4️⃣</span>}
          onClick={handleGenerate4}
          disabled={playerObjs.length === 0}
        >
          Generate Pool
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            borderRadius: 999,
            px: 2.5,
            py: 0.7,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 2,
            letterSpacing: 1,
            fontSize: '1rem',
            minWidth: 110,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'scale(1.05)' },
          }}
          endIcon={<span style={{fontSize:'1.3em',fontWeight:800,marginLeft:4}} role="img" aria-label="8">8️⃣</span>}
          onClick={handleGenerate8}
          disabled={playerObjs.length === 0}
        >
          Generate Pool
        </Button>
        {pools.length > 0 && (
          <Button
            variant="outlined"
            color="primary"
            size="large"
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0.7,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 1,
              letterSpacing: 1,
              fontSize: '1rem',
              minWidth: 110,
              transition: 'transform 0.15s',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { transform: 'scale(1.05)', background: '#e3eaf4' },
            }}
            startIcon={<LoopIcon fontSize="small" />}
            onClick={() => {
              // Shuffle all players and regenerate pools with the current pool type
              if (!lastPoolType) return;
              const shuffled = shuffleArray(playerObjs);
              if (lastPoolType === '4') {
                setPools(generatePoolsOf4(shuffled));
              } else if (lastPoolType === '8') {
                setPools(generatePoolsOf8(shuffled));
              }
            }}
          >
            Shuffle Pool
          </Button>
        )}
      </Box>
      {/* Render pools if any, with styled tables */}
      {pools.length > 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          {pools.flatMap((pool) =>
            pool.subPools.map((sub) => (
              <Paper key={sub.name} elevation={3} sx={{ p: 3, borderRadius: 4, minWidth: 700, maxWidth: 1200, width: '100%', bgcolor: '#f3f6fa', mb: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', letterSpacing: 0.5 }}>
                    Pool {sub.name} - ({sub.players.length} {sub.players.length === 1 ? 'player' : 'players'})
                  </Typography>
                  <IconButton
                    aria-label="Shuffle Sub-Pool"
                    size="small"
                    sx={{ ml: 1, color: '#1976d2', background: '#e3eaf4', '&:hover': { background: '#d0e2fa' } }}
                    onClick={() => {
                      setPools(prevPools => prevPools.map(poolObj => {
                        if (poolObj.name !== pool.name) return poolObj;
                        return {
                          ...poolObj,
                          subPools: poolObj.subPools.map(subPoolObj => {
                            if (subPoolObj.name !== sub.name) return subPoolObj;
                            return {
                              ...subPoolObj,
                              players: shuffleArray(subPoolObj.players)
                            };
                          })
                        };
                      }));
                    }}
                  >
                    <LoopIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Table size="small" sx={{ background: '#fff', borderRadius: 2, boxShadow: 1, mb: 2, minWidth: 700, border: '2px solid #1976d2', '& .MuiTableCell-root': { border: '1px solid #bbb' } }}>
                  <TableHead>
                    <TableRow sx={{ background: '#e3eaf4' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Belt</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dojo / Instructors</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                        {(() => {
                          // Use lastPoolType to determine which mapping to use
                          const n = sub.players.length;
                          let positions = [];
                          if (lastPoolType === '8') {
                            if (n === 1) positions = [1];
                            else if (n === 2) positions = [1, 8];
                            else if (n === 3) positions = [1, 2, 8];
                            else if (n === 4) positions = [1, 4, 5, 8];
                            else if (n === 5) positions = [1, 2, 4, 5, 8];
                            else if (n === 6) positions = [1, 2, 4, 5, 6, 8];
                            else if (n === 7) positions = [1, 2, 3, 4, 5, 6, 8];
                            else if (n === 8) positions = [1, 2, 3, 4, 5, 6, 7, 8];
                            else positions = Array.from({ length: n }, (_, i) => i + 1);
                          } else {
                            if (n === 1) positions = [1];
                            else if (n === 2) positions = [1, 4];
                            else if (n === 3) positions = [1, 2, 4];
                            else if (n === 4) positions = [1, 2, 3, 4];
                            else positions = Array.from({ length: n }, (_, i) => i + 1);
                          }
                          return sub.players.map((p, idx) => (
                            <TableRow key={p && p.id != null ? p.id : idx}>
                              <TableCell>{positions[idx]}</TableCell>
                              <TableCell>{p && p.name}</TableCell>
                              <TableCell>{p && p.gender}</TableCell>
                              <TableCell>{p && p.age}</TableCell>
                              <TableCell>{p && p.weight}</TableCell>
                              <TableCell>{p && mapBeltRank(p.belt)}</TableCell>
                              <TableCell>{p && p.dojo}</TableCell>
                            </TableRow>
                          ));
                        })()}
                  </TableBody>
                </Table>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium"
                    sx={{
                      borderRadius: 999,
                      px: 2.5,
                      py: 0.7,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 1,
                      letterSpacing: 0.5,
                      fontSize: '1.05rem',
                      transition: 'transform 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': { transform: 'scale(1.05)', background: '#e3eaf4' },
                    }}
                    startIcon={<span style={{fontSize:'1.1em',fontWeight:700}} role="img" aria-label="bout">🥋</span>}
                    onClick={async () => {
                      // Show correct page of hosted PDF in dialog, and write pool names in the middle
                      const hostedPdfUrl = 'https://apk09.github.io/gkma-web-app/assets/bout-sheet.pdf';
                      const isPool4 = lastPoolType === '4';
                      // Declare firstPlayer at the top for use in both header and dialog
                      const firstPlayer = sub.players[0] || {};
                      try {
                        const response = await fetch(hostedPdfUrl);
                        if (!response.ok) throw new Error('PDF not found');
                        const arrayBuffer = await response.arrayBuffer();
                        const srcDoc = await PDFDocument.load(arrayBuffer);
                        const newDoc = await PDFDocument.create();
                        const pageIndex = isPool4 ? 0 : 1; // 0-based: page 1 for pool 4, page 2 for pool 8
                        if (srcDoc.getPageCount() <= pageIndex) throw new Error('Requested page does not exist in PDF');
                        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex]);
                        newDoc.addPage(copiedPage);

                        // Write pool participant names: coordinates are now easy to edit below
                        const page = newDoc.getPage(0);
                        const { width, height } = page.getSize();
                        const nameFont = await newDoc.embedFont(StandardFonts.HelveticaBold);
                        const dojoFont = await newDoc.embedFont(StandardFonts.HelveticaOblique);
                        // Font sizes and colors for pool of 4 and 8
                        const fontSize4 = 16;
                        const dojoFontSize4 = fontSize4 * 0.8;
                        const fontSize8 = 13;
                        const dojoFontSize8 = fontSize8 * 0.8;
                        const dojoColor4 = rgb(0.35, 0.35, 0.35); // gray
                        const dojoColor8 = rgb(0.5, 0.5, 0.5); // lighter gray
                        const redColor = rgb(0.85, 0.13, 0.13); // strong red
                        const blueColor = rgb(0.18, 0.32, 0.55); // blue
                        // Draw header at the top: Gender Age Weight Kumite
                        console.log(firstPlayer)
                        let headerGender = (firstPlayer.gender || '').toString().trim();
                        if (headerGender) headerGender = headerGender.charAt(0).toUpperCase() + headerGender.slice(1).toLowerCase();
                        let headerAge = (firstPlayer.age || '').toString().trim();
                        if (headerAge && !headerAge.toLowerCase().includes('year')) headerAge += ' years';
                        //let headerWeight = (firstPlayer.weight || '').toString().trim();
                        //if (headerWeight && !headerWeight.toLowerCase().includes('kg')) headerWeight += 'kg';
                        let headerText = `${headerGender} ${headerAge}`;
                        //if (headerWeight) headerText += ` ${headerWeight}`;
                        headerText += ' Kumite';
                        // Draw header centered at the top
                        page.drawText(headerText, {
                          x: width * 0.465 - (nameFont.widthOfTextAtSize(headerText, 18) / 2),
                          y: height - 50,
                          size: 16,
                          font: nameFont,
                          color: rgb(0.1, 0.1, 0.1),
                        });

                        // Draw names and dojo/instructors at positions based on the position mapping
                        // Get the position mapping logic from the table rendering
                        const n = sub.players.length;
                        let positions = [];
                        if (lastPoolType === '8') {
                          if (n === 1) positions = [1];
                          else if (n === 2) positions = [1, 8];
                          else if (n === 3) positions = [1, 2, 8];
                          else if (n === 4) positions = [1, 4, 5, 8];
                          else if (n === 5) positions = [1, 2, 4, 5, 8];
                          else if (n === 6) positions = [1, 2, 4, 5, 6, 8];
                          else if (n === 7) positions = [1, 2, 3, 4, 5, 6, 8];
                          else if (n === 8) positions = [1, 2, 3, 4, 5, 6, 7, 8];
                          else positions = Array.from({ length: n }, (_, i) => i + 1);
                        } else {
                          if (n === 1) positions = [1];
                          else if (n === 2) positions = [1, 4];
                          else if (n === 3) positions = [1, 2, 4];
                          else if (n === 4) positions = [1, 2, 3, 4];
                          else positions = Array.from({ length: n }, (_, i) => i + 1);
                        }
                        // Map position to player (by index)
                        const positionToPlayer = {};
                        positions.forEach((pos, idx) => {
                          positionToPlayer[pos] = sub.players[idx];
                        });
                        // (lineHeight not used)
                        // --- HARDCODED COORDINATES FOR NAMES ---
                        // For pool of 4 (positions 1-4)
                        const HARDCODED_POOL4 = [
                          { x: width * 0.12, y: height * 0.735 }, // Position 1
                          { x: width * 0.12, y: height * 0.59 }, // Position 2
                          { x: width * 0.12, y: height * 0.42 }, // Position 3
                          { x: width * 0.12, y: height * 0.28 }, // Position 4
                        ];
                        // For pool of 8 (positions 1-8)
                        const HARDCODED_POOL8 = [
                          { x: width * 0.10, y: height * 0.76 }, // Position 1
                          { x: width * 0.10, y: height * 0.683 }, // Position 2
                          { x: width * 0.10, y: height * 0.59 }, // Position 3
                          { x: width * 0.10, y: height * 0.515 }, // Position 4
                          { x: width * 0.10, y: height * 0.43 }, // Position 5
                          { x: width * 0.10, y: height * 0.35 }, // Position 6
                          { x: width * 0.10, y: height * 0.25 }, // Position 7
                          { x: width * 0.10, y: height * 0.175 }, // Position 8
                        ];
                        const hardcodedCoords = isPool4 ? HARDCODED_POOL4 : HARDCODED_POOL8;
                        // For each possible position, draw the player if present
                        const maxPositions = isPool4 ? 4 : 8;
                        for (let pos = 1; pos <= maxPositions; pos++) {
                          const coord = hardcodedCoords[pos - 1];
                          const player = positionToPlayer[pos];
                          if (!coord) continue;
                          if (!player) continue; // leave blank if no player for this position
                          let x = coord.x;
                          let y = coord.y;
                          // Font and color selection
                          const fontSize = isPool4 ? fontSize4 : fontSize8;
                          const dojoFontSize = isPool4 ? dojoFontSize4 : dojoFontSize8;
                          // Alternate name color: 1,3,5,7 red; 2,4,6,8 blue
                          let nameColor;
                          if (isPool4) {
                            // For pool of 4, use same logic for up to 4 positions
                            nameColor = ([1,3].includes(pos)) ? redColor : blueColor;
                          } else {
                            nameColor = ([1,3,5,7].includes(pos)) ? redColor : blueColor;
                          }
                          const dojoColor = isPool4 ? dojoColor4 : dojoColor8;
                          // Draw name (bold, blue)
                          page.drawText(player.name, {
                            x,
                            y,
                            size: fontSize,
                            font: nameFont,
                            color: nameColor,
                          });
                          // Draw dojo/instructors below name, in parentheses, smaller font, italic, gray
                          if (player.dojo) {
                            const dojoText = `(${player.dojo})`;
                            let dojoX = x;
                            let dojoY = y - dojoFontSize - 2;
                            page.drawText(dojoText, {
                              x: dojoX,
                              y: dojoY,
                              size: dojoFontSize,
                              font: dojoFont,
                              color: dojoColor,
                            });
                          }
                        }

                        const pdfBytes = await newDoc.save();
                        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                        if (pdfBlobUrl.current) URL.revokeObjectURL(pdfBlobUrl.current);
                        pdfBlobUrl.current = URL.createObjectURL(blob);
                        setPdfDialog({
                          open: true,
                          src: pdfBlobUrl.current,
                          title: isPool4 ? `Bout Sheet (Pool of 4)` : `Bout Sheet (Pool of 8)`,
                          gender: firstPlayer.gender || '',
                          age: firstPlayer.age || '',
                          weight: firstPlayer.weight || '',
                          pool: sub.name || ''
                        });
                      } catch (e) {
                        alert('Failed to load or modify PDF: ' + e.message);
                      }
                    }}
                  >
                    Generate Bout
                  </Button>
                </Box>
      {/* PDF Dialog */}
      <Dialog
        open={pdfDialog.open}
        onClose={() => {
          setPdfDialog({ ...pdfDialog, open: false });
          if (pdfBlobUrl.current) {
            URL.revokeObjectURL(pdfBlobUrl.current);
            pdfBlobUrl.current = '';
          }
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          {pdfDialog.title}
          <IconButton onClick={() => {
            setPdfDialog({ ...pdfDialog, open: false });
            if (pdfBlobUrl.current) {
              URL.revokeObjectURL(pdfBlobUrl.current);
              pdfBlobUrl.current = '';
            }
          }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '80vh', bgcolor: '#f3f6fa', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {pdfDialog.src && (
            <iframe
              src={pdfDialog.src}
              title={pdfDialog.title}
              width="100%"
              height="100%"
              style={{ minHeight: 600, borderRadius: 8, border: 'none', display: 'block', flex: 1 }}
            />
          )}
          <Box display="flex" justifyContent="flex-end" gap={2} p={2} bgcolor="#f3f6fa">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setPdfDialog({ ...pdfDialog, open: false });
                if (pdfBlobUrl.current) {
                  URL.revokeObjectURL(pdfBlobUrl.current);
                  pdfBlobUrl.current = '';
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (pdfDialog.src) {
                  // Use actual gender, age, weight, pool for filename
                  let gender = (pdfDialog.gender || '').toString().toLowerCase().replace(/\s+/g, '');
                  let ageRaw = (pdfDialog.age || '').toString().replace(/\s+/g, '');
                  let pool = (pdfDialog.pool || '').toString().replace(/\s+/g, '');
                  // Add 'yrs' to age if not present
                  let age = ageRaw.endsWith('yrs') ? ageRaw : ageRaw ? ageRaw + 'yrs' : '';
                  let filename = 'pool.pdf';
                  if (gender && age && pool) {
                    filename = `${gender}_${age}_pool${pool}.pdf`;
                  } else {
                    // fallback: use title or default
                    filename = (pdfDialog.title ? pdfDialog.title.replace(/\s+/g, '_').toLowerCase() : 'pool') + '.pdf';
                  }
                  const link = document.createElement('a');
                  link.href = pdfDialog.src;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
              </Paper>
            ))
          )}
        </Box>
      )}
    </>
  );
};

export default PoolGenerator;
