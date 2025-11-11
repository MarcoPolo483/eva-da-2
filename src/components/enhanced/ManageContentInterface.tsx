// src/components/enhanced/ManageContentInterface.tsx
import { useState, useEffect, useCallback } from 'react';
import { databaseService, type UploadedFile } from '../../lib/databaseService';
import './ManageContentInterface.css';

interface ManageContentInterfaceProps {
  projectId: string;
  userId: string;
  userRoles: string[];
  onClose?: () => void;
}

interface FileUploadStatus {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  id?: string;
  error?: string;
}

const SUPPORTED_FILE_TYPES = {
  'application/pdf': { icon: '📄', label: 'PDF' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'Word' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: '📊', label: 'PowerPoint' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: '📈', label: 'Excel' },
  'text/plain': { icon: '📃', label: 'Text' },
  'text/html': { icon: '🌐', label: 'HTML' },
  'message/rfc822': { icon: '📧', label: 'Email' }
};

export function ManageContentInterface({ 
  projectId, 
  userId, 
  userRoles,
  onClose 
}: ManageContentInterfaceProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadQueue, setUploadQueue] = useState<FileUploadStatus[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('general');
  const [tags, setTags] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFolder, setFilterFolder] = useState<string>('all');

  // Available folders for the project
  const availableFolders = [
    'general',
    'policies',
    'procedures',
    'legal',
    'finance',
    'hr',
    'technical',
    'training'
  ];

  useEffect(() => {
    loadProject();
    loadFiles();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const projectData = await databaseService.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const files = await databaseService.getProjectFiles(projectId);
      setUploadedFiles(files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newUploads: FileUploadStatus[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);

    // Process each file
    newUploads.forEach((upload, index) => {
      processFileUpload(upload, index);
    });
  };

  const processFileUpload = async (upload: FileUploadStatus, queueIndex: number) => {
    try {
      // Update progress
      const updateProgress = (progress: number) => {
        setUploadQueue(prev => prev.map((item, index) => 
          index === queueIndex ? { ...item, progress } : item
        ));
      };

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        updateProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload to service
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const uploadedFile = await databaseService.uploadFile(
        upload.file,
        projectId,
        userId,
        selectedFolder,
        tagArray
      );

      // Update queue status
      setUploadQueue(prev => prev.map((item, index) => 
        index === queueIndex ? { 
          ...item, 
          status: 'processing' as const,
          id: uploadedFile.id 
        } : item
      ));

      // Refresh files list
      await loadFiles();

      // Mark as complete after processing simulation
      setTimeout(() => {
        setUploadQueue(prev => prev.map((item, index) => 
          index === queueIndex ? { ...item, status: 'complete' as const } : item
        ));
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadQueue(prev => prev.map((item, index) => 
        index === queueIndex ? { 
          ...item, 
          status: 'error' as const,
          error: 'Upload failed. Please try again.'
        } : item
      ));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await databaseService.deleteFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const getFileIcon = (fileType: string) => {
    return SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES]?.icon || '📄';
  };

  const getFileTypeLabel = (fileType: string) => {
    return SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES]?.label || 'Document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'uploading': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const filteredFiles = uploadedFiles.filter(file => {
    const statusMatch = filterStatus === 'all' || file.status === filterStatus;
    const folderMatch = filterFolder === 'all' || file.folder === filterFolder;
    return statusMatch && folderMatch && file.status !== 'deleted';
  });

  const clearCompletedUploads = () => {
    setUploadQueue(prev => prev.filter(upload => 
      upload.status !== 'complete' && upload.status !== 'error'
    ));
  };

  return (
    <div className="manage-content-interface">
      {/* Header */}
      <div className="content-header">
        <div className="header-title">
          <h2>📁 Manage Content</h2>
          <p>Upload and manage documents for {project?.displayName || 'this project'}</p>
        </div>
        
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-controls">
          <div className="folder-selection">
            <label>Folder:</label>
            <select 
              value={selectedFolder} 
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              {availableFolders.map(folder => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="tags-input">
            <label>Tags:</label>
            <input
              type="text"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Drop Zone */}
        <div 
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
            <div className="upload-icon">📤</div>
            <h3>Click to Add Files</h3>
            <p>Or drag and drop files here</p>
            
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.pptx,.xlsx,.txt,.html,.eml"
              onChange={handleFileSelect}
              className="file-input"
            />
            
            <div className="supported-formats">
              <h4>Supported File Types:</h4>
              <div className="format-grid">
                {Object.entries(SUPPORTED_FILE_TYPES).map(([type, info]) => (
                  <div key={type} className="format-item">
                    <span className="format-icon">{info.icon}</span>
                    <span className="format-label">{info.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <div className="upload-queue">
            <div className="queue-header">
              <h3>Upload Progress</h3>
              <button onClick={clearCompletedUploads}>Clear Completed</button>
            </div>
            
            {uploadQueue.map((upload, index) => (
              <div key={index} className="upload-item">
                <div className="upload-info">
                  <span className="file-icon">{getFileIcon(upload.file.type)}</span>
                  <div className="file-details">
                    <span className="file-name">{upload.file.name}</span>
                    <span className="file-size">{formatFileSize(upload.file.size)}</span>
                  </div>
                </div>
                
                <div className="upload-status">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${upload.progress}%`,
                        backgroundColor: getStatusColor(upload.status)
                      }}
                    />
                  </div>
                  <span className={`status-text status-${upload.status}`}>
                    {upload.status === 'uploading' && `${upload.progress}%`}
                    {upload.status === 'processing' && 'Processing...'}
                    {upload.status === 'complete' && 'Complete ✓'}
                    {upload.status === 'error' && 'Error ✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="files-section">
        <div className="files-header">
          <h3>Uploaded Files ({filteredFiles.length})</h3>
          
          <div className="files-filters">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            
            <select 
              value={filterFolder} 
              onChange={(e) => setFilterFolder(e.target.value)}
            >
              <option value="all">All Folders</option>
              {availableFolders.map(folder => (
                <option key={folder} value={folder}>
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>
            
            <button onClick={loadFiles} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-files">
            <div className="loading-spinner">⏳</div>
            <p>Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="no-files">
            <div className="no-files-icon">📂</div>
            <h4>No files found</h4>
            <p>Upload some documents to get started</p>
          </div>
        ) : (
          <div className="files-grid">
            {filteredFiles.map(file => (
              <div key={file.id} className={`file-card status-${file.status}`}>
                <div className="file-card-header">
                  <span className="file-icon">{getFileIcon(file.fileType)}</span>
                  <div className="file-actions">
                    <button 
                      onClick={() => handleDeleteFile(file.id)}
                      className="delete-btn"
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="file-card-content">
                  <h4 className="file-name">{file.fileName}</h4>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.fileSize)}</span>
                    <span className="file-type">{getFileTypeLabel(file.fileType)}</span>
                  </div>
                  
                  <div className="file-details">
                    <div className="detail-row">
                      <span className="detail-label">Folder:</span>
                      <span className="folder-tag">{file.folder}</span>
                    </div>
                    
                    {file.tags.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Tags:</span>
                        <div className="tags-list">
                          {file.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="detail-row">
                      <span className="detail-label">Uploaded:</span>
                      <span>{file.uploadedAt.toLocaleDateString()}</span>
                    </div>
                    
                    {file.processedAt && (
                      <div className="detail-row">
                        <span className="detail-label">Processed:</span>
                        <span>{file.processedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`status-indicator status-${file.status}`}>
                    <span className="status-dot" style={{ backgroundColor: getStatusColor(file.status) }}></span>
                    <span className="status-label">
                      {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                    </span>
                  </div>
                  
                  {file.metadata.pageCount && (
                    <div className="metadata">
                      📄 {file.metadata.pageCount} pages
                      {file.metadata.wordCount && ` • ${file.metadata.wordCount.toLocaleString()} words`}
                    </div>
                  )}
                  
                  {file.status === 'failed' && file.errorMessage && (
                    <div className="error-message">
                      ⚠️ {file.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
