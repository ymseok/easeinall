// 줄 종결자 및 특수 문자 정규식
export const INVALID_CHARACTERS = {
  LS: "\u2028", // Line Separator
  PS: "\u2029", // Paragraph Separator
} as const;

export function checkLineSeparators(text: string) {
  if (typeof text !== "string") {
    return {
      hasInvalidSeparators: false,
      markedText: String(text),
      details: [],
    };
  }

  const details: Array<{ char: string; position: number; name: string }> = [];

  Array.from(text).forEach((char, index) => {
    const code = char.charCodeAt(0);

    if (code === 0x2028) {
      details.push({ char, position: index, name: "LS" }); // Line Separator
    } else if (code === 0x2029) {
      details.push({ char, position: index, name: "PS" }); // Paragraph Separator
    } else if (code === 0x000b) {
      details.push({ char, position: index, name: "VT" }); // Vertical tabulation
    }
  });

  if (details.length > 0) {
    console.info("Invalid separators found:", {
      text: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
      details,
    });
  }

  let markedText = text;
  details
    .sort((a, b) => b.position - a.position)
    .forEach(({ position, name }) => {
      const before = markedText.slice(0, position);
      const after = markedText.slice(position + 1);
      markedText = `${before}<span class="inline-block bg-red-200 px-1 py-0.5 mx-0.5 rounded text-red-800 font-bold" title="${name}">[${name}]</span>${after}`;
    });

  return {
    hasInvalidSeparators: details.length > 0,
    markedText,
    details,
  };
}

// 디버그용 함수 추가
export function debugText(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      return `${char}(U+${code.toString(16).padStart(4, "0")})`;
    })
    .join(" ");
}
