"use client";

import { useState } from "react";

type CalendarEventOption = {
  label: string;
  value: string;
};

type CalendarEventFormValue = {
  id?: string;
  title: string;
  description: string;
  prompt: string;
  eventType: string;
  status: string;
  visibility: string;
  startsAt: string;
  endsAt: string;
};

type AdminCalendarEventModalButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  buttonClassName: string;
  buttonLabel: string;
  event?: CalendarEventFormValue;
  mode: "create" | "edit";
  returnTo: string;
  statusOptions: CalendarEventOption[];
  submitLabel: string;
  title: string;
  typeOptions: CalendarEventOption[];
  visibilityOptions: CalendarEventOption[];
};

const emptyEvent: CalendarEventFormValue = {
  title: "",
  description: "",
  prompt: "",
  eventType: "CONTENT",
  status: "SCHEDULED",
  visibility: "PUBLIC",
  startsAt: "",
  endsAt: "",
};

export function AdminCalendarEventModalButton({
  action,
  buttonClassName,
  buttonLabel,
  event,
  mode,
  returnTo,
  statusOptions,
  submitLabel,
  title,
  typeOptions,
  visibilityOptions,
}: AdminCalendarEventModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formValue = event ?? emptyEvent;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {buttonLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#211f1d]/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`calendar-${mode}-title`}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-[8px] border border-[#eadfd4] bg-white shadow-[0_24px_70px_rgba(33,31,29,0.28)]">
            <div className="border-b border-[#f2e8df] bg-[#fffaf6] px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
                Calendar management
              </p>
              <h2
                id={`calendar-${mode}-title`}
                className="mt-2 text-2xl font-black text-[#211f1d]"
              >
                {title}
              </h2>
            </div>

            <form action={action}>
              <div className="grid gap-3 px-5 py-5">
                {formValue.id ? (
                  <input type="hidden" name="eventId" value={formValue.id} />
                ) : null}
                <input type="hidden" name="returnTo" value={returnTo} />

                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                  Title
                  <input
                    required
                    name="title"
                    defaultValue={formValue.title}
                    className="h-10 w-full rounded-[6px] border border-[#eadfd4] px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
                  />
                </label>

                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                    Start date
                    <input
                      required
                      type="datetime-local"
                      name="startsAt"
                      defaultValue={formValue.startsAt}
                      className="h-10 w-full min-w-0 rounded-[6px] border border-[#eadfd4] px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
                    />
                  </label>
                  <label className="grid min-w-0 gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                    End date
                    <input
                      type="datetime-local"
                      name="endsAt"
                      defaultValue={formValue.endsAt}
                      className="h-10 w-full min-w-0 rounded-[6px] border border-[#eadfd4] px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <CalendarSelect
                    label="Type"
                    name="eventType"
                    options={typeOptions}
                    value={formValue.eventType}
                  />
                  <CalendarSelect
                    label="Status"
                    name="status"
                    options={statusOptions}
                    value={formValue.status}
                  />
                  <CalendarSelect
                    label="Visibility"
                    name="visibility"
                    options={visibilityOptions}
                    value={formValue.visibility}
                  />
                </div>

                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                  Description
                  <textarea
                    name="description"
                    defaultValue={formValue.description}
                    rows={3}
                    className="rounded-[6px] border border-[#eadfd4] px-3 py-2 text-sm font-bold normal-case leading-6 tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
                  />
                </label>

                <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73]">
                  Post idea
                  <textarea
                    name="prompt"
                    defaultValue={formValue.prompt}
                    rows={3}
                    className="rounded-[6px] border border-[#eadfd4] px-3 py-2 text-sm font-bold normal-case leading-6 tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#f2e8df] bg-[#fffaf6] px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-[6px] border border-[#eadfd4] bg-white px-4 py-2 text-sm font-black text-[#211f1d] transition hover:border-[#c45572] hover:text-[#c45572]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[6px] bg-[#211f1d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c45572]"
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CalendarSelect({
  label,
  name,
  options,
  value,
  className = "",
}: {
  className?: string;
  label: string;
  name: string;
  options: CalendarEventOption[];
  value: string;
}) {
  return (
    <label className={`grid min-w-0 gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8a7d73] ${className}`}>
      {label}
      <select
        name={name}
        defaultValue={value}
        className="h-10 w-full min-w-0 rounded-[6px] border border-[#eadfd4] bg-white px-3 text-sm font-bold normal-case tracking-normal text-[#211f1d] outline-none transition focus:border-[#c45572]"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}
