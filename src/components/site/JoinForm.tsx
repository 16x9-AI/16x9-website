import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { submitJoinApplication } from "@/lib/joinApplication";

type FieldKey = "name" | "email" | "field01" | "field02" | "field03";

type FormState = Record<FieldKey, string>;

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  field01: "",
  field02: "",
  field03: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const promptFields: { key: FieldKey; label: string; prompt: string }[] = [
  {
    key: "field01",
    label: "Field 01",
    prompt: "Describe a synthesis you've made across two unrelated fields.",
  },
  {
    key: "field02",
    label: "Field 02",
    prompt: "Tell us about something you built that nobody asked for.",
  },
  {
    key: "field03",
    label: "Field 03",
    prompt: "What did you teach yourself last year, and what did it replace?",
  },
];

function validate(form: FormState): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  if (!form.name.trim()) errors.name = "Required.";
  if (!form.email.trim()) errors.email = "Required.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email.";
  if (!form.field01.trim()) errors.field01 = "Required.";
  if (!form.field02.trim()) errors.field02 = "Required.";
  if (!form.field03.trim()) errors.field03 = "Required.";
  return errors;
}

const underlineInput =
  "w-full resize-none border-0 border-b border-ink/30 bg-transparent py-2 font-sans text-[15px] leading-relaxed text-ink outline-none transition-colors placeholder:text-graphite/50 focus-visible:border-ink data-[error=true]:border-ink data-[error=true]:border-b-2";

const underlineTextarea = `${underlineInput} overflow-hidden`;

const monoLabel = "font-mono text-[11px] uppercase tracking-[0.14em] text-graphite";

function autosizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function JoinForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [honeypot, setHoneypot] = useState("");
  const confirmationRef = useRef<HTMLDivElement | null>(null);
  const textareaRefs = useRef<Partial<Record<FieldKey, HTMLTextAreaElement>>>({});
  const formId = useId();

  useLayoutEffect(() => {
    Object.values(textareaRefs.current).forEach(autosizeTextarea);
  }, []);

  const setField = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (e.target instanceof HTMLTextAreaElement) autosizeTextarea(e.target);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const result = await submitJoinApplication({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          field01: form.field01.trim(),
          field02: form.field02.trim(),
          field03: form.field03.trim(),
          company: honeypot,
        },
      });

      if (result.ok) {
        setStatus("success");
        requestAnimationFrame(() => confirmationRef.current?.focus());
        return;
      }

      setStatus("error");
      if (result.error === "not_configured") {
        setErrorMessage("Applications are not open yet. Check back soon.");
      } else if (result.error === "validation") {
        setErrorMessage(result.message);
      } else {
        setErrorMessage("Something went wrong sending that. Try again in a moment.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong sending that. Try again in a moment.");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        role="status"
        className="border-t border-ink/80 py-10 outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
      >
        <p className="font-editorial text-[26px] uppercase leading-[1.05] tracking-tight text-ink md:text-[30px]">
          Received.
        </p>
        <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink md:text-[16px]">
          If it resonates, you'll hear from us.
        </p>
      </div>
    );
  }

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="divide-y divide-ink/30 border-t border-ink/80">
      {/* Honeypot - hidden from real applicants, visible to bots that fill every field. */}
      <div className="relative h-0 w-0 overflow-hidden">
        <div aria-hidden="true" className="absolute -left-[9999px] top-0">
          <label htmlFor={`${formId}-company`}>Company</label>
          <input
            id={`${formId}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 py-5">
        <label htmlFor={`${formId}-name`} className={monoLabel}>
          Name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={setField("name")}
          disabled={isSubmitting}
          data-error={Boolean(errors.name)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          className={underlineInput}
        />
        {errors.name && (
          <p id={`${formId}-name-error`} className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink">
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 py-5">
        <label htmlFor={`${formId}-email`} className={monoLabel}>
          Email / So we can reply
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={setField("email")}
          disabled={isSubmitting}
          data-error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          className={underlineInput}
        />
        {errors.email && (
          <p id={`${formId}-email-error`} className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink">
            {errors.email}
          </p>
        )}
      </div>

      {promptFields.map((field) => (
        <div key={field.key} className="flex flex-col gap-2 py-5">
          <label htmlFor={`${formId}-${field.key}`} className={monoLabel}>
            {field.label}
          </label>
          <span className="max-w-[52ch] text-[15px] leading-relaxed text-ink md:text-[16px]">
            {field.prompt}
          </span>
          <textarea
            id={`${formId}-${field.key}`}
            name={field.key}
            rows={1}
            ref={(el) => {
              if (el) {
                textareaRefs.current[field.key] = el;
                autosizeTextarea(el);
              }
            }}
            value={form[field.key]}
            onChange={setField(field.key)}
            disabled={isSubmitting}
            data-error={Boolean(errors[field.key])}
            aria-invalid={Boolean(errors[field.key])}
            aria-describedby={errors[field.key] ? `${formId}-${field.key}-error` : undefined}
            className={underlineTextarea}
          />
          {errors[field.key] && (
            <p
              id={`${formId}-${field.key}-error`}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink"
            >
              {errors[field.key]}
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-col items-start gap-3 py-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 border border-ink px-5 py-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-snow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          {isSubmitting ? "Sending…" : "Send →"}
        </button>
        {status === "error" && (
          <p role="alert" className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
