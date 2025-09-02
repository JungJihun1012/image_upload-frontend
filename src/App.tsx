import React, { useState } from "react";
import axios from 'axios';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState< File |null>(null);
  const [uploadState, setUploadState] = useState<string>('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if(!selectedFile) {
      setUploadState('이미지를 선택해주세요.');
      return;
    };

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploadState('Uploading..');
      const res = await axios.post('http://localhost:8000/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      setUploadState('업로드가 완료되었습니다.');
      console.log(res.data);
    } catch (err) {
      setUploadState("업로드 실패");
      console.error('이미지 업로드 에러:', err);
    }
  }
  return (
    <>
      <div>
        <input type="file" accept="image/*" onChange={handleFile} />
        <button onClick={handleUpload} disabled={!selectedFile}>
          이미지 업로드
        </button>
        <p>{uploadState}</p>
      </div>
    </>
  );
}

export default App;