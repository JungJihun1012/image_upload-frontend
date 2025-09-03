import React, { useRef, useState } from "react";
import axios from 'axios';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
      setUploadState('');
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (imgRef.current) {
          imgRef.current.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startFakeProgress = () => {
    return new Promise<void>((resolve) => {
      setUploadProgress(0);
      let progress = 0;
      progressInterval.current = setInterval(() => {
        progress += 1;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval.current!);
          progressInterval.current = null;
          resolve();
        }
      }, 30);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadState('이미지를 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploadState('업로드 중...');
      
      await startFakeProgress(); 

      setUploadState('파일 전송 중...');
      const res = await axios.post('http://localhost:8000/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      setUploadState('업로드가 완료되었습니다.');
      console.log(res.data);
      
    } catch (err) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setUploadProgress(0);
      setUploadState("업로드 실패");
      console.error('이미지 업로드 에러:', err);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
        <img
          ref={imgRef}
          alt="Profile Preview"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '1px solid black',
            objectFit: 'cover'
          }}
        />
        <div style={{ margin: "10px 0 10px 0", color: "blueviolet" }}>
          <label htmlFor="profileImg">프로필 이미지 추가</label>
          <input type="file" accept="image/*" id="profileImg" onChange={handleFile} style={{ display: "none" }} />
        </div>
        <button onClick={handleUpload} disabled={!selectedFile}>
          이미지 업로드
        </button>
        {uploadProgress > 0 && uploadProgress <= 100 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: '200px', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', marginTop: '10px' }}>
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  backgroundColor: 'green',
                  borderRadius: '5px',
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </div>
            <p style={{ marginTop: '5px', fontSize: '14px', color: '#555' }}>
              업로드 중: {uploadProgress}%
            </p>
          </div>
        )}
        <p>{uploadState}</p>
      </div>
    </>
  );
};

export default App;