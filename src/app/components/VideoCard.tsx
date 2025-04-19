import React, { useState, useEffect, useCallback } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp, Play } from "lucide-react";
import dayjs from "dayjs";
import realtiveTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "../types";
import Image from "next/image";

dayjs.extend(realtiveTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"],
    });
  }, []);

  const formatSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
  );

  useEffect(() => {
    setPreviewError(false);
  }, [isHovered]);

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div
      className="group card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure className="aspect-video relative overflow-hidden">
        {isHovered ? (
          previewError ? (
            <div className="w-full h-full flex items-center justify-center bg-base-200">
              <p className="text-error">Preview not available</p>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              onError={handlePreviewError}
            />
          )
        ) : (
          <Image
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={225}
          />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium flex items-center shadow-lg">
          <Clock size={16} className="mr-1.5" />
          {formatDuration(video.duration)}
        </div>
      </figure>
      <div className="card-body p-6">
        <h2 className="card-title text-xl font-bold mb-2 line-clamp-1">
          {video.title}
        </h2>
        <p className="text-base-content/70 text-sm line-clamp-2 mb-4">
          {video.description}
        </p>
        <p className="text-base-content/60 text-xs mb-6">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </p>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileUp size={20} className="text-primary" />
            </div>
            <div>
              <div className="font-medium text-base-content/70">Original</div>
              <div className="font-semibold">
                {formatSize(Number(video.originalSize))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <FileDown size={20} className="text-secondary" />
            </div>
            <div>
              <div className="font-medium text-base-content/70">Compressed</div>
              <div className="font-semibold">
                {formatSize(Number(video.compressedSize))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Compression</div>
            <div className="badge badge-primary badge-lg">
              {compressionPercentage}%
            </div>
          </div>
          <button
            className="btn btn-primary btn-circle"
            onClick={() =>
              onDownload(getFullVideoUrl(video.publicId), video.title)
            }
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
