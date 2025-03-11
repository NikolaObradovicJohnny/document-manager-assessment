import React, { useState, useEffect, useRef } from 'react';
import './Upload.css';

function Upload({ setData, fileFileName, isFilenameReadOnly }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [file, setFile] = useState(null);
    const [filename, setFilename] = useState(fileFileName || '');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);
    const readOnlyFileName = isFilenameReadOnly;
  
    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);  // Get the selected file
            if (!isFilenameReadOnly) { 
                setFilename(selectedFile.name);
            }
        } 
    };
  
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);  // Append the file
        formData.append("file_name", filename); // Append the filename
    
        try {
            const response = await fetch("http://localhost:8001/api/upload-document/", {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("File uploaded successfully!");
                setFile(null);
                if (!isFilenameReadOnly) { 
                    setFilename("");
                }
                console.log("Uploaded file:", data);

                const updatedResponse = await fetch("http://localhost:8001/api/file_versions", {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });
                if (updatedResponse.ok) {
                    const updatedFiles = await updatedResponse.json();
                    setData(updatedFiles);
                    setFile(null);
                    setFilename("");
                }

            } else {
                setError(data.detail || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setError("An error occurred while uploading.");
        }
    };

    // Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault(); // Prevent default behavior to allow drop
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            if (!isFilenameReadOnly) { 
                setFilename(droppedFile.name);
            }
        }
    };

    // Open File Dialog on Click
    const handleClick = () => {
        fileInputRef.current.click();
    };

    // Render File Preview
    const renderPreview = () => {
        if (!file) return null;

        const fileExtension = file.name.split(".").pop().toLowerCase();
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
        const audioExtensions = ["wav", "mp3"];

        if (imageExtensions.includes(fileExtension)) {
            return <img src={URL.createObjectURL(file)} alt="Preview" className="preview-image" />;
        } else if (audioExtensions.includes(fileExtension)) {
            return (
                <div className="file-info">
                    <img src="/audio-icon.png" alt="Document Icon" className="document-icon" />
                    <p>{file.name}</p>
                </div>
            );
        } else {
            return (
                <div className="file-info">
                    <img src="/document-icon.webp" alt="Document Icon" className="document-icon" />
                    <p>{file.name}</p>
                </div>
            );
        }
    };
  
    return (
      <div className="upload">
        <h1> Upload new file </h1>
        <form onSubmit={handleUpload}>
            <div 
                className="file-upload"
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}> 
                Choose file or drag and drop

                <input 
                    type="file" 
                    name="file"
                    onChange={handleFileChange}
                    required
                    ref={fileInputRef}
                    hidden
                />
            </div>
            {renderPreview()}
            <input
                type="text"
                placeholder="Filename"
                value={filename}
                onChange={(e) => readOnlyFileName ? filename : setFilename(e.target.value)}
                className="filename"
                required
            />
            <button type="submit">Upload</button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    );
  }
  
  export default Upload;
  