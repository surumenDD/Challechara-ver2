"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { updateEpisode } from "@/lib/api/episodes";

interface RichEditorProps {
  bookId: string;
}

export default function RichEditor({ bookId }: RichEditorProps) {
  const { books, activeEpisodeId, refreshBookFromBackend } = useStore();
  const [showRubyModal, setShowRubyModal] = useState(false);
  const [rubyText, setRubyText] = useState("");
  const [content, setContent] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const book = books.find((b) => b.id === bookId);
  const activeEpisode = book?.episodes?.find((e) => e.id === activeEpisodeId);

  // セキュリティ定数
  const MAX_CONTENT_LENGTH = 1000000; // 100万文字
  const MAX_RUBY_LENGTH = 50;
  const MAX_SELECTION_LENGTH = 100;

  // HTMLエスケープ関数
  const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // HTMLアンエスケープ関数（安全版）
  const unescapeHtml = (html: string): string => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // HTMLからなろう記法のプレーンテキストに変換
  const convertFromHtml = useCallback((html: string): string => {
    if (!html || html.length > MAX_CONTENT_LENGTH) return "";

    let text = html;

    // <ruby>タグをルビ記法に変換（長さ制限付き）
    text = text.replace(
      /<ruby>([^<]{1,100})<rt>([^<]{1,50})<\/rt><\/ruby>/g,
      "|$1《$2》"
    );

    // 傍点を記法に変換（長さ制限付き）- 各文字に《・》をつける形式に変換
    text = text.replace(
      /<em class="sesame-dot">([^<]{1,100})<\/em>/g,
      (match, content) => {
        return content
          .split("")
          .map((char: string) => char + "《・》")
          .join("");
      }
    );

    // <br>タグを改行に
    text = text.replace(/<br\s*\/?>/gi, "\n");

    // <p>タグを段落区切りに
    text = text.replace(/<\/p>\s*<p>/gi, "\n\n");
    text = text.replace(/<\/?p>/gi, "");

    // その他のHTMLタグを除去
    text = text.replace(/<[^>]+>/g, "");

    // HTMLエンティティをデコード（安全版）
    return unescapeHtml(text);
  }, []);

  // なろう記法のプレーンテキストをHTMLに変換
  const convertToHtml = useCallback((text: string): string => {
    if (!text || text.length > MAX_CONTENT_LENGTH) return "<p></p>";

    // まずHTMLエスケープ
    let html = escapeHtml(text);

    // ルビ記法: |漢字《かんじ》 → <ruby>漢字<rt>かんじ</rt></ruby>（長さ制限付き）
    html = html.replace(
      /\|([^《]{1,100})《([^》]{1,50})》/g,
      "<ruby>$1<rt>$2</rt></ruby>"
    );

    // 傍点記法: 強《・》調《・》 → <em class="sesame-dot">強調</em>
    // 連続する「文字《・》」パターンを検出してまとめる
    html = html.replace(/(.《・》)+/g, (match) => {
      const chars =
        match
          .match(/(.)《・》/g)
          ?.map((m) => m.charAt(0))
          .join("") || "";
      return `<em class="sesame-dot">${chars}</em>`;
    });

    // 段落分け（改行2回）
    const paragraphs = html.split("\n\n").slice(0, 10000); // 段落数制限
    return paragraphs
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }, []);

  // アクティブエピソード変更時に内容を更新
  useEffect(() => {
    if (activeEpisode) {
      setContent(convertFromHtml(activeEpisode.content));
    } else {
      setContent("");
    }
  }, [activeEpisode?.id, activeEpisode?.content, convertFromHtml]);

  // 自動保存処理
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;

    // 入力サイズ制限
    if (newContent.length > MAX_CONTENT_LENGTH) {
      alert(`文字数制限: ${MAX_CONTENT_LENGTH.toLocaleString()}文字まで`);
      return;
    }

    setContent(newContent);

    if (activeEpisode) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const htmlContent = convertToHtml(newContent);
        try {
          await updateEpisode(activeEpisode.id, { content: htmlContent });
          await refreshBookFromBackend(bookId);
        } catch (error) {
          console.error("Failed to save episode:", error);
        }
      }, 1000);
    }
  };

  // コンポーネントアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ルビ振り機能
  const handleAddRuby = useCallback(() => {
    if (!textareaRef.current || !activeEpisode) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText && selectedText.trim()) {
      setSelectionStart(start);
      setSelectionEnd(end);
      setShowRubyModal(true);
    } else {
      alert("ルビを振りたい文字を選択してください");
    }
  }, [content, activeEpisode]);

  const applyRuby = useCallback(() => {
    if (!rubyText.trim()) return;

    // ルビの長さ制限
    if (rubyText.length > MAX_RUBY_LENGTH) {
      alert(`ルビは${MAX_RUBY_LENGTH}文字以内にしてください`);
      return;
    }

    const selectedText = content.substring(selectionStart, selectionEnd);

    // 選択テキストの長さ制限
    if (selectedText.length > MAX_SELECTION_LENGTH) {
      alert(
        `ルビを振るテキストは${MAX_SELECTION_LENGTH}文字以内にしてください`
      );
      return;
    }

    const rubyNotation = `|${selectedText}《${rubyText}》`;
    const before = content.substring(0, selectionStart);
    const after = content.substring(selectionEnd);
    const newContent = before + rubyNotation + after;

    setContent(newContent);
    setShowRubyModal(false);
    setRubyText("");

    // 自動保存をトリガー
    if (activeEpisode) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const htmlContent = convertToHtml(newContent);
        try {
          await updateEpisode(activeEpisode.id, { content: htmlContent });
          await refreshBookFromBackend(bookId);
        } catch (error) {
          console.error("Failed to save episode:", error);
        }
      }, 500);
    }

    // カーソル位置を調整
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = selectionStart + rubyNotation.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  }, [
    content,
    selectionStart,
    selectionEnd,
    rubyText,
    activeEpisode,
    bookId,
    convertToHtml,
    refreshBookFromBackend,
  ]);

  // 傍点機能
  const handleAddEmphasis = useCallback(() => {
    if (!textareaRef.current || !activeEpisode) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText && selectedText.trim()) {
      // 選択テキストの長さ制限
      if (selectedText.length > MAX_SELECTION_LENGTH) {
        alert(
          `傍点を付けるテキストは${MAX_SELECTION_LENGTH}文字以内にしてください`
        );
        return;
      }

      // 漢字のみに《・》をつける形式に変換
      const emphasisNotation = selectedText
        .split("")
        .map((char) => {
          // 漢字判定: Unicode範囲で判定
          const isKanji = /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(char);
          return isKanji ? char + "《・》" : char;
        })
        .join("");

      const before = content.substring(0, start);
      const after = content.substring(end);
      const newContent = before + emphasisNotation + after;

      setContent(newContent);

      // カーソル位置を調整
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = start + emphasisNotation.length;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else {
      alert("傍点をつけたい文字を選択してください");
    }
  }, [content, activeEpisode]);

  const getCharCount = () => {
    return content.length;
  };

  // なろう形式でエクスポート
  const handleExportForNarou = useCallback(() => {
    if (!activeEpisode) return;

    // すでになろう記法なのでそのまま使用
    const exportContent = content.trim();

    // ファイル名をサニタイズ（パストラバーサル対策）
    const sanitizeFilename = (name: string) => {
      return name.replace(/[<>:"\/\\|?*\x00-\x1f]/g, "_").substring(0, 255);
    };

    // ファイルダウンロード（UTF-8 BOM付き - なろうで文字化け防止）
    const bom = "\uFEFF";
    const blob = new Blob([bom + exportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(activeEpisode.title || "episode") + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, activeEpisode]);

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー - なろう風シンプル版 */}
      <div className="p-2 border-b border-gray-200 bg-gray-50 flex gap-2 items-center">
        {/* ルビ振り */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRuby}
          title="選択したテキストにルビを振る"
          disabled={!activeEpisode}
        >
          ルビ
        </Button>

        {/* 傍点 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddEmphasis}
          title="選択したテキストに傍点をつける"
          disabled={!activeEpisode}
        >
          傍点
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* なろう形式エクスポート */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportForNarou}
          title="小説家になろう形式でダウンロード"
          disabled={!activeEpisode}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          なろう形式
        </Button>

        <div className="flex-1" />

        {/* 使い方の説明 */}
        <div className="text-xs text-gray-500 hidden sm:flex items-center gap-2">
          <span>💡 ルビ: |漢字《かんじ》 / 傍点: 強《・》調《・》</span>
        </div>
      </div>

      {/* エディタエリア */}
      <div className="flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          disabled={!activeEpisode}
          placeholder={
            activeEpisode
              ? "本文を入力してください...\n\n改行2回で段落が分かれます。\n\nルビ: |漢字《かんじ》\n傍点: 強《・》調《・》"
              : "エピソードを選択してください..."
          }
          className="w-full h-full p-8 resize-none focus:outline-none font-serif text-base leading-loose border-none disabled:bg-gray-50 disabled:text-gray-400"
          style={{
            fontSize: "16px",
            lineHeight: "2",
            fontFamily:
              "'Noto Serif JP', 'Yu Mincho', YuMincho, 'Hiragino Mincho ProN', 'MS PMincho', serif",
          }}
        />
      </div>

      {/* フッター */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {activeEpisode ? "自動保存中..." : ""}
        </span>
        <span className="text-sm text-gray-600">
          {getCharCount().toLocaleString()} 文字
        </span>
      </div>

      {/* ルビ振りモーダル */}
      {showRubyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">ルビ振り</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRubyModal(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ルビ</label>
                <Input
                  value={rubyText}
                  onChange={(e) => setRubyText(e.target.value)}
                  placeholder="ふりがなを入力..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyRuby();
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  形式: |漢字《かんじ》
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowRubyModal(false)}>
                  キャンセル
                </Button>
                <Button
                  variant="default"
                  onClick={applyRuby}
                  disabled={!rubyText.trim()}
                >
                  適用
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
