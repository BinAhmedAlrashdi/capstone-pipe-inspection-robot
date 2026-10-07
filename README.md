# Pipe Inspection Robot Control

A local, dependency-free frontend draft for a capstone pipe-inspection robot.
All controls simulate display changes only. No commands are sent anywhere.

## Files

- `index.html`: dashboard structure, camera placeholder, motion controls, status, telemetry, and separate emergency stop.
- `styles.css`: dark dashboard theme, button states, keyboard focus styles, and responsive layouts.
- `script.js`: internal eight-direction mapping, text speed selection, simulated command logging, and both stop controls.
- `README.md`: launch instructions and prototype behavior.

## Launch locally from VS Code

1. In VS Code, choose **File > Open Folder** and select `C:\Capestone`.
2. In the Explorer, right-click `index.html` and choose **Reveal in File Explorer**.
3. Double-click `index.html` to open it in your browser. No install or build is required.
4. After editing files in VS Code, save and refresh the browser.

Optional: if you already use the **Live Server** extension, right-click
`index.html` in VS Code and choose **Open with Live Server** for automatic refresh.
The extension is not required.

## Simulated behavior

- Eight arrow buttons sit around a circular pad with a larger STOP at its center.
- Clicking an arrow highlights it and updates Motion and Direction readouts.
- Speed Control above the direction pad offers Slow, Normal, and Fast. Normal is
  selected on every page load. Selection stores only `slow`, `normal`, or `fast`.
- Selecting speed logs `Speed: slow` (or the chosen option) without changing motion.
  Each subsequent direction click logs the direction, angle, and selected speed.
- The interface displays direction names instead of numerical angles.
- Center STOP and EMERGENCY STOP clear the selected direction and display Stopped.
  Both retain the selected speed and log only `Command: STOP`.
- Emergency stop is a UI reset; it does not latch or require an unlock.
- Connection, camera, and controller remain Disconnected/Offline.
- Distance, speed, and uptime remain fixed mock values. The telemetry Direction
  value mirrors the simulated command; it is not a robot measurement.
- Reloading resets the simulation without logging or sending a command. Use Tab
  to focus buttons and Enter or Space to activate them.

## Internal direction mapping and future integration

| Arrow | Direction key | Internal angle |
| --- | --- | --- |
| Right | `right` | 0 |
| Upper right | `upRight` | 45 |
| Up / forward | `forward` | 90 |
| Upper left | `upLeft` | 135 |
| Left | `left` | 180 |
| Lower left | `downLeft` | 225 |
| Down / backward | `backward` | 270 |
| Lower right | `downRight` | 315 |

`directions` in `script.js` is the single source of truth for angles in degrees.
`sendDirection(direction, angle)` validates the pair, logs it, and updates the UI.
`selectedSpeed` stores the text preference; `setSpeed(speed)` validates the choice,
updates the highlighted button, and logs the selection. No numeric speeds are assigned.
`sendStop()` logs a separate STOP command and resets the simulated state to null.
Zero is a valid rightward direction; it must never be used to encode STOP.

The comments marked **FUTURE BACKEND HOOK** identify where the future browser-to-backend
calls belong in these two functions. The backend can then forward commands to
NanoPi/UART. No backend calls or UART code have been added to this frontend.
The **FUTURE BACKEND/UART SPEED HOOK** inside `sendDirection()` marks where
`selectedSpeed` should accompany direction and angle in a future backend request.
The backend can interpret this text later; speed selection itself sends nothing.

## Test the updated controls

1. Open the page using the instructions above, then open your browser's Developer
   Tools (F12 or Ctrl+Shift+I) and select **Console**.
2. Click each arrow. Check its highlight, the Motion/Direction readouts, and the
   logged direction and angle against the table. Up logs `FORWARD` and `90`.
3. Click the central STOP and then test EMERGENCY STOP after another direction.
   Both should log `Command: STOP`, clear every arrow, and display Stopped.
4. Click Right after stopping: it should log `RIGHT` and `0` and display Right.
5. Resize the browser to check that the circular pad remains symmetrical. Test
   Tab followed by Enter/Space to verify keyboard operation.

### Test speed selection

1. Refresh the page and confirm Normal is highlighted.
2. Click Slow, Normal, and Fast. Only the chosen button should remain highlighted;
   the console should log `Speed: slow`, `Speed: normal`, or `Speed: fast`.
3. After each selection, click Forward. Confirm the console output includes
   `Direction: FORWARD`, `Angle: 90`, and the currently selected text speed.
4. Click either STOP control. Motion should stop immediately, the selected speed
   should remain highlighted, and the console should log only `Command: STOP`.
5. Change speed while stopped: motion must stay Stopped. Refresh again to restore
   Normal. Current Speed telemetry stays at its existing mock value of 0.0 m/s.

The frontend contains no robot communication, WebRTC, ROS 2, NanoPi
integration, video streaming, or actual hardware control.

## Python robot draft

The separate [`robot/`](robot/README.md) package contains a beginner-friendly
Python architecture skeleton with simulated motors, command validation, a
polling watchdog, a manual emergency-stop latch, and camera/network/sensor
placeholders. It is not connected to the browser dashboard.

See [the Python guide](robot/README.md) for the complete directory structure,
hardware TODOs, and Recommended First Test. With Python 3.10+ installed, run
from this directory (use `python3` on Linux):

```sh
python -m robot.main --demo
python -m unittest discover -s robot/tests -v
```
