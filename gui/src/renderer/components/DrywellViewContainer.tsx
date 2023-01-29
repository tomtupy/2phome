import React from 'react';
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'renderer/redux/store';
import { drywellView } from 'renderer/redux/reducers/drywellViewSlice';
import moment from 'moment';
import { DataFetchStatus } from 'renderer/constants';

enum ImageLoadState {
    NONE = 'none',
    DONE = 'done',
    IN_PROGRESS = 'in_progress',
  }

function DrywellViewContainer() {
  const dispatch : AppDispatch = useDispatch<AppDispatch>();

  const { dataFetchStatus, imageFiles, fetchIntervalSec, latestImageTimestamp } = useSelector((state: RootState) => state.drywellView)

  const [imageItems, setImageItems] = React.useState<HTMLImageElement[]>([]); // <-- seed initial state
  const [imageLoadState, setImageLoadState] = React.useState<ImageLoadState>(ImageLoadState.NONE);
  const [index, setIndex] = React.useState(-1);
  let animationIndex = -1;
  const requestRef = React.useRef(0);
  const previousTimeRef = React.useRef(0);

  const myCanvas = useRef<HTMLCanvasElement | null>(null);

  const getDrywellImages = () => {
    dispatch(drywellView.actions.setDrywellImageryFetchStatus(DataFetchStatus.IN_PROGRESS))
    window.electron.ipcRenderer.getDrywellImages();
    window.electron.ipcRenderer.once('GET_DRYWELL_IMAGES', (image_list) => {
      //console.log("DRYWELL IMAGES: ", image_list)
      if (Array.isArray(image_list)) {
        dispatch(drywellView.actions.setDrywellImageryData(image_list))
        dispatch(drywellView.actions.setDrywellImageryFetchStatus(DataFetchStatus.SUCCESS))
      } else {
        dispatch(drywellView.actions.setDrywellImageryFetchStatus(DataFetchStatus.FAILED))
      } 
    });
  }


  // load imagery from disk timer
  useEffect(() => {
    getDrywellImages()
    setInterval(
      () => getDrywellImages(),
      fetchIntervalSec * 1000
    )
  }, []);

  // load imagery from local storage
  useEffect(() => {
    if (dataFetchStatus === DataFetchStatus.SUCCESS &&
      imageFiles.length > 0 &&
      imageLoadState === ImageLoadState.NONE) {
      setImageLoadState(ImageLoadState.IN_PROGRESS);
      //console.log("LOADING IMAGES")
      let loadedImageCount = 0;
      function imageLoaded(_e: any) {
        loadedImageCount++;
        if (loadedImageCount >= imageFiles.length) {
          setImageLoadState(ImageLoadState.DONE);
        }
      }

      //console.log(imageFiles)
      imageFiles.forEach(imageFile => {
        const image = new Image();
        const base64Str = localStorage.getItem(imageFile)
        image.src = base64Str!
        image.onload = imageLoaded
        //console.log("Setting images", image)
        setImageItems(prevArray => [...prevArray, image])
      })
    } else if (dataFetchStatus === DataFetchStatus.IN_PROGRESS && index !== -1) {
      setIndex(-1)
      setImageItems([])
      setImageLoadState(ImageLoadState.NONE)
    }
    
  }, [dataFetchStatus, imageItems, imageLoadState, index]);

  useEffect(() => {
    if (imageLoadState === ImageLoadState.DONE && imageFiles.length > 0) {
      setTimeout(
        () => setIndex(0),
        100
      )
    }
  }, [imageLoadState]);

  const animate = (time: any) => {
    if (imageLoadState === ImageLoadState.DONE && imageFiles.length > 0) {
      if (animationIndex < 0) {
        animationIndex = 0
        requestRef.current = requestAnimationFrame(animate);
      }
    } else {
      return
    }
    const deltaTime = time - previousTimeRef.current;
    if (previousTimeRef.current != undefined && deltaTime > 150) {
      const context = myCanvas.current?.getContext("2d");
      context!.clearRect(0, 0, 300, 400)
      context!.drawImage(imageItems[animationIndex], 0, 0, 300, 400);
      dispatch(drywellView.actions.setAnimationIndex(animationIndex))
      animationIndex = (animationIndex + 1) % imageFiles.length
      previousTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [imageItems, imageLoadState]);

  return (
    <div style={{marginLeft: 'auto', marginTop: 'auto'}}>
      {(moment().unix() - latestImageTimestamp > 30) &&
        <div style={{color: 'red', backgroundColor: 'black'}}>
          ---- ERROR --- {moment().unix() - latestImageTimestamp} sec delay
        </div>
      }
      <canvas ref={myCanvas} width={300} height={400} />
    </div>
  );
}

export default DrywellViewContainer
