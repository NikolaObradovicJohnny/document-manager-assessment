import React, { useState, useEffect } from "react";
import "./FileVersions.css";
import Upload from "./components/Upload";

function FileVersionsList(props) {
  const file_versions = props.file_versions;
  return file_versions.map((file_version) => (
    <div className="file-version" key={file_version.id}>
      <h2>File Name: {file_version.file_name}</h2>
      <p>
        ID: {file_version.id} Version: {file_version.version_number}
      </p>
      <button>
        Show all versions of this file (with the option to upload new version)
      </button>
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
