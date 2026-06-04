import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
} from "lucide-react";
import { useEffect } from "react";

import "./GiftMessageEditor.css";

type GiftMessageEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function GiftMessageEditor({
  value,
  onChange,
  disabled = false,
}: GiftMessageEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return {
          isBold: false,
          isItalic: false,
          isBulletList: false,
          isOrderedList: false,
          isBlockquote: false,
        };
      }

      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        isBlockquote: editor.isActive("blockquote"),
      };
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || value === editor.getHTML()) {
      return;
    }

    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className="gift-message-editor" data-testid="gift-message-editor">
      <label>Votre témoignage *</label>

      <div className="gift-message-editor__box">
        <div
          className="gift-message-editor__toolbar"
          aria-label="Mise en forme"
        >
          <button
            type="button"
            aria-label="Gras"
            className={editorState?.isBold ? "is-active" : ""}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <BoldIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Italique"
            className={editorState?.isItalic ? "is-active" : ""}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Liste à puces"
            className={editorState?.isBulletList ? "is-active" : ""}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <ListIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Liste numérotée"
            className={editorState?.isOrderedList ? "is-active" : ""}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon size={18} />
          </button>
          <button
            type="button"
            aria-label="Citation"
            className={editorState?.isBlockquote ? "is-active" : ""}
            disabled={disabled}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <QuoteIcon size={18} />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
