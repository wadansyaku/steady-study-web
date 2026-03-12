'use client';

import Script from 'next/script';
import { useEffect, useState, type FormEvent } from 'react';

type ContactFormProps = {
  initialService: 'learning' | 'studio' | 'automation';
  email: string;
  lineUrl: string;
  bookingUrl: string;
  turnstileSiteKey?: string;
};

type FormState = {
  service: 'learning' | 'studio' | 'automation';
  name: string;
  email: string;
  organization: string;
  role: string;
  message: string;
  consent: boolean;
};

const initialState: FormState = {
  service: 'learning',
  name: '',
  email: '',
  organization: '',
  role: '',
  message: '',
  consent: true,
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: Record<string, unknown>) => void;
      reset: (target?: string | HTMLElement) => void;
    };
    onAiYouMeTurnstileSuccess?: (token: string) => void;
  }
}

export function ContactForm({
  initialService,
  email,
  lineUrl,
  bookingUrl,
  turnstileSiteKey,
}: ContactFormProps) {
  const [formState, setFormState] = useState<FormState>({
    ...initialState,
    service: initialService,
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(false);

  useEffect(() => {
    window.onAiYouMeTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      window.onAiYouMeTurnstileSuccess = undefined;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    const response = await fetch(`/contact/submit/${formState.service}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formState,
        turnstileToken,
        sourcePath: `/contact?service=${formState.service}`,
      }),
    });

    const payload = await response.json().catch(() => ({})) as {
      ok?: boolean;
      message?: string;
    };

    if (response.ok && payload.ok) {
      setStatus('success');
      setMessage('送信を受け付けました。通常 1 営業日以内に返信します。');
      setFormState({
        ...initialState,
        service: formState.service,
      });
      setTurnstileToken('');
      return;
    }

    setStatus('error');
    setMessage(payload.message || '送信に失敗しました。メールまたは LINE でもご連絡いただけます。');
  }

  return (
    <div className="contact-form-shell">
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => {
            setTurnstileReady(true);
            if (window.turnstile) {
              window.turnstile.render('#turnstile-widget', {
                sitekey: turnstileSiteKey,
                callback: 'onAiYouMeTurnstileSuccess',
              });
            }
          }}
        />
      ) : null}
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__grid">
          <label>
            <span>相談先</span>
            <select
              value={formState.service}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  service: event.target.value as FormState['service'],
                }))
              }
            >
              <option value="learning">学習支援</option>
              <option value="studio">制作支援</option>
              <option value="automation">業務自動化</option>
            </select>
          </label>
          <label>
            <span>お名前</span>
            <input
              required
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label>
            <span>メールアドレス</span>
            <input
              required
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label>
            <span>組織名 / 学年など</span>
            <input
              value={formState.organization}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  organization: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>役割 / 立場</span>
            <input
              value={formState.role}
              onChange={(event) =>
                setFormState((current) => ({ ...current, role: event.target.value }))
              }
            />
          </label>
          <label className="contact-form__message">
            <span>相談内容</span>
            <textarea
              required
              rows={7}
              value={formState.message}
              onChange={(event) =>
                setFormState((current) => ({ ...current, message: event.target.value }))
              }
              placeholder="現状、困っていること、相談したい範囲を自由に書いてください。"
            />
          </label>
        </div>
        <label className="contact-form__consent">
          <input
            checked={formState.consent}
            onChange={(event) =>
              setFormState((current) => ({ ...current, consent: event.target.checked }))
            }
            type="checkbox"
          />
          <span>プライバシーポリシーに同意して送信する</span>
        </label>
        <div className="contact-form__meta">
          {turnstileSiteKey ? (
            <div id="turnstile-widget" className="turnstile-box" data-ready={turnstileReady} />
          ) : (
            <div className="turnstile-box turnstile-box--dev">
              開発環境では Turnstile を省略しています。
            </div>
          )}
          <button
            className="button button--solid"
            disabled={status === 'submitting' || !formState.consent}
            type="submit"
          >
            {status === 'submitting' ? '送信中...' : '問い合わせを送信'}
          </button>
        </div>
        {message ? (
          <p className={`contact-form__notice contact-form__notice--${status}`}>{message}</p>
        ) : null}
      </form>
      <div className="contact-form__fallbacks">
        <p>フォーム以外でも受け付けています。</p>
        <div className="contact-form__channels">
          <a className="button button--secondary" href={lineUrl} target="_blank" rel="noreferrer noopener">
            LINE で相談
          </a>
          <a className="button button--ghost" href={bookingUrl} target="_blank" rel="noreferrer noopener">
            面談枠を確認
          </a>
          <a className="button button--ghost" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      </div>
    </div>
  );
}
