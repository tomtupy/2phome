import React from 'react';
import { useEffect, useRef } from "react";
import { AppDispatch } from 'renderer/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { liveEarthView } from 'renderer/redux/reducers/liveEarthViewSlice';
import { RootState } from 'renderer/redux/store';
import { DataFetchStatus } from 'renderer/constants';

enum ImageLoadState {
  NONE = 'none',
  DONE = 'done',
  IN_PROGRESS = 'in_progress',
}

function LiveEarthViewContainer() {
  const dispatch : AppDispatch = useDispatch<AppDispatch>();

  const { dataFetchStatus, imageFiles, fetchIntervalSec } = useSelector((state: RootState) => state.liveEarthView)

  const [imageItems, setImageItems] = React.useState<HTMLImageElement[]>([]); // <-- seed initial state
  const [imageLoadState, setImageLoadState] = React.useState<ImageLoadState>(ImageLoadState.NONE);
  const [index, setIndex] = React.useState(-1);
  let animationIndex = -1;
  const requestRef = React.useRef(0);
  const previousTimeRef = React.useRef(0);

	const myCanvas = useRef<HTMLCanvasElement | null>(null);

  const getImagery = () => {
    dispatch(liveEarthView.actions.setImageryDataFetchStatus(DataFetchStatus.IN_PROGRESS))
    //window.electron.ipcRenderer.loadEarthImageryData();
    window.electron.ipcRenderer.once('LOAD_EARTH_IMAGERY_DATA', (image_list) => {
      if (Array.isArray(image_list)) {
        dispatch(liveEarthView.actions.setImageryData(image_list))
        dispatch(liveEarthView.actions.setImageryDataFetchStatus(DataFetchStatus.SUCCESS))
      } else {
        dispatch(liveEarthView.actions.setImageryDataFetchStatus(DataFetchStatus.FAILED))
      } 
    });
  }

  // load imagery from disk timer
  useEffect(() => {
    getImagery()
    setInterval(
      () => getImagery(),
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
      //context!.imageSmoothingEnabled = false;
      //context!.globalCompositeOperation = "overlay";
      context!.clearRect(0, 0, 600, 600)
      context!.drawImage(imageItems[animationIndex], 0, 0, 600, 600);
      dispatch(liveEarthView.actions.setAnimationIndex(animationIndex))
      animationIndex = (animationIndex + 1) % imageFiles.length
      previousTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [imageItems, imageLoadState]);

  return <canvas style={{borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem'}} ref={myCanvas} width={600} height={600} />;
}

export default LiveEarthViewContainer
