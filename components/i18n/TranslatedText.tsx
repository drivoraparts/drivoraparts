"use client";

import { useEffect, useState } from "react";
import { BASE_LANGUAGE } from "@/lib/i18n/constants";
import { useLanguageStore } from "@/lib/store/languageStore";

type TranslatedTextProps = {
  children: string;
  className?: string;
  as?: keyof HTMLElementTagNameMap;
};

export default function TranslatedText({
  children,
  className,
  as: Tag = "span",
}: TranslatedTextProps) {
  const language = useLanguageStore((s) => s.language);
  const [text, setText] = useState(children);

  useEffect(() => {
    setText(children);

    if (language === BASE_LANGUAGE || !children.trim()) {
      return;
    }

    let active = true;

    void useLanguageStore
      .getState()
      .translateText(children)
      .then((value) => {
        if (active) setText(value);
      });

    return () => {
      active = false;
    };
  }, [children, language]);

  return <Tag className={className}>{text}</Tag>;
}
