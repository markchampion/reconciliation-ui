import React from 'react';

const TableRow = ({ record, headers }) => (
    <tr>
        {headers.map((header, index) => (
            <td key={index}>{record[header]}</td>
        ))}
    </tr>
);

export default TableRow;