import React, { useState, useRef } from 'react';
import './Upload.css';
import { uploadFile, getFileVersions, getFileVersionsByName } from "../services/apiService";

function Upload({ setData, fileFileName, isFilenameReadOnly }) {
    const [file, setFile] = useState(null);
    const [filename, setFilename] = useState(fileFileName || '');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);
    const readOnlyFileName = isFilenameReadOnly;
  
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
    
        try {
            const response = await uploadFile(file, filename);

            if (response) {
                setMessage("File uploaded successfully!");
                setFile(null);
                if (!isFilenameReadOnly) { 
                    setFilename("");
                }

                const updatedFiles = isFilenameReadOnly 
                    ? await getFileVersionsByName(filename) 
                    : await getFileVersions();
                setData(updatedFiles);

            } else {
                setError(response.detail || "Upload failed");
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
  