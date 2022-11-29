import { Song, SongId } from 'common/song';
import React, { useEffect, useRef, useState } from 'react';
import './Songlist.css';

export function Songlist({ songs, setSongs }: { songs: Song[]; setSongs: (songs: Song[]) => void}): JSX.Element {
  const onTitleChange = (id: SongId, newTitle: string) => {
    const changingSong = songs.find(s => s.id === id);
    if (!changingSong) throw new Error(`Trying to change title of a non-existing song id=${id}`);
    changingSong.title = newTitle;
    setSongs([...songs]);
  }
  const removeSong = (id: SongId) => {
    const songIndex = songs.findIndex(s => s.id === id);
    if (songIndex === -1) throw new Error(`Trying to remove non-existing song id=${id}`);
    songs.splice(songIndex, 1);
    setSongs([...songs]);
  }
  return <div className="y-songlist">
    <table>
      <tbody>
        {songs.map((s, i) => <tr key={s.id}>
          <td>{i + 1}.</td>
          <TitleTd title={s.title} onChange={(newTitle) => {onTitleChange(s.id, newTitle)}} />
          <td>{noZeroHH(s.duration)}</td>
          <td className="y-songlist-remove-td">
            <button className="y-songlist-remove" type="button" onClick={() => removeSong(s.id)}>✖</button>
          </td>
        </tr>
        )}
      </tbody>
    </table>
  </div>;
}

function TitleTd({title, onChange}: {title: string, onChange: (newTitle: string) => void}) {
  const [isEdit, setIsEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    isEdit && textareaRef?.current?.focus()
  }, [isEdit])
  if (isEdit) {
    const onBlur = () => {
      textareaRef.current && onChange(textareaRef.current.value);
        setIsEdit(false);
    }
    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        setIsEdit(false);
      }
      if (e.key === 'Enter') {
        textareaRef.current && onChange(textareaRef.current.value);
        setIsEdit(false);
      }
    }
    return <td className="y-title-td">
      {title} {/* this title will stay under the textarea for the td to have height */}
      <textarea className="y-title-td-textarea" defaultValue={title}
        ref={textareaRef} onBlur={onBlur} onKeyDown={onKeyDown} />
    </td>
  } else {
    const onClick = () => setIsEdit(true);
    return <td className="y-title-td" onClick={onClick}>{title}</td>
  }
}

function noZeroHH(timestamp: string) {
  if (timestamp.length === 5) return timestamp
  else if (timestamp.length === 8) {
    if (timestamp[0] === '0' && timestamp[1] === '0') return timestamp.slice(3);
    else return timestamp;
  }
  else throw new Error(`Cannot remove leading zeros from a time ${timestamp}`);
}
