import React from 'react';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Button } from '@mui/material';

const ParticipantsTable = ({
  columns,
  filteredRows,
  page,
  rowsPerPage,
  handleChangePage
}) => {
  // Define the preferred order and flexible matching for columns
  const columnMap = [
    { keys: ['name', 'player name', 'full name', 'participant name'], label: 'Name' },
    { keys: ['gender'], label: 'Gender' },
    { keys: ['age', 'age (in yrs)', 'age (years)', 'age(years)', 'age(year)', 'age yrs', 'age in years'], label: 'Age (in yrs)' },
    { keys: ['weight', 'weight (in kg)', 'weight (kg)', 'weight(kg)', 'weight in kg'], label: 'Weight (in kg)' },
  { keys: ['belt', 'rank'], label: 'Belt' },
    { keys: ['dojo', 'instructor', 'instructors', 'dojo / instructors name', 'dojo/instructors name', 'dojo/instructor', 'dojo / instructor', 'school'], label: 'Dojo / Instructors Name' },
  ];
  const lowerColumns = columns.map(c => c.toString().toLowerCase().trim());
  // For each preferred column, find the first matching index in the actual columns
  const visibleColIndices = [];
  const visibleColLabels = [];
  columnMap.forEach(colObj => {
    for (let key of colObj.keys) {
      const idx = lowerColumns.indexOf(key);
      if (idx !== -1) {
        visibleColIndices.push(idx);
        visibleColLabels.push(colObj.label);
        break;
      }
    }
  });
  // Remove any columns that were not found (idx === -1)
  const filteredColIndices = visibleColIndices.filter(idx => idx >= 0);
  const filteredColLabels = visibleColLabels.filter((_, i) => visibleColIndices[i] >= 0);
  const totalRows = filteredRows.filter(row => Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')).length;
  const lastPage = Math.max(0, Math.ceil(totalRows / rowsPerPage) - 1);

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table
          stickyHeader
          size="small"
          sx={{
            border: '1px solid #bbb',
            '& .MuiTableCell-root': { border: '1px solid #bbb' },
            '& .MuiTableRow-root': { border: '1px solid #bbb' },
          }}
        >
          <TableHead>
            <TableRow>
              {filteredColLabels.map((label, i) => (
                <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .filter(row => Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, ridx) => (
                <TableRow key={ridx}>
                  {filteredColIndices.map((colIdx, j) => {
                    // Belt/Rank mapping logic
                    const colLabel = filteredColLabels[j];
                    let cellValue = row[colIdx];
                    if (colLabel === 'Belt') {
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
                      cellValue = mapped || cellValue;
                    }
                    return <TableCell key={j}>{cellValue}</TableCell>;
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          sx={{ mr: 2 }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleChangePage(null, 0)}
          disabled={page === 0}
        >
          Go to First Page
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleChangePage(null, lastPage)}
          disabled={page === lastPage}
        >
          Go to Last Page
        </Button>
      </div>
    </>
  );
};

export default ParticipantsTable;
