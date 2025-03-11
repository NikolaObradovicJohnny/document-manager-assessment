import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Upload from "./components/Upload";
import { getFileVersionsByName } from "./services/apiService";

function FileDetails() {
    const { filename } = useParams();
    const [fileVersions, setFileVersions] = useState([]);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchVersions = async () => {
            const response = await getFileVersionsByName(filename);
            setFileVersions(response);
        };
        fetchVersions();

    }, [filename]);


    return (
        <div>
            <h1>File: {filename}</h1>
            <Upload setData={setFileVersions} fileFileName={filename} isFilenameReadOnly={true} />
            <h2>Versions</h2>
            {fileVersions.length > 0 ? (
                fileVersions.map((file) => (
                    <div key={`${file.file_hash}${file.version_number}`}>
                        <p>
                            <a  href={`${BASE_URL}${file.file}`} 
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
