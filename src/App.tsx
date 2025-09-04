import React, { useRef, useState, useCallback } from "react";
import axios from 'axios';
import styled from 'styled-components';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProgress(0);
      setUploadStatus('');
      
      const reader = new FileReader();
      reader.onload = () => {
        if (imgRef.current) {
          imgRef.current.src = reader.result as string;
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const clearProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const simulateProgress = useCallback(() => {
    return new Promise<void>((resolve) => {
      setProgress(0);
      let currentProgress = 0;
      progressInterval.current = setInterval(() => {
        currentProgress += 1;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearProgressInterval();
          resolve();
        }
      }, 30);
    });
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('이미지를 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadStatus('업로드 중...');
      await simulateProgress();

      setUploadStatus('파일 전송 중...');
      await axios.post('http://localhost:8000/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      setUploadStatus('업로드가 완료되었습니다.');
      
    } catch (err) {
      clearProgressInterval();
      setProgress(0);
      setUploadStatus("업로드 실패");
      console.error('이미지 업로드 에러:', err);
    }
  };

  const isUploading = progress > 0 && progress < 100;
  const isComplete = progress === 100;

  return (
    <Container>
      <StyledImg ref={imgRef} alt="Profile Preview" />
      <ProfileImg>
        <label htmlFor="profileImg">프로필 이미지 추가</label>
        <input 
          type="file" 
          accept="image/*" 
          id="profileImg" 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
        />
      </ProfileImg>
      <Button onClick={handleUpload} disabled={!file || isUploading}>
        이미지 업로드
      </Button>
      {isUploading && (
        <UploadContent>
          <LoadingBar>
            <Loading style={{ width: `${progress}%` }} />
          </LoadingBar>
          <UploadingText>
            업로드 중: {progress}%
          </UploadingText>
        </UploadContent>
      )}
      <p>{uploadStatus}</p>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const StyledImg = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 1px solid black;
  object-fit: cover;
`;

const ProfileImg = styled.div`
  margin: 10px 0;
  color: blueviolet;
`;

const Button = styled.button`
  /* 기존 스타일 유지 */
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const UploadContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const LoadingBar = styled.div`
  width: 200px;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-top: 10px;
`;

const Loading = styled.div`
  height: 100%;
  background-color: green;
  border-radius: 5px;
  transition: width 0.3s ease-in-out;
`;

const UploadingText = styled.p`
  margin-top: 5px;
  font-size: 14px;
  color: #555;
`;

export default App;