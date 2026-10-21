/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
"use client";

import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

function CalendarGlyph() {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function Chevron({ flip = false }: { flip?: boolean }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function DatePicker({ name, label, required = false, minToday = true, placeholder = "Select a date" }: {
  name: string;
  label: string;
  required?: boolean;
  minToday?: boolean;
  placeholder?: string;
}) {
  const today = new Date();
  const todayIso = toIso(today);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(todayIso);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const panelId = useId();

  const view = fromIso(focused);
  const monthStart = new Date(view.getFullYear(), view.getMonth(), 1);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const isDisabled = (iso: string) => minToday && iso < todayIso;

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) gridRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${focused}"]`)?.focus();
  }, [open, focused]);

  useEffect(() => {
    proxyRef.current?.setCustomValidity(required && !value ? "Choose the date this prayer request relates to." : "");
  }, [required, value]);

  const toggle = () => {
    setFocused(value || todayIso);
    setOpen((current) => !current);
  };

  const choose = (iso: string) => {
    if (isDisabled(iso)) return;
    setValue(iso);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = fromIso(focused);
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(current, -1),
      ArrowRight: () => addDays(current, 1),
      ArrowUp: () => addDays(current, -7),
      ArrowDown: () => addDays(current, 7),
      Home: () => addDays(current, -current.getDay()),
      End: () => addDays(current, 6 - current.getDay()),
      PageUp: () => addMonths(current, -1),
      PageDown: () => addMonths(current, 1),
    };
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setFocused(toIso(move()));
  };

  const shown = value
    ? fromIso(value).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : placeholder;
  const monthLabel = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const canGoBack = !minToday || monthStart > new Date(today.getFullYear(), today.getMonth(), 1);

  return <div className="field full date-picker" ref={wrapRef}>
    <span id={labelId}>{label}</span>
    <button
      ref={triggerRef}
      type="button"
      className={`date-picker-trigger${value ? " has-value" : ""}${open ? " is-open" : ""}`}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={panelId}
      aria-labelledby={`${labelId} ${panelId}-value`}
      onClick={toggle}
    >
      <CalendarGlyph />
      <span id={`${panelId}-value`}>{shown}</span>
      <Chevron flip={false} />
    </button>
    <input
      ref={proxyRef}
      className="date-picker-proxy"
      name={name}
      value={value}
      required={required}
      onChange={() => undefined}
      onInvalid={() => { setFocused(value || todayIso); setOpen(true); }}
      tabIndex={-1}
      aria-hidden="true"
    />
    {open ? <div className="date-picker-panel" id={panelId} role="dialog" aria-label={`Choose ${label.toLowerCase()}`}>
      <header>
        <button type="button" onClick={() => setFocused(toIso(addMonths(view, -1)))} disabled={!canGoBack} aria-label="Previous month"><Chevron flip /></button>
        <strong aria-live="polite">{monthLabel}</strong>
        <button type="button" onClick={() => setFocused(toIso(addMonths(view, 1)))} aria-label="Next month"><Chevron /></button>
      </header>
      <div className="date-picker-grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
        <div className="date-picker-row is-head" role="row">
          {WEEKDAYS.map((day) => <span key={day} role="columnheader" aria-label={day}>{day.slice(0, 2)}</span>)}
        </div>
        {Array.from({ length: 6 }, (_, week) => <div className="date-picker-row" role="row" key={week}>
          {days.slice(week * 7, week * 7 + 7).map((day) => {
            const iso = toIso(day);
            const outside = day.getMonth() !== view.getMonth();
            const classes = ["date-picker-day", outside && "is-outside", iso === todayIso && "is-today", iso === value && "is-selected"].filter(Boolean).join(" ");
            return <button
              key={iso}
              type="button"
              role="gridcell"
              data-iso={iso}
              className={classes}
              tabIndex={iso === focused ? 0 : -1}
              aria-selected={iso === value}
              aria-current={iso === todayIso ? "date" : undefined}
              aria-label={day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              disabled={isDisabled(iso)}
              onClick={() => choose(iso)}
            >{day.getDate()}</button>;
          })}
        </div>)}
      </div>
      <footer>
        <button type="button" className="text-button" onClick={() => choose(todayIso)}>Today</button>
        {value ? <button type="button" className="text-button is-muted" onClick={() => { setValue(""); setOpen(false); triggerRef.current?.focus(); }}>Clear</button> : null}
      </footer>
    </div> : null}
  </div>;
}
