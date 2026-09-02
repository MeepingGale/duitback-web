/** A looping mock of the real screens — so someone who has never opened Safari's share sheet
 *  can see exactly what to tap. Pure CSS/SVG (see .idemo rules): no video, works offline. */
const ShareIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" /><path d="m8 7 4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8" /><path d="M8 12h8" />
  </svg>
);
const Tap = ({ style }: { style: React.CSSProperties }) => <span className="idemo-tap" style={style} aria-hidden="true" />;

export type DemoWhere = 'bottom' | 'top-right' | 'mac';

export function InstallDemo({ phase, where }: { phase: 1 | 2 | 3; where: DemoWhere }) {
  if (where === 'mac') {
    return (
      <div className="idemo idemo-mac" role="img" aria-label="Animation: the File menu opens and Add to Dock is chosen">
        <div className="idemo-menubar"><span></span><span className="idemo-file">File</span><span>Edit</span><span>View</span></div>
        <div className="idemo-menu">
          <div>New Window</div><div>New Tab</div><div className="idemo-row-hot"><PlusIcon /> Add to Dock…</div><div>Close Window</div>
        </div>
        <Tap style={{ left: 30, top: 6 }} />
        <Tap style={{ left: 60, top: 64, animationDelay: '1.2s' }} />
      </div>
    );
  }
  const bottom = where === 'bottom';
  return (
    <div className={'idemo idemo-p' + phase} role="img" aria-label={phase === 1 ? 'Animation: tapping the Share button' : phase === 2 ? 'Animation: the share sheet slides up and Add to Home Screen is tapped' : 'Animation: tapping Add, then the app icon appears on the Home Screen'}>
      <div className="idemo-screen">
        <div className="idemo-addr"><span className="idemo-url">duitback</span>{!bottom && <span className="idemo-share-top"><ShareIcon />{phase === 1 && <Tap style={{ right: -6, top: -6 }} />}</span>}</div>
        <div className="idemo-page"><i style={{ width: '55%' }} /><i style={{ width: '80%' }} /><i className="idemo-hero" /><i style={{ width: '70%' }} /><i style={{ width: '60%' }} /></div>
        {bottom && (
          <div className="idemo-toolbar"><span>‹</span><span>›</span><span className="idemo-share-btn"><ShareIcon size={15} />{phase === 1 && <Tap style={{ left: -4, top: -4 }} />}</span><span>▢</span><span>▣</span></div>
        )}
        {phase === 2 && (
          <div className="idemo-sheet">
            <div className="idemo-grab" />
            <div className="idemo-sheet-row">Copy</div>
            <div className="idemo-sheet-row">Add to Reading List</div>
            <div className="idemo-sheet-row">Add Bookmark</div>
            <div className="idemo-sheet-row idemo-row-hot"><PlusIcon /> Add to Home Screen<Tap style={{ right: 8, top: 2 }} /></div>
            <div className="idemo-sheet-row">Find on Page</div>
          </div>
        )}
        {phase === 3 && (
          <>
            <div className="idemo-dialog">
              <div className="idemo-dialog-bar"><span>Cancel</span><b>Add to Home Screen</b><span className="idemo-add">Add<Tap style={{ right: -6, top: -6 }} /></span></div>
              <div className="idemo-dialog-body"><span className="idemo-appicon">d.</span><span>DuitBack</span></div>
            </div>
            <div className="idemo-home"><span className="idemo-appicon idemo-appicon-pop">d.</span><span className="idemo-home-label">DuitBack</span></div>
          </>
        )}
      </div>
    </div>
  );
}
