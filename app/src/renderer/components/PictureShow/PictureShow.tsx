import { Picture } from 'common/picture';
import './PictureShow.css';
import emptyCover from './emptyCover.jpg';

export function PictureShow({ picture }: { picture: Picture; }): JSX.Element {
  const src = picture.base64
    ? `data:image/${picture.ext};base64,` + picture.base64
    : emptyCover
  return <div className="y-pictureShow">
        <img src={src} />
  </div>

}
