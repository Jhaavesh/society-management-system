export function Table({ headers, rows, emptyMessage = 'No data', className = '' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className='table-wrap'>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={\	able-wrap \\}>
      <table>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} style={{ textAlign: header.align || 'left' }}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {headers.map((header, colIdx) => (
                <td key={colIdx} style={{ textAlign: header.align || 'left' }} data-label={header.label}>
                  {row[header.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
