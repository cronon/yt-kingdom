import { Picture } from 'common/picture';
import './PictureShow.css';
import emptyCover from './emptyCover.jpg';
import { useRef, useState } from 'react';

export function PictureShow({ picture }: { picture: Picture; }): JSX.Element {
  const src = picture.base64
    ? `data:image/${picture.ext};base64,` + picture.base64
    : emptyCover;
  const [dimensions, setDimensions] = useState({width: 400, height: 225});
  const imgRef = useRef<HTMLImageElement>(null);
  const onLoad = () => {
    if (imgRef.current) {
      setDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight
      })
    }
  }
  return <div className="y-pictureShow">
        <img src={src} ref={imgRef} onLoad={onLoad} />
        <span className="y-pictureShow-dimensions" title="Please note image width should be divisible by 2">
          {dimensions.width}x{dimensions.height}
        </span>
  </div>

}
