import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  BackgroundColor,
} from "@tiptap/extension-text-style";
import {
  ACCEPTED_IMAGE_TYPES,
  RAW_MAX_BYTES,
  ImageUploadError,
} from "../../utils/imageResize";
import { useImageCropper } from "../imageCrop/useImageCropper";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  TEXT_COLORS,
  HIGHLIGHT_COLORS,
  loadAllFonts,
} from "./textStyles";
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
  Baseline,
  Highlighter,
} from "lucide-react";

// 큰 사진은 올릴 때 자동으로 줄이므로(uploadImage 쪽, utils/imageResize.js) 원본은 20MB까지 받음
const ALLOWED_IMAGE_TYPES = ACCEPTED_IMAGE_TYPES;
const MAX_IMAGE_SIZE = RAW_MAX_BYTES;

/**
 * 블로그형 리치 텍스트 에디터 (TipTap)
 *
 * props
 * - initialHtml: 처음 보여줄 HTML
 * - onChange(html): 내용이 바뀔 때마다 호출. 비어 있으면 "" 전달
 * - uploadImage(file, { crop }): 이미지를 업로드하고 URL을 돌려주는 함수 (Promise<string>)
 *     crop은 자르기 창에서 고른 영역(자르지 않으면 undefined)
 *
 * 이미지는 툴바 버튼, 붙여넣기(Ctrl+V), 끌어다 놓기로 넣을 수 있습니다.
 * 이미지 파일은 uploadImage로 Storage에 올리고, 본문에는 URL만 들어갑니다.
 */
export default function RichTextEditor({ initialHtml, onChange, uploadImage }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState("");
  const { askCrop, cropDialog } = useImageCropper();

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
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      BackgroundColor,
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
    // 끌어다 놓은 경우 첫 사진은 놓은 위치에, 그다음 사진부터는 바로 앞 사진 뒤에 넣음
    let dropAt = position;
    const total = files.length;
    for (const [index, file] of files.entries()) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setMessage(`사진 파일(jpg, png, gif, webp)만 넣을 수 있습니다: ${file.name}`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setMessage(`20MB 이하 사진만 넣을 수 있습니다: ${file.name}`);
        continue;
      }
      // 자르기 창: 취소하면 이 사진은 넣지 않음 (GIF는 창 없이 그대로)
      const choice = await askCrop(file, index, total);
      if (choice.action === "cancel") continue;
      setUploading((n) => n + 1);
      setMessage("");
      try {
        const url = await uploadImage(file, {
          crop: choice.action === "crop" ? choice.crop : undefined,
        });
        // 현재 위치(선택된 사진이 있으면 그 뒤)에 넣음.
        // setImage는 방금 넣은 사진이 선택된 상태면 그 사진을 바꿔 버려서, 여러 장을 넣으면 마지막 한 장만 남았음
        const at = typeof dropAt === "number" ? dropAt : editor.state.selection.to;
        editor
          .chain()
          .focus()
          .insertContentAt(at, { type: "image", attrs: { src: url, alt: "" } }, { updateSelection: true })
          .run();
        dropAt = undefined;
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        setMessage(
          error instanceof ImageUploadError
            ? error.message
            : "사진을 올리지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요."
        );
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  useEffect(() => {
    insertFilesRef.current = insertFiles;
  });

  // 에디터에서는 글꼴 목록 전체를 미리보기할 수 있도록 모두 불러옴
  useEffect(() => {
    loadAllFonts();
  }, []);

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
            fontFamily: editor.getAttributes("textStyle").fontFamily || "",
            fontSize: editor.getAttributes("textStyle").fontSize || "",
            color: editor.getAttributes("textStyle").color || "",
            backgroundColor: editor.getAttributes("textStyle").backgroundColor || "",
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
      {cropDialog}
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
        <select
          title="글꼴"
          aria-label="글꼴"
          value={matchOption(FONT_FAMILIES, state.fontFamily)}
          onChange={(e) =>
            e.target.value
              ? c().setFontFamily(e.target.value).run()
              : c().unsetFontFamily().run()
          }
          className="h-8 rounded border border-gray-300 px-2 py-0 text-sm text-gray-700"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          title="글자 크기"
          aria-label="글자 크기"
          value={matchOption(FONT_SIZES, state.fontSize)}
          onChange={(e) =>
            e.target.value
              ? c().setFontSize(e.target.value).run()
              : c().unsetFontSize().run()
          }
          className="h-8 rounded border border-gray-300 px-2 py-0 text-sm text-gray-700"
        >
          {FONT_SIZES.map((s) => (
            <option key={s.label} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <ColorPicker
          title="글자 색"
          icon={<Baseline size={16} />}
          colors={TEXT_COLORS}
          current={state.color}
          onSelect={(v) => (v ? c().setColor(v).run() : c().unsetColor().run())}
          resetLabel="기본 색"
        />
        <ColorPicker
          title="형광펜"
          icon={<Highlighter size={16} />}
          colors={HIGHLIGHT_COLORS}
          current={state.backgroundColor}
          onSelect={(v) =>
            v ? c().setBackgroundColor(v).run() : c().unsetBackgroundColor().run()
          }
          resetLabel="형광펜 없음"
        />
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
          <span className="ml-2 text-sm text-blue-600">사진을 알맞은 크기로 줄여서 올리는 중… ({uploading})</span>
        )}
      </div>
      {message && <p className="px-4 pt-2 text-sm text-red-600">{message}</p>}
      <EditorContent editor={editor} className="px-4 py-3 min-h-[400px]" />
      <p className="px-4 pb-2 text-xs text-gray-400">
        이미지는 이미지 버튼, 붙여넣기(Ctrl+V), 끌어다 놓기로 넣을 수 있습니다. (jpeg·png·gif·webp, 20MB 이하 · 큰 사진은 자동으로 줄여서 올립니다)
      </p>
    </div>
  );
}

// 현재 값이 목록에 없으면(다른 곳에서 붙여넣은 글꼴 등) 빈 값으로 표시
// (글꼴 따옴표 종류·공백 차이는 무시)
function matchOption(options, value) {
  const norm = (s) => (s || "").replace(/["'\s]/g, "").toLowerCase();
  const found = options.find((o) => norm(o.value) === norm(value));
  return found ? found.value : "";
}

// 브라우저가 "rgb(28, 114, 68)" 형태로 돌려주는 색을 "#1c7244"로 맞춤
function toHex(color) {
  if (!color) return "";
  const m = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return color.toLowerCase();
  return "#" + m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
}

// 글자 색·형광펜 선택 팝업
function ColorPicker({ title, icon, colors, current, onSelect, resetLabel }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const choose = (value) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded hover:bg-gray-100 text-gray-600 flex flex-col items-center"
      >
        {icon}
        <span
          className="block w-4 h-1 mt-0.5 rounded-sm border border-gray-200"
          style={{ backgroundColor: current || "transparent" }}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((col) => (
              <button
                key={col.value}
                type="button"
                title={col.label}
                aria-label={`${title}: ${col.label}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(col.value)}
                className={`h-7 w-7 rounded border ${
                  toHex(current) === col.value.toLowerCase()
                    ? "ring-2 ring-blue-500 border-white"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: col.value }}
              />
            ))}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose("")}
            className="mt-2 w-full rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            {resetLabel}
          </button>
        </div>
      )}
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
