import { useState } from 'react'
import axios from 'axios'
import {Table, Tag} from 'antd';
import './App.css'
import {MatchingStatus} from "./model/MatchingSummary.ts";
const { Column, ColumnGroup } = Table;

function App() {
    const [file1, setFile1] = useState(null)
    const [file2, setFile2] = useState(null)
    const [summary, setSummary] = useState(null)
    const [showUnmatched, setShowUnmatched] = useState(false)

    const headers = [
        "profileName", "transactionDate", "amount", "narrative",
        "description", "id", "type", "walletReference"
    ];

    const columns = headers.flatMap(header => [
        {
            title: header,
            dataIndex: ['first', header],
            key: `first_${header}`,
        }
    ]).concat(
        headers.flatMap(header => [
            {
                title: header,
                dataIndex: ['second', header],
                key: `second_${header}`,
            }
        ])
    );

    columns.push({
        title: 'Result',
        dataIndex: 'status',
        key: 'status',
    }, {
        title: 'Exception Codes',
        dataIndex: 'exceptionCodes',
        key: 'exceptionCodes',
    });

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('file1', file1)
        formData.append('file2', file2)

        try {
            const response = await axios.post(process.env.API_ENDPOINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            const data = response.data;
            setSummary(data);
        } catch (error) {
            console.error('Error uploading files:', error)
        }
    }

    return (
        <div className="App">
            {!summary ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>
                            File 1:
                            <input type="file" onChange={(e) => handleFileChange(e, setFile1)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            File 2:
                            <input type="file" onChange={(e) => handleFileChange(e, setFile2)} />
                        </label>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            ) : (
                <div className="summary-section">
                    <div className="summary-header">
                        <div className="summary">
                            <h2>File 1 Summary</h2>
                            <p>Total Records: {summary.totalRecords[0]}</p>
                            <p>Matched Records: {summary.totalMatchedRecords}</p>
                            <p>Unmatched Records: {summary.totalUnmatchedRecords[0]}</p>
                            <p>Total Amount: {summary.totalAmounts[0]}$</p>
                            <p>Total Unmatched Amount: {summary.totalAmounts[0] - summary.totalMatchedAmount}$</p>
                        </div>
                        <div className="summary">
                        <h2>File 2 Summary</h2>
                            <p>Total Records: {summary.totalRecords[1]}</p>
                            <p>Matched Records: {summary.totalMatchedRecords}</p>
                            <p>Unmatched Records: {summary.totalUnmatchedRecords[1]}</p>
                            <p>Total Amount: {summary.totalAmounts[1]}$</p>
                            <p>Total Unmatched Amount: {summary.totalAmounts[1] - summary.totalMatchedAmount}$</p>
                        </div>
                    </div>
                    <button onClick={() => setShowUnmatched(!showUnmatched)}>
                        {showUnmatched ? 'Hide' : 'Show'} Unmatched Reports
                    </button>
                    {showUnmatched && (
                        <Table
                            // columns={columns}
                            dataSource={[
                                ...summary.nonPerfectMatchedRecords,
                                ...summary.unmatchedRecords,
                                ...summary.duplicatedRecords
                            ]}
                            rowKey={(record, index) => index}
                            pagination={false}
                            bordered={true}
                            scroll={{ x: 'max-content' }}
                        >
                            <ColumnGroup title={'File 1: ' + file1.name}>
                                {headers.map(header => (
                                    <Column
                                        title={header}
                                        dataIndex={['first', header]}
                                        key={`first_${header}`}
                                        render={(text, record) => {
                                            const isMismatch = record.second && text !== record.second[header];
                                            return (
                                                <div style={{ color: isMismatch ? '#d4380d' : 'inherit' }}>
                                                    {text}
                                                </div>
                                            );
                                        }}
                                    />
                                ))}
                            </ColumnGroup>
                            <ColumnGroup title={'File 2: ' + file2.name}>
                                {headers.map(header => (
                                    <Column
                                        title={header}
                                        dataIndex={['second', header]}
                                        key={`second_${header}`}
                                    />
                                ))}
                            </ColumnGroup>
                            <Column
                                title="Result"
                                dataIndex="status"
                                key="status"
                                render={status =>
                                    <Tag color={status.length > 10  ?  'geekblue' : 'volcano'}>
                                        {status}
                                    </Tag>
                                }
                            />
                            <Column
                                title="Exception Codes"
                                dataIndex="exceptionCodes"
                                key="exceptionCodes"
                                // render={codes => codes.join("\n")}
                                render={codes => codes.join("\n").split('\n').map((code, index) => (
                                    <div key={index}>{code}</div>
                                ))}
                            />

                        </Table>
                        // <table className="unmatched-table">
                        //     <thead>
                        //     <tr>
                        //         <th colSpan="8">{file1.name}</th>
                        //         <th colSpan="8">{file2.name}</th>
                        //         <th colSpan="2" rowSpan="2">Result</th>
                        //     </tr>
                        //     <tr>
                        //         {Array.from({ length: 2 }).map((_, i) => (
                        //             headers.map((header, j) => (
                        //                 <th key={`${i}-${j}`}>{header}</th>
                        //             ))
                        //         ))}
                        //     </tr>
                        //     </thead>
                        //     <tbody>
                        //     {summary.nonPerfectMatchedRecords.map((record, i) => (
                        //             <tr key={i} >
                        //                     <td>{record.first.profileName}</td>
                        //                     <td>{record.first.transactionDate}</td>
                        //                     <td>{record.first.amount}</td>
                        //                     <td>{record.first.narrative}</td>
                        //                     <td>{record.first.description}</td>
                        //                     <td>{record.first.id}</td>
                        //                     <td>{record.first.type}</td>
                        //                     <td>{record.first.walletReference}</td>
                        //                     <td>{record.second.profileName}</td>
                        //                     <td>{record.second.transactionDate}</td>
                        //                     <td>{record.second.amount}</td>
                        //                     <td>{record.second.narrative}</td>
                        //                     <td>{record.second.description}</td>
                        //                     <td>{record.second.id}</td>
                        //                     <td>{record.second.type}</td>
                        //                     <td>{record.second.walletReference}</td>
                        //                     <td>{record.status}</td>
                        //                     <td>{record.exceptionCodes.join("\n")}</td>
                        //             </tr>
                        //         ))}
                        //     {summary.unmatchedRecords.map((record, i) => (
                        //         <tr key={i}>
                        //             <td>{record?.first?.profileName}</td>
                        //             <td>{record?.first?.transactionDate}</td>
                        //             <td>{record?.first?.amount}</td>
                        //             <td>{record?.first?.narrative}</td>
                        //             <td>{record?.first?.description}</td>
                        //             <td>{record?.first?.id}</td>
                        //             <td>{record?.first?.type}</td>
                        //             <td>{record?.first?.walletReference}</td>
                        //             <td>{record?.second?.profileName}</td>
                        //             <td>{record?.second?.transactionDate}</td>
                        //             <td>{record?.second?.amount}</td>
                        //             <td>{record?.second?.narrative}</td>
                        //             <td>{record?.second?.description}</td>
                        //             <td>{record?.second?.id}</td>
                        //             <td>{record?.second?.type}</td>
                        //             <td>{record?.second?.walletReference}</td>
                        //             <td>{record?.status}</td>
                        //             <td>{record?.exceptionCodes.join("\n")}</td>
                        //         </tr>
                        //     ))}
                        //     {summary.duplicatedRecords.map((record, i) => (
                        //         <tr key={i}>
                        //             <td>{record?.first?.profileName}</td>
                        //             <td>{record?.first?.transactionDate}</td>
                        //             <td>{record?.first?.amount}</td>
                        //             <td>{record?.first?.narrative}</td>
                        //             <td>{record?.first?.description}</td>
                        //             <td>{record?.first?.id}</td>
                        //             <td>{record?.first?.type}</td>
                        //             <td>{record?.first?.walletReference}</td>
                        //             <td>{record?.second?.profileName}</td>
                        //             <td>{record?.second?.transactionDate}</td>
                        //             <td>{record?.second?.amount}</td>
                        //             <td>{record?.second?.narrative}</td>
                        //             <td>{record?.second?.description}</td>
                        //             <td>{record?.second?.id}</td>
                        //             <td>{record?.second?.type}</td>
                        //             <td>{record?.second?.walletReference}</td>
                        //             <td>{record?.status}</td>
                        //             <td>{record?.exceptionCodes.join("\n")}</td>
                        //         </tr>
                        //     ))}
                        //     </tbody>
                        // </table>
                    )}
                </div>
            )}
        </div>
    )
}

export default App