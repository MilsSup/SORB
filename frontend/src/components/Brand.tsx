import { Wordmark } from './Wordmark';

type BrandProps = { compact?: boolean; inverse?: boolean };

export function Brand({ compact = false, inverse = false }: BrandProps) {
  return <span className={`brand-component${compact ? ' brand-compact' : ''}${inverse ? ' brand-inverse' : ''}`} role="img" aria-label="Резервика">
    <svg className="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="12" className="brand-mark-tile" />
      <path transform="translate(4 0) skewX(-10)" d="M14 39V10h12a10 10 0 0 1 0 20h-5v9h-7Zm7-15h5a4 4 0 0 0 0-8h-5v8Z" className="brand-mark-letter" fillRule="evenodd" />
    </svg>
    {!compact && <Wordmark />}
  </span>;
}

