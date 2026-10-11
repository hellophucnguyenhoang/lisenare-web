import { useRef, useEffect } from "react";

export interface PlainTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
  id?: string;
  inputRef?: React.RefObject<HTMLDivElement | null>;
}

export default function PlainTextInput({
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  autoFocus = false,
  onKeyDown,
  onFocus,
  onBlur,
  id,
  inputRef,
}: PlainTextInputProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = inputRef || internalRef;
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  useEffect(() => {
    if (ref.current && !isComposingRef.current) {
      const current = (ref.current.innerText || "").replace(/\r?\n/g, "");
      if (current !== value) {
        ref.current.innerText = value;
      }
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText || "";
    const clean = text.replace(/\r?\n/g, "");
    onChange(clean);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").replace(/\r?\n/g, " ");
    document.execCommand("insertText", false, text);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposingRef.current = false;
    const text = e.currentTarget.innerText || "";
    const clean = text.replace(/\r?\n/g, "");
    onChange(clean);
  };

  // Convert focus: and focus-visible: classes to focus-within: so clicking the inner editable element triggers visual container focus states
  const containerClasses = className
    .replace(/\bfocus:/g, "focus-within:")
    .replace(/\bfocus-visible:/g, "focus-within:");

  return (
    <div
      className={`relative cursor-text select-text flex items-center min-w-0 max-w-full ${containerClasses} ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      }`}
      onClick={(e) => {
        if (ref.current && e.target !== ref.current) {
          ref.current.focus({ preventScroll: true });
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.selectNodeContents(ref.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }}
    >
      <div className="relative w-full flex items-center min-w-0 overflow-hidden">
        {!value && placeholder && (
          <span className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-on-surface-variant/40 truncate select-none w-full leading-normal">
            {placeholder}
          </span>
        )}
        <div
          id={id}
          ref={ref}
          contentEditable={!disabled ? "plaintext-only" : false}
          role="textbox"
          tabIndex={disabled ? -1 : 0}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={onFocus}
          onBlur={onBlur}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className="w-full outline-none bg-transparent select-text whitespace-nowrap overflow-x-auto leading-normal py-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none"
        />
      </div>
    </div>
  );
}
