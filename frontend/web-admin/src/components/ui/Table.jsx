export function Table({ headers, rows, emptyMessage = 'No data', className = '', onEdit, onDelete }) {
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
    <div className={'table-wrap ' + className}>
      <table>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} style={{ textAlign: header.align || 'left' }}>
                {header.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
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
              {(onEdit || onDelete) && (
                <td style={{ textAlign: 'right' }} data-label="Actions">
                  {onEdit && <button className="btn-icon" onClick={() => onEdit(row._original)}>Edit</button>}
                  {onDelete && <button className="btn-icon text-danger" onClick={() => onDelete(row._original)} style={{ marginLeft: '8px' }}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}