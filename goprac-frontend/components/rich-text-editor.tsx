"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const RichTextEditorComponent = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px] p-4',
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when value changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const { from, to } = editor.state.selection
      editor.commands.setContent(value, { emitUpdate: false })
      // Restore cursor position if possible
      if (from === to) {
        editor.commands.setTextSelection({ from: Math.min(from, editor.state.doc.content.size), to: Math.min(to, editor.state.doc.content.size) })
      }
    }
  }, [editor, value])

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // Validate URL format
    let validUrl = url
    if (!/^https?:\/\//i.test(url)) {
      validUrl = 'https://' + url
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run()
  }

  return (
    <div className={cn("border rounded-md bg-white", className)}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-muted' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="tiptap-editor" />
      
      <style jsx global>{`
        .tiptap-editor .tiptap.ProseMirror {
          outline: none;
        }
        
        .tiptap-editor .tiptap.ProseMirror:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        
        .tiptap-editor .tiptap.ProseMirror p {
          margin: 0.75em 0;
        }
        
        .tiptap-editor .tiptap.ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .tiptap-editor .tiptap.ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .tiptap-editor .tiptap.ProseMirror ul,
        .tiptap-editor .tiptap.ProseMirror ol {
          padding-left: 2rem;
          margin: 0.75em 0;
        }
        
        .tiptap-editor .tiptap.ProseMirror ul {
          list-style-type: disc;
        }
        
        .tiptap-editor .tiptap.ProseMirror ol {
          list-style-type: decimal;
        }
        
        .tiptap-editor .tiptap.ProseMirror ul li,
        .tiptap-editor .tiptap.ProseMirror ol li {
          display: list-item;
          margin: 0.25em 0;
          line-height: 1.5;
        }
        
        .tiptap-editor .tiptap.ProseMirror ul ul,
        .tiptap-editor .tiptap.ProseMirror ol ol {
          margin: 0.25em 0;
        }
        
        .tiptap-editor .tiptap.ProseMirror strong {
          font-weight: 700;
        }
        
        .tiptap-editor .tiptap.ProseMirror em {
          font-style: italic;
        }
        
        .tiptap-editor .tiptap.ProseMirror u {
          text-decoration: underline;
        }
        
        .tiptap-editor .tiptap.ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .tiptap-editor .tiptap.ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .tiptap-editor .tiptap.ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        .tiptap-editor .tiptap.ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 0.75em 0;
          line-height: 1.3;
        }
        
        .tiptap-editor .tiptap.ProseMirror h3 {
          font-size: 1.17em;
          font-weight: 700;
          margin: 0.83em 0;
          line-height: 1.4;
        }
        
        .tiptap-editor .tiptap.ProseMirror [style*="text-align: left"] {
          text-align: left;
        }
        
        .tiptap-editor .tiptap.ProseMirror [style*="text-align: center"] {
          text-align: center;
        }
        
        .tiptap-editor .tiptap.ProseMirror [style*="text-align: right"] {
          text-align: right;
        }
        
        .tiptap-editor .tiptap.ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .tiptap-editor .tiptap.ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        
        .tiptap-editor .tiptap.ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

export const RichTextEditor = memo(RichTextEditorComponent)
