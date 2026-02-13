!macro customInstall
  DetailPrint "Attempting to unblock installed files..."
  nsExec::Exec 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path \"$INSTDIR\" -Recurse | Unblock-File -ErrorAction SilentlyContinue"'
!macroend
