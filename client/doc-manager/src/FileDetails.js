import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Upload from "./components/Upload";

function FileDetails({ token }) {
    const { filename } = useParams();
    const [fileVersions, setFileVersions] = useState([]);

    useEffect(() => {
        const fetchVersions = async () => {
            const response = await fetch(`http://localhost:8001/api/documents/${filename}/all`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (response.ok) {
                setFileVersions(await response.json());
            }
        };
        fetchVersions();
    }, [filename, token]);


    return (
        <div>
            <h1>File: {filename}</h1>
            <Upload setData={fileVersions} fileFileName={filename} isFilenameReadOnly={true} />
            <h2>Versions</h2>
            {fileVersions.length > 0 ? (
                fileVersions.map((file) => (
                    <div key={file.file}>
                        <p>
                            <a  href={`http://localhost:8001${file.file}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="file-version-link">
                                Version: {file.version_number}
                            </a>
                        </p> 
                        <p>Uploaded at: {new Date(file.uploaded_at).toLocaleString()}</p>
                    </div>
                ))
            ) : (
                <p>No versions found.</p>
            )}
        </div>
    );
}

export default FileDetails;
