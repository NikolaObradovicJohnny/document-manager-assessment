import React, { useState, useEffect } from "react";
import "./FileVersions.css";
import Upload from "./components/Upload";
import { Link } from "react-router-dom";

function FileVersionsList(props) {
  const file_versions = props.file_versions;
  return file_versions.map((file_version) => (
    <div className="file-version" key={file_version.id}>
      <h2>
        <Link to={`/${file_version.file_name}`}> {file_version.file_name} </Link>
      </h2>
      <p>
        ID: {file_version.id} 
        <br/> 
        Latest version: {file_version.version_number}
      </p>
    </div>
  ));
}

function FileVersions({ token }) {
  const [data, setData] = useState([]);
  console.log(data);

  useEffect(() => {
    const dataFetch = async () => {
      const data = await (
        await fetch("http://localhost:8001/api/file_versions",  {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        })
      ).json();

      // set state when the data received
      setData(data);
    };

    if (token) {
      dataFetch();
    }
  }, [token]);

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
