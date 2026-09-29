/** Shown while the book (49,500 homes, ten fires) loads. */
export default function BootScreen({ progress, error }) {
  return (
    <div className="boot" role="status" aria-live="polite">
      <div className="boot-inner">
        <span className="boot-word">Pyrome</span>
        {error ? (
          <p className="boot-error">The forecast data could not be loaded. Reload the page to try again.</p>
        ) : (
          <>
            <div className="boot-bar" aria-hidden="true">
              <span style={{ width: `${Math.max(8, progress * 100)}%` }} />
            </div>
            <p className="boot-text">Loading the book and the PRIMER forecast</p>
          </>
        )}
      </div>
    </div>
  )
}
