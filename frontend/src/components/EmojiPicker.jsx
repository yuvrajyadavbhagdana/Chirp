import { useRef, useState } from 'react';
import { Smile } from 'lucide-react';
import Swal from 'sweetalert2';
import './EmojiPicker.css';

const EMOJIS = ['😀', '😂', '🥰', '😍', '😊', '😎', '🤔', '😭', '🙌', '👏', '🔥', '❤️', '🎉', '✨', '👍', '🙏', '💯', '☕', '📚', '🚀', '🌟', '🙂', '😅', '💜'];

export default function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const insertEmoji = (emoji) => {
    const textarea = triggerRef.current?.closest('.composer')?.querySelector('textarea');
    const content = value || '';
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const nextContent = `${content.slice(0, start)}${emoji}${content.slice(end)}`;

    if (nextContent.length > 280) {
      Swal.fire({ icon: 'warning', title: 'Post limit reached', text: 'Remove some text before adding an emoji.' });
      return;
    }

    onChange(nextContent);
    setOpen(false);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  return (
    <div className="composer-tools">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Add emoji"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="composer-emoji-picker"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <Smile/>
      </button>
      {open && <div className="emoji-picker" id="composer-emoji-picker" role="dialog" aria-label="Choose an emoji">
        {EMOJIS.map((emoji) => <button key={emoji} type="button" aria-label={`Insert ${emoji}`} onClick={() => insertEmoji(emoji)}>{emoji}</button>)}
      </div>}
    </div>
  );
}
