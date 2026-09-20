// Each authored app preview shares a 60 fps intro. Frame 209 is the finished
// code view, before the generated dashboard replaces it. Clamp animation time
// rather than wall time, so a hidden tab or slow frame cannot skip this stop.
const codeFrames = {sidekickApp1:209, sidekickApp2:209, sidekickApp3:209, sidekickApp4:209, sidekickApp5:209};
export function holdVesselCode(rive, artboard, element) {
  const frames = codeFrames[artboard];
  if (!frames || !rive || !element) return () => {};
  const machine = rive.animator?.stateMachines?.[0];
  if (!machine) return () => {};
  const advance = machine.advanceAndApply;
  let elapsed = 0, finished = false;
  const end = frames / 60;
  element.dataset.vesselCode = 'playing';
  machine.advanceAndApply = function (seconds) {
    const step = Math.max(0, Math.min(seconds, end - elapsed));
    elapsed += step;
    element.dataset.vesselCodeTime = elapsed.toFixed(4);
    return advance.call(this, step);
  };
  const pause = () => {
    if (elapsed < end - 0.00001) return;
    finished = true;
    element.dataset.vesselCode = 'complete';
    rive.pause();
  };
  const preventResume = () => { if (finished) rive.pause(); };
  rive.on('advance', pause);
  rive.on('play', preventResume);
  return () => {
    machine.advanceAndApply = advance;
    rive.off('advance', pause);
    rive.off('play', preventResume);
    delete element.dataset.vesselCode;
    delete element.dataset.vesselCodeTime;
  };
}
