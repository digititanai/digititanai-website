'use client'

import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { BlockNoteEditor } from '@blocknote/core'
import '@blocknote/mantine/style.css'
import { useRef, useCallback, useState, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [ready, setReady] = useState(false)
  const isInternalChange = useRef(false)
  const initialValueRef = useRef(value)

  const editor: BlockNoteEditor = useCreateBlockNote({
    domAttributes: {
      editor: { class: 'bn-dark-editor' },
    },
    uploadFile: async (file: File) => {
      // Upload pasted/dropped images to Supabase Storage
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          return data.url
        }
      } catch {}
      return ''
    },
  })

  // Load initial content from markdown using BlockNote's built-in parser
  useEffect(() => {
    if (ready) return
    const loadContent = async () => {
      if (initialValueRef.current?.trim()) {
        try {
          const content = initialValueRef.current
          // Detect HTML vs markdown
          const isHTML = content.trim().startsWith('<')
          const blocks = isHTML
            ? await editor.tryParseHTMLToBlocks(content)
            : await editor.tryParseMarkdownToBlocks(content)
          editor.replaceBlocks(editor.document, blocks)
        } catch {
          // If parsing fails, just leave the editor empty
        }
      }
      setReady(true)
    }
    loadContent()
  }, [editor, ready])

  // Convert blocks → markdown using BlockNote's built-in serializer
  const handleChange = useCallback(async () => {
    if (!ready) return
    isInternalChange.current = true
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document)
      onChange(md)
    } catch {
      // Fallback: ignore conversion errors
    }
    setTimeout(() => { isInternalChange.current = false }, 0)
  }, [editor, onChange, ready])

  return (
    <div className="bn-container rounded-xl border border-brand-mid/[0.06]" style={{ position: 'relative' }}>
      <style>{`
        .bn-container {
          max-width: 100%;
        }
        .bn-container .bn-editor {
          background: rgba(8, 20, 15, 0.4);
          color: #E8DCC8;
          font-size: 14px;
          line-height: 1.75;
          min-height: 150px;
          padding: 16px 8px;
        }
        /* Spacing between blocks */
        .bn-container .bn-editor [class*="blockOuter"] {
          margin-bottom: 4px;
        }
        .bn-container .bn-editor [class*="blockGroup"] {
          padding-left: 20px;
        }
        .bn-container .bn-editor [class*="inlineContent"] {
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          padding: 2px 0;
        }
        .bn-container .bn-editor [class*="blockContent"] {
          font-size: 14px;
          line-height: 1.75;
          overflow-wrap: break-word;
          word-break: break-word;
          padding: 2px 4px;
        }
        /* Headings */
        .bn-container .bn-editor [data-content-type="heading"] [class*="inlineContent"] {
          font-size: 16px;
          font-weight: 600;
          padding: 6px 0 2px;
        }
        /* Lists - tighter spacing within */
        .bn-container .bn-editor [data-content-type="bulletListItem"] [class*="blockContent"],
        .bn-container .bn-editor [data-content-type="numberedListItem"] [class*="blockContent"] {
          padding: 1px 4px;
        }
        /* Code blocks */
        .bn-container .bn-editor [data-content-type="codeBlock"] {
          margin: 8px 0;
          border-radius: 8px;
          overflow: hidden;
        }
        /* Placeholder text */
        .bn-container .bn-editor [class*="inlineContent"]::before {
          color: rgba(232, 220, 200, 0.25) !important;
          font-size: 14px;
        }
        .bn-container .bn-editor [class*="isEmpty"]::before {
          font-style: normal;
        }
        /* Side menu drag handle */
        .bn-container [class*="sideMenu"] {
          opacity: 0.4;
        }
        .bn-container [class*="sideMenu"]:hover {
          opacity: 0.8;
        }
        /* Force all BlockNote popups/dropdowns above the admin sidebar */
        [class*="mantine-Popover-dropdown"],
        [class*="mantine-Menu-dropdown"],
        [data-radix-popper-content-wrapper],
        .bn-container [class*="dragHandleMenu"],
        .tippy-box,
        [data-tippy-root] {
          z-index: 100 !important;
        }
        /* Slash menu and toolbar dark theme overrides */
        .bn-container [class*="mantine"],
        [data-radix-popper-content-wrapper] [class*="mantine"] {
          --mantine-color-body: #0E1F18;
        }
      `}</style>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="dark"
        data-placeholder={placeholder || 'Type / for commands...'}
      />
    </div>
  )
}
