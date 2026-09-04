import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import Blockquote from "@tiptap/extension-blockquote";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Quote, Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, Highlighter, Minus, Undo, Redo,
} from "lucide-react";

const lowlight = createLowlight(common);

const ImageExtension = Image.configure({
  inline: true,
  allowBase64: true,
  HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
});

export function TiptapEditor({ value, onChange, className, editable = true }) {
  const [, forceUpdate] = React.useState(0);
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({ codeBlock: false, blockquote: false, horizontalRule: false, link: false, underline: false }),
      Underline, Highlight, Typography, Blockquote, HorizontalRule,
      TextStyle, Color, FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true, HTMLAttributes: { class: "task-item" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      ImageExtension,
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Write your description here..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
    onTransaction: () => { forceUpdate(n => n + 1); },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter link URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const btn = (onClick, isActive, children, title) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: 'none',
        background: isActive ? 'var(--primary-color)' : 'transparent',
        color: isActive ? '#fff' : '#374151',
        padding: '10px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
      }}
      className={"hover:bg-gray-200" + (isActive ? " opacity-90" : "")}
    >
      {children}
    </button>
  );

  const a = (name, attrs) => editor.isActive(name, attrs);

  return (
    <div className={"border rounded-lg overflow-hidden " + (className || "")} style={{ position: 'relative' }}>
      {editable && <div className="flex flex-wrap gap-0.5 border-b bg-gray-50 p-1" style={{ position: 'relative', zIndex: 1 }}>
        {btn(() => editor.chain().focus().toggleBold().run(), a("bold"), <Bold size={16} />, "Bold")}
        {btn(() => editor.chain().focus().toggleItalic().run(), a("italic"), <Italic size={16} />, "Italic")}
        {btn(() => editor.chain().focus().toggleUnderline().run(), a("underline"), <UnderlineIcon size={16} />, "Underline")}
        {btn(() => editor.chain().focus().toggleStrike().run(), a("strike"), <Strikethrough size={16} />, "Strikethrough")}
        {btn(() => editor.chain().focus().toggleHighlight().run(), a("highlight"), <Highlighter size={16} />, "Highlight")}
        {btn(() => editor.chain().focus().toggleCode().run(), a("code"), <Code size={16} />, "Inline Code")}

        <div className="w-px bg-gray-300 mx-1" style={{ alignSelf: 'stretch' }} />

        {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), a("heading", { level: 1 }), <Heading1 size={16} />, "Heading 1")}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), a("heading", { level: 2 }), <Heading2 size={16} />, "Heading 2")}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), a("heading", { level: 3 }), <Heading3 size={16} />, "Heading 3")}

        <div className="w-px bg-gray-300 mx-1" style={{ alignSelf: 'stretch' }} />

        {btn(() => editor.chain().focus().toggleBulletList().run(), a("bulletList"), <List size={16} />, "Bullet List")}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), a("orderedList"), <ListOrdered size={16} />, "Ordered List")}
        {btn(() => editor.chain().focus().toggleTaskList().run(), a("taskList"), <CheckSquare size={16} />, "Task List")}

        <div className="w-px bg-gray-300 mx-1" style={{ alignSelf: 'stretch' }} />

        {btn(() => editor.chain().focus().toggleBlockquote().run(), a("blockquote"), <Quote size={16} />, "Blockquote")}
        {btn(() => editor.chain().focus().setHorizontalRule().run(), null, <Minus size={16} />, "Horizontal Rule")}
        {btn(() => editor.chain().focus().toggleCodeBlock().run(), a("codeBlock"), <Code size={16} />, "Code Block")}

        <div className="w-px bg-gray-300 mx-1" style={{ alignSelf: 'stretch' }} />

        {btn(addLink, a("link"), <LinkIcon size={16} />, "Add Link")}
        {btn(addImage, null, <ImageIcon size={16} />, "Add Image")}
        {btn(addTable, null, <TableIcon size={16} />, "Add Table")}

        <div className="w-px bg-gray-300 mx-1" style={{ alignSelf: 'stretch' }} />

        {btn(() => editor.chain().focus().setTextAlign("left").run(), a({ textAlign: "left" }), <AlignLeft size={16} />, "Align Left")}
        {btn(() => editor.chain().focus().setTextAlign("center").run(), a({ textAlign: "center" }), <AlignCenter size={16} />, "Align Center")}
        {btn(() => editor.chain().focus().setTextAlign("right").run(), a({ textAlign: "right" }), <AlignRight size={16} />, "Align Right")}

        <div style={{ flex: 1 }} />

        {btn(() => editor.chain().focus().undo().run(), null, <Undo size={16} />, "Undo")}
        {btn(() => editor.chain().focus().redo().run(), null, <Redo size={16} />, "Redo")}
      </div>}

      <div className="tiptap-editor-content">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .tiptap-editor-content {
          padding: 16px;
          min-height: 200px;
          cursor: text;
        }
        .tiptap-editor-content .ProseMirror {
          min-height: 170px;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          line-height: 1.6;
          color: #1e293b;
        }
        .tiptap-editor-content .ProseMirror:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .tiptap-editor-content .ProseMirror p {
          margin: 0 0 8px;
        }
        .tiptap-editor-content .ProseMirror h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 12px;
          line-height: 1.3;
          color: #0f172a;
        }
        .tiptap-editor-content .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 10px;
          line-height: 1.35;
          color: #0f172a;
        }
        .tiptap-editor-content .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 8px;
          line-height: 1.4;
          color: #0f172a;
        }
        .tiptap-editor-content .ProseMirror mark {
          background-color: #fef08a;
          padding: 0 2px;
          border-radius: 2px;
        }
        .tiptap-editor-content .ProseMirror strong {
          font-weight: 700;
        }
        .tiptap-editor-content .ProseMirror em {
          font-style: italic;
        }
        .tiptap-editor-content .ProseMirror u {
          text-decoration: underline;
        }
        .tiptap-editor-content .ProseMirror s {
          text-decoration: line-through;
        }
        .tiptap-editor-content .ProseMirror code {
          background-color: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: 'Consolas', 'Monaco', monospace;
          color: #e11d48;
        }
        .tiptap-editor-content .ProseMirror pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 0 0 16px;
        }
        .tiptap-editor-content .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: 0.875rem;
          font-family: 'Consolas', 'Monaco', monospace;
        }
        .tiptap-editor-content .ProseMirror ul,
        .tiptap-editor-content .ProseMirror ol {
          margin: 0 0 8px;
          padding-left: 24px;
        }
        .tiptap-editor-content .ProseMirror li {
          margin: 0 0 4px;
        }
        .tiptap-editor-content .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        .tiptap-editor-content .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .tiptap-editor-content .ProseMirror ul[data-type="taskList"] li label {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .tiptap-editor-content .ProseMirror ul[data-type="taskList"] li[data-checked] > div > p {
          text-decoration: line-through;
          color: #94a3b8;
        }
        .tiptap-editor-content .ProseMirror blockquote {
          border-left: 4px solid #e2e8f0;
          padding: 8px 16px;
          margin: 0 0 16px;
          color: #475569;
          font-style: italic;
        }
        .tiptap-editor-content .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 16px 0;
        }
        .tiptap-editor-content .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .tiptap-editor-content .ProseMirror a:hover {
          color: #1d4ed8;
        }
        .tiptap-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
        .tiptap-editor-content .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 0 0 16px;
        }
        .tiptap-editor-content .ProseMirror th,
        .tiptap-editor-content .ProseMirror td {
          border: 1px solid #cbd5e1 !important;
          padding: 12px 16px !important;
          min-width: 80px;
          vertical-align: top;
        }
        .tiptap-editor-content .ProseMirror th {
          background-color: #f8fafc !important;
          font-weight: 600;
          text-align: left;
          color: #1e293b !important;
        }
        .tiptap-editor-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
