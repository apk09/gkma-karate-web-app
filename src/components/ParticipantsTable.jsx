import React from 'react';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Button } from '@mui/material';

const ParticipantsTable = ({
  columns,
  filteredRows,
  page,
  rowsPerPage,
  handleChangePage
}) => {
  // Columns to hide
  const hiddenCols = ['Reporting Time', 'Category', 'Pool', 'Tatami', 'D.O.B (DD-MM-YYYY)'];
  // Indices of columns to show
  const visibleColIndices = columns
    .map((col, idx) => (hiddenCols.includes(col) ? null : idx))
    .filter(idx => idx !== null);
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
              {visibleColIndices.map(idx => (
                <TableCell key={idx} sx={{ fontWeight: 700 }}>{columns[idx]}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .filter(row => Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, ridx) => (
                <TableRow key={ridx}>
                  {visibleColIndices.map(colIdx => (
                    <TableCell key={colIdx}>{row[colIdx]}</TableCell>
                  ))}
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
