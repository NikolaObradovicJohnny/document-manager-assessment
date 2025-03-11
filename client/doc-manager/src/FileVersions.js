import React, { useState, useEffect } from "react";
import Upload from "./components/Upload";
import { Link } from "react-router-dom";
import { getFileVersions } from "./services/apiService";
import "./FileVersions.css";

function FileVersionsList(props) {
  const file_versions = props.file_versions;
  return file_versions.map((file_version) => (
    <div className="file-version" key={file_version.id}>
      <h2>
        <Link to={`/${file_version.file_name}`}> {file_version.file_name} </Link>
      </h2>
      <p>
        File Hash: {file_version.file_hash} 
        <br/> 
        Latest version: {file_version.version_number}
      </p>
    </div>
  ));
}

function FileVersions() {
  const [data, setData] = useState([]);
  console.log(data);

  useEffect(() => {
    const dataFetch = async () => {
      const data = await getFileVersions();
      setData(data);
    };

    dataFetch();
  }, []);

  return (
    <div>
      <Upload setData={setData} />
      <h1>Found {data.length} File Versions</h1>
      { data.length > 0 
      ? 
        <div>
          <FileVersionsList file_versions={data} />
        </div>
      : 
        <div> No files </div>
      }
    </div>
  );
}

export default FileVersions;
