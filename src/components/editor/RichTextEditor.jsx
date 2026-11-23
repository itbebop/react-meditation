import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 블로그형 리치 텍스트 에디터 (TipTap)
 *
 * props
 * - initialHtml: 처음 보여줄 HTML
 * - onChange(html): 내용이 바뀔 때마다 호출. 비어 있으면 "" 전달
 * - uploadImage(file): 이미지를 업로드하고 URL을 돌려주는 함수 (Promise<string>)
 *
 * 이미지는 툴바 버튼, 붙여넣기(Ctrl+V), 끌어다 놓기로 넣을 수 있습니다.
 * 이미지 파일은 uploadImage로 Storage에 올리고, 본문에는 URL만 들어갑니다.
 */
export default function RichTextEditor({ initialHtml, onChange, uploadImage }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState("");

  // handlePaste/handleDrop은 에디터 생성 시 한 번 등록되므로 최신 함수를 ref로 참조
  const insertFilesRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialHtml || "",
    editorProps: {
      attributes: {
        class: "rich-content rich-editor focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const files = imageFilesFrom(event.clipboardData);
        if (files.length === 0) return false;
        event.preventDefault();
        insertFilesRef.current?.(files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = imageFilesFrom(event.dataTransfer);
        if (files.length === 0) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        insertFilesRef.current?.(files, pos?.pos);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  const insertFiles = async (files, position) => {
    if (!editor) return;
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setMessage(`허용되지 않는 형식입니다: ${file.name} (jpeg, png, gif, webp)`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setMessage(`5MB 이하 이미지만 넣을 수 있습니다: ${file.name}`);
        continue;
      }
      setUploading((n) => n + 1);
      setMessage("");
      try {
        const url = await uploadImage(file);
        const chain = editor.chain().focus();
        if (typeof position === "number") {
          chain.insertContentAt(position, { type: "image", attrs: { src: url, alt: "" } }).run();
        } else {
          chain.setImage({ src: url, alt: "" }).run();
        }
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        setMessage(`이미지 업로드 실패: ${error.message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  useEffect(() => {
    insertFilesRef.current = insertFiles;
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            paragraph: editor.isActive("paragraph"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            alignLeft: editor.isActive({ textAlign: "left" }),
            alignCenter: editor.isActive({ textAlign: "center" }),
            alignRight: editor.isActive({ textAlign: "right" }),
            link: editor.isActive("link"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : {},
  });

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href || "";
    const url = window.prompt("링크 주소를 입력하세요 (비우면 링크 해제)", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const c = () => editor.chain().focus();

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 sticky top-0 bg-white z-10 rounded-t-lg">
        <ToolButton title="본문" active={state.paragraph} onClick={() => c().setParagraph().run()}>
          <Pilcrow size={16} />
        </ToolButton>
        <ToolButton title="큰 제목" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton title="작은 제목" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolButton>
        <Divider />
        <ToolButton title="굵게 (Ctrl+B)" active={state.bold} onClick={() => c().toggleBold().run()}>
          <Bold size={16} />
        </ToolButton>
        <ToolButton title="기울임 (Ctrl+I)" active={state.italic} onClick={() => c().toggleItalic().run()}>
          <Italic size={16} />
        </ToolButton>
        <ToolButton title="밑줄 (Ctrl+U)" active={state.underline} onClick={() => c().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolButton>
        <ToolButton title="취소선" active={state.strike} onClick={() => c().toggleStrike().run()}>
          <Strikethrough size={16} />
        </ToolButton>
        <Divider />
        <ToolButton title="글머리 목록" active={state.bulletList} onClick={() => c().toggleBulletList().run()}>
          <List size={16} />
        </ToolButton>
        <ToolButton title="번호 목록" active={state.orderedList} onClick={() => c().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton title="인용" active={state.blockquote} onClick={() => c().toggleBlockquote().run()}>
          <Quote size={16} />
        </ToolButton>
        <ToolButton title="구분선" onClick={() => c().setHorizontalRule().run()}>
          <Minus size={16} />
        </ToolButton>
        <Divider />
        <ToolButton title="왼쪽 정렬" active={state.alignLeft} onClick={() => c().setTextAlign("left").run()}>
          <AlignLeft size={16} />
        </ToolButton>
        <ToolButton title="가운데 정렬" active={state.alignCenter} onClick={() => c().setTextAlign("center").run()}>
          <AlignCenter size={16} />
        </ToolButton>
        <ToolButton title="오른쪽 정렬" active={state.alignRight} onClick={() => c().setTextAlign("right").run()}>
          <AlignRight size={16} />
        </ToolButton>
        <Divider />
        <ToolButton title="링크" active={state.link} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolButton>
        <ToolButton title="이미지 넣기" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={16} />
        </ToolButton>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (files.length) insertFiles(files);
          }}
        />
        <Divider />
        <ToolButton title="실행 취소 (Ctrl+Z)" disabled={!state.canUndo} onClick={() => c().undo().run()}>
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton title="다시 실행 (Ctrl+Y)" disabled={!state.canRedo} onClick={() => c().redo().run()}>
          <Redo2 size={16} />
        </ToolButton>
        {uploading > 0 && (
          <span className="ml-2 text-sm text-blue-600">이미지 업로드 중… ({uploading})</span>
        )}
      </div>
      {message && <p className="px-4 pt-2 text-sm text-red-600">{message}</p>}
      <EditorContent editor={editor} className="px-4 py-3 min-h-[400px]" />
      <p className="px-4 pb-2 text-xs text-gray-400">
        이미지는 이미지 버튼, 붙여넣기(Ctrl+V), 끌어다 놓기로 넣을 수 있습니다. (jpeg·png·gif·webp, 5MB 이하)
      </p>
    </div>
  );
}

function imageFilesFrom(dataTransfer) {
  return Array.from(dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"));
}

function ToolButton({ title, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent ${
        active ? "bg-gray-200 text-gray-900" : "text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />;
}
