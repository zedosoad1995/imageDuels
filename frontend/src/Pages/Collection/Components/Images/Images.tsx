import { useContext, useRef, useState } from "react";
import { useParams } from "react-router";
import { addImageToCollection } from "../../../../Api/collections";
import imageCompression, { Options } from "browser-image-compression";
import { Button } from "@mantine/core";
import classes from "./Images.module.css";
import { IGetCollection } from "../../../../Types/collection";
import { notifications } from "@mantine/notifications";
import { CollectionContext } from "../../../../Contexts/CollectionContext";
import pLimit from "p-limit";
import { MasonryGrid } from "../../../../Components/MasonryGrid/MasonryGrid";
import { ImageCard } from "./Components/ImageCard/ImageCard";
import { UserContext } from "../../../../Contexts/UserContext";
import { ImageFullScreenModal } from "./Components/ImageFullscreenModal/ImageFullscreenModal";
import { ImageUploadModal } from "./Components/ImageUploadModal/ImageUploadModal";
import { ImageUploadErrorModal } from "./Components/ImageUploadErrorModal/ImageUploadErrorModal";
import { useInfiniteScroll } from "../../../../Hooks/useInfiniteScroll";

const limit = pLimit(2);

interface Props {
  collection: IGetCollection;
}

export const Images = ({ collection }: Props) => {
  const { id } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchCollection, isLoading: isLoadingApiCall } =
    useContext(CollectionContext);
  const { user } = useContext(UserContext);

  const [isLoadingInfiniteScroll, setIsLoadingInfiniteScroll] = useState(false);

  const [isOpenImgUploadModal, setIsOpenImgUploadModal] = useState(false);
  const [totalImagesToUpload, setTotalImagesToUpload] = useState(0);
  const [totalImagesUploaded, setTotalImagesUploaded] = useState(0);

  const [isOpenImgView, setIsOpenImgView] = useState(false);
  const [clickedImageIdx, setClickedImageIdx] = useState<number>();

  const [isOpenImgUploadFailureModal, setIsOpenImgUploadFailureModal] =
    useState(false);
  const [failedUploadedImages, setFailedUploadedImages] = useState<File[]>([]);

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(collection.nextCursor),
    isLoading: isLoadingInfiniteScroll || isLoadingApiCall,
    onLoadMore: () => {
      setIsLoadingInfiniteScroll(true);
      fetchCollection({ useCursor: true });
    },
    rootMargin: "2000px",
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !id) return;

    const files = Array.from(e.target.files);

    try {
      onImagesUpload(files, id);
    } finally {
      e.currentTarget.value = "";
    }
  };

  const onRetryFailedImagesUpload = async () => {
    if (!failedUploadedImages.length || !id) return;

    setIsOpenImgUploadFailureModal(false);

    onImagesUpload(failedUploadedImages, id);
  };

  const onImagesUpload = async (files: File[], id: string) => {
    if (files.length > 100) {
      return notifications.show({
        message: `Max 100 images — you tried to upload ${files.length} at once`,
        color: "red",
        autoClose: 8000,
      });
    }

    try {
      setIsOpenImgUploadModal(true);
      setTotalImagesToUpload(files.length);
      setTotalImagesUploaded(0);

      const failedImagesUploadedTemp: File[] = [];

      const res = await Promise.allSettled(
        files.map((file) =>
          limit(async () => {
            try {
              if (file.size > 1 * 1024 * 1024) {
                const options: Options = {
                  maxSizeMB: 1,
                  maxWidthOrHeight: 1920,
                  useWebWorker: true,
                };
                file = await imageCompression(file, options);
              }

              await addImageToCollection(id, file);
              setTotalImagesUploaded((val) => val + 1);

              return file;
            } catch (err) {
              failedImagesUploadedTemp.push(file);

              throw err;
            }
          })
        )
      );

      if (failedImagesUploadedTemp.length) {
        setFailedUploadedImages(failedImagesUploadedTemp);
        setIsOpenImgUploadFailureModal(true);
      }

      fetchCollection();

      const { numSuccess, numFailures } = res.reduce(
        (acc, val) => {
          if (val.status === "fulfilled") {
            acc.numSuccess += 1;
          } else {
            acc.numFailures += 1;
          }

          return acc;
        },
        { numSuccess: 0, numFailures: 0 }
      );

      setTotalImagesUploaded(numSuccess);

      if (numSuccess + numFailures === 0) return;

      if (numSuccess + numFailures === 1) {
        if (numSuccess) {
          return notifications.show({
            message: "Image successfully uploaded",
          });
        }

        return notifications.show({
          message: "Image could not be uploaded",
          color: "red",
        });
      }

      if (numFailures > 0) {
        return notifications.show({
          message: `${numSuccess}/${
            numSuccess + numFailures
          } images were uploaded (${numFailures} images failed to upload)`,
          color: "red",
        });
      }

      notifications.show({
        message: `All ${numSuccess} images successfully uploaded`,
      });
    } finally {
      setIsOpenImgUploadModal(false);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleImageClick = (index: number) => () => {
    setIsOpenImgView(true);
    setClickedImageIdx(index);
  };

  return (
    <>
      {collection.belongsToMe && (
        <Button className={classes.uploadBtn} onClick={handleButtonClick}>
          Upload images
        </Button>
      )}
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        style={{ display: "none" }}
        multiple
        accept=".jpg, .jpeg, .png, .webp, .svg"
      />

      <MasonryGrid
        numColumns={{ base: 1, 600: 2, 1200: 3 }}
        gap={4}
        onReady={() => {
          setIsLoadingInfiniteScroll(false);
        }}
      >
        {collection.images.map(
          ({ id, filepath, numVotes, percentile }, index) => (
            <ImageCard
              key={id}
              canDelete={collection.belongsToMe || user?.role === "ADMIN"}
              filepath={filepath}
              imageId={id}
              numVotes={numVotes}
              percentile={percentile}
              onClick={handleImageClick(index)}
            />
          )
        )}
      </MasonryGrid>

      <div ref={sentinelRef} style={{ height: 1 }} />

      <ImageFullScreenModal
        initIndex={clickedImageIdx}
        images={collection.images}
        isOpen={isOpenImgView}
        onClose={() => setIsOpenImgView(false)}
      />
      <ImageUploadModal
        isOpen={isOpenImgUploadModal}
        onClose={() => setIsOpenImgUploadModal(false)}
        numUploadedImages={totalImagesUploaded}
        totalImages={totalImagesToUpload}
      />
      <ImageUploadErrorModal
        isOpen={isOpenImgUploadFailureModal}
        onClose={() => setIsOpenImgUploadFailureModal(false)}
        failedImages={failedUploadedImages}
        onRetry={onRetryFailedImagesUpload}
      />
    </>
  );
};
