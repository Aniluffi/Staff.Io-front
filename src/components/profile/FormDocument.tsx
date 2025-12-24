"use client";

import { useRef, useState, useEffect } from "react";
import { FotoItem } from "@/types/AdminModels";
import {
  XMarkIcon,
  DocumentIcon,
  MagnifyingGlassPlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface DocumentsSectionProps {
  documentUrls?: string[];
  documentItems?: FotoItem[];
  isEditing: boolean;
  onAddDocument: (files: FileList | null) => void;
  onRemoveDocument: (index: number) => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documentUrls,
  documentItems,
  isEditing,
  onAddDocument,
  onRemoveDocument
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
    index: number;
  } | null>(null);

  // Определяем, какие документы использовать
  const documents = isEditing ? documentItems || [] : documentUrls || [];
  
  // Обработка клавиатуры для навигации
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      switch (e.key) {
        case 'Escape':
          handleClosePreview();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const handleFileClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddDocument(files);
      e.target.value = '';
    }
  };

  const getDocumentImageUrl = (doc: string | FotoItem, index: number): string => {
    if (typeof doc === 'string') {
      return doc;
    } else {
      if (doc.base64) {
        return `data:image/jpeg;base64,${doc.base64}`;
      }
      // Если есть URL в FotoItem (для существующих документов)
      return (doc as any).url || '';
    }
  };

  const getDocumentName = (doc: string | FotoItem, index: number): string => {
    if (typeof doc === 'string') {
      const urlParts = doc.split('/');
      return urlParts[urlParts.length - 1] || `document-${index + 1}.jpg`;
    } else {
      return doc.name || `document-${index + 1}.jpg`;
    }
  };

  const handleImageClick = (doc: string | FotoItem, index: number) => {
    const imageUrl = getDocumentImageUrl(doc, index);
    const docName = getDocumentName(doc, index);
    
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        name: docName,
        index
      });
    }
  };

  const handleClosePreview = () => {
    setSelectedImage(null);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    
    const nextIndex = (selectedImage.index + 1) % documents.length;
    const nextDoc = documents[nextIndex];
    const imageUrl = getDocumentImageUrl(nextDoc, nextIndex);
    const docName = getDocumentName(nextDoc, nextIndex);
    
    setSelectedImage({
      url: imageUrl,
      name: docName,
      index: nextIndex
    });
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    
    const prevIndex = (selectedImage.index - 1 + documents.length) % documents.length;
    const prevDoc = documents[prevIndex];
    const imageUrl = getDocumentImageUrl(prevDoc, prevIndex);
    const docName = getDocumentName(prevDoc, prevIndex);
    
    setSelectedImage({
      url: imageUrl,
      name: docName,
      index: prevIndex
    });
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DocumentIcon className="w-5 h-5 text-blue-500" />
          Документы
          {isEditing && (
            <span className="text-xs text-blue-600">
              ({documents.length} фото)
            </span>
          )}
        </h3>

        {isEditing ? (
          <div className="space-y-4">
            <label className="block">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={handleFileClick}
                className="w-full px-4 py-3 bg-white border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-medium cursor-pointer hover:bg-blue-50 transition-colors text-center"
              >
                + Добавить фото
              </div>
            </label>

            {documents.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documents.map((doc, index) => {
                  const imageUrl = getDocumentImageUrl(doc, index);
                  const docName = getDocumentName(doc, index);
                  
                  return (
                    <div key={index} className="relative group">
                      <div 
                        className="aspect-square rounded-lg overflow-hidden border border-blue-200 bg-white cursor-pointer"
                        onClick={() => handleImageClick(doc, index)}
                      >
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={docName}
                              className="w-full h-full object-cover"
                            />
                            {/* Кнопка увеличения - показываем всегда, если есть изображение */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <MagnifyingGlassPlusIcon className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <DocumentIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 truncate text-center">
                          {docName}
                        </p>
                      </div>
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveDocument(index);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                          title="Удалить"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {documents.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documents.map((doc, index) => {
                  const imageUrl = getDocumentImageUrl(doc, index);
                  const docName = getDocumentName(doc, index);
                  
                  return (
                    <div key={index} className="relative group">
                      <div 
                        className="aspect-square rounded-lg overflow-hidden border border-blue-200 bg-white cursor-pointer"
                        onClick={() => handleImageClick(doc, index)}
                      >
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={docName}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            />
                            {/* Кнопка увеличения */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <MagnifyingGlassPlusIcon className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <DocumentIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 truncate text-center">
                          {docName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Документы не загружены</p>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра фото */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handleClosePreview}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
              title="Закрыть"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            {/* Навигационные кнопки */}
            {documents.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-colors z-10"
                  title="Предыдущее фото"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-colors z-10"
                  title="Следующее фото"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Изображение */}
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Информация */}
              <div className="mt-4 text-center text-white">
                <p className="text-lg font-medium">{selectedImage.name}</p>
                <p className="text-sm opacity-80">
                  {selectedImage.index + 1} из {documents.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};