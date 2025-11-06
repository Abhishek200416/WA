import React, { useState, useRef } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MessageInput = ({ onSend, onAttachment, onVoiceRecord, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="wa-message-input bg-[#F0F2F5] px-4 py-2 border-t border-gray-200">
      <div className="flex items-end gap-2 bg-white rounded-lg px-3 py-2">
        {/* Emoji Picker */}
        <Popover open={showEmoji} onOpenChange={setShowEmoji}>
          <PopoverTrigger asChild>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              disabled={disabled}
            >
              <Smile className="w-6 h-6 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0 border-0">
            <EmojiPicker onEmojiClick={onEmojiClick} width={350} height={400} />
          </PopoverContent>
        </Popover>

        {/* Attachment */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          onClick={onAttachment}
          disabled={disabled}
        >
          <Paperclip className="w-6 h-6 text-gray-600" />
        </button>

        {/* Text Input */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-transparent border-0 outline-none text-[15px] text-gray-900 placeholder-gray-500 max-h-[100px] overflow-y-auto"
            style={{ minHeight: '24px' }}
          />
        </div>

        {/* Send or Voice */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <Send className="w-6 h-6 text-[#00A884]" />
          </button>
        ) : (
          <button
            onClick={onVoiceRecord}
            disabled={disabled}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <Mic className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
