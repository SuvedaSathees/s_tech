/**
 * A slot for real photography or footage. Pass `src` (image or .mp4/.webm);
 * when empty, an intentional dark placeholder renders instead — so the layout
 * is final today and simply gets richer when assets arrive.
 */
type Props = {
  src?: string;
  alt?: string;
  className?: string;
  poster?: string;
  priority?: boolean;
  sizes?: string;
};

const isVideo = (s: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(s);

export default function MediaSlot({ src, alt = "", className = "", poster, priority = false }: Props) {
  if (!src) return <div className={`media media--empty ${className}`} aria-hidden="true" />;
  return (
    <div className={`media ${className}`}>
      {isVideo(src) ? (
        <video src={src} poster={poster} muted loop playsInline autoPlay preload="metadata" aria-label={alt} />
      ) : (
        // Plain <img> keeps the slot drop-in simple; switch to next/image for remote CDNs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />
      )}
    </div>
  );
}
