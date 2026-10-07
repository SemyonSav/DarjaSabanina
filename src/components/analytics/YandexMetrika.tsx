"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const COUNTER_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
const NOTICE_KEY = "cookie-notice-accepted";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

/** Уведомление об использовании cookie (Метрика собирает обезличенные данные) */
function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!localStorage.getItem(NOTICE_KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;
  return (
    <div
      role="region"
      aria-label="Уведомление о cookie"
      className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-[1.25rem] border border-border bg-card p-4 text-sm shadow-soft sm:flex-row sm:items-center md:bottom-6"
    >
      <p className="flex-1 text-muted-foreground">
        Сайт использует cookie и Яндекс.Метрику, чтобы понимать, какие материалы
        полезны.
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(NOTICE_KEY, "1");
          } catch {}
          setVisible(false);
        }}
        className="h-10 shrink-0 rounded-[0.9rem] bg-accent px-5 font-medium text-accent-foreground transition hover:brightness-105"
      >
        Понятно
      </button>
    </div>
  );
}

/** Яндекс.Метрика: подключается, только если задан номер счётчика */
export function YandexMetrika() {
  const pathname = usePathname();
  const counter = Number(COUNTER_ID);

  // Первый просмотр Метрика считает сама при init,
  // дальнейшие переходы внутри SPA отправляем вручную
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (counter && window.ym) window.ym(counter, "hit", window.location.href);
  }, [pathname, counter]);

  if (!counter) return null;
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${counter},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`}
      </Script>
      <CookieNotice />
    </>
  );
}
