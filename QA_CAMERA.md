# Camera & QR Scanner QA Checklist

## iOS Device Testing
- [ ] First camera use prompts for permission → user allows → photo capture works
- [ ] QR scan from still photo successfully decodes QR codes
- [ ] User denies permission → "Open Settings" button works and opens Settings app
- [ ] iOS Simulator → auto-fallbacks to photo picker from gallery

## Android Device Testing (13/14+)
- [ ] Camera permission prompt → user allows → photo capture works
- [ ] Gallery photo picker works without crashes (READ_MEDIA_IMAGES permission)
- [ ] User denies permission → "Open Settings" button works and opens app settings
- [ ] No legacy storage permission errors on Android 13+

## Navigation & State Management
- [ ] Navigate away while scanning → no stuck/black webview
- [ ] App goes to background during scan → cleanly cancels
- [ ] Subsequent scan attempts work after cancellation/errors
- [ ] No memory leaks from repeated camera usage

## Platform Detection
- [ ] Web platform uses getUserMedia fallback
- [ ] Native platform uses Capacitor Camera API
- [ ] iOS Simulator gracefully falls back to web scanner
- [ ] Error states show appropriate UI with retry options

## Permission States
- [ ] Granted → immediate camera access
- [ ] Limited (iOS) → camera access with restrictions notice
- [ ] Denied → settings prompt with deep link
- [ ] Prompt → permission request shows native dialog

## QR Code Detection
- [ ] Various QR code formats decode correctly
- [ ] Poor lighting conditions handled gracefully
- [ ] No QR code in image → clear error message
- [ ] Multiple QR codes → picks first detected

## Error Recovery
- [ ] Camera busy → informative error message
- [ ] Camera unavailable → fallback options
- [ ] Permission timeout → retry mechanism
- [ ] Network issues don't break camera functionality